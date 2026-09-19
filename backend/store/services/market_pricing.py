"""
Market pricing service for JWELLES.

Responsibilities
----------------
- Talk to GoodReturns (https://www.goodreturns.in) SERVER-SIDE ONLY.
- Normalise response to INR / gram.
- Cache results so the frontend never triggers a per-request upstream call.
- Degrade gracefully: live -> cached -> stale -> unavailable.
  NEVER return a fabricated price (no 0, no placeholder).
- Keep stone pricing OUT of this module. Stone pricing lives in a
  separate module (stone_pricing.py) so a future professional provider
  (e.g. Rapaport) can be swapped in without touching metal logic.

GoodReturns specifics
---------------------
- GoodReturns is a public web source (HTML), not a JSON API.
- It provides INR/gram rates directly for gold (24K, 22K, 18K), silver,
  and platinum. No troy-ounce conversion is applied.
- Palladium is NOT available from GoodReturns. It is marked UNAVAILABLE.

Security
--------
- No API key required. This module is server-side only.
- The upstream URL is truncated in logs.

Configuration (backend env)
---------------------------
GOODRETURNS_GOLD_URL         optional - default https://www.goodreturns.in/gold-rates/
GOODRETURNS_SILVER_URL       optional - default https://www.goodreturns.in/silver-rates/
GOODRETURNS_PLATINUM_URL     optional - default https://www.goodreturns.in/platinum-rates/
GOODRETURNS_CACHE_TTL        optional - seconds, default 300 (5 min)
GOODRETURNS_CACHE_MAX_STALE  optional - seconds, default 3600 (1 hour)
GOODRETURNS_REQUEST_TIMEOUT  optional - seconds, default 10
"""

from __future__ import annotations

import logging
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone as dt_timezone
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional

from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

CACHE_KEY = "jwelles:market_prices:v2"

# Metals we surface in the UI.
SUPPORTED_METALS: List[Dict[str, str]] = [
    {"key": "gold",      "label": "Gold"},
    {"key": "silver",    "label": "Silver"},
    {"key": "platinum",  "label": "Platinum"},
    {"key": "palladium", "label": "Palladium"},
]

# Data status values (documented contract with the frontend).
STATUS_LIVE = "live"
STATUS_CACHED = "cached"
STATUS_STALE = "stale"
STATUS_UNAVAILABLE = "unavailable"

UNIT_GRAM = "gram"
CURRENCY_INR = "INR"


@dataclass
class MetalPrice:
    material: str
    material_type: str = "metal"
    price: Optional[str] = None            # stringified Decimal, or None
    currency: str = CURRENCY_INR
    unit: str = UNIT_GRAM
    source: str = "goodreturns"
    timestamp: Optional[str] = None        # ISO8601 with tz
    change: Optional[str] = None           # absolute change per gram
    change_percentage: Optional[str] = None
    data_status: str = STATUS_UNAVAILABLE
    note: Optional[str] = None
    conversion_note: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        return {k: v for k, v in data.items() if v is not None}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(dt_timezone.utc).isoformat()


def _str_or_none(value: Optional[Decimal]) -> Optional[str]:
    if value is None:
        return None
    return format(value, "f")


def _unavailable_metal(label: str, note: str) -> MetalPrice:
    return MetalPrice(
        material=label,
        data_status=STATUS_UNAVAILABLE,
        timestamp=_now_iso(),
        note=note,
    )


# ---------------------------------------------------------------------------
# Normalisation from GoodReturns payload
# ---------------------------------------------------------------------------

def _normalise_goodreturns_payload(
    payload: Dict[str, Any]
) -> List[MetalPrice]:
    """
    Convert the GoodReturns provider dict into our canonical list of
    MetalPrice objects.

    Gold: 24K, 22K, 18K are separate rates. The market_pricing contract
    exposes a single "Gold" entry whose price is the 24K rate. The
    purity-specific rates are stored in the live_components of the
    product_pricing engine, but here we surface the 24K rate as the
    canonical Gold price.

    Actually, we surface ALL gold purities as separate material entries
    so product_pricing can pick the correct one based on the product's
    purity field.
    """
    results: List[MetalPrice] = []
    fetch_ts = _now_iso()

    # --- Gold (three purities as separate material entries) ---
    for purity_label, key, change_key in [
        ("Gold 24K", "gold_24k", "change_gold_24k"),
        ("Gold 22K", "gold_22k", "change_gold_22k"),
        ("Gold 18K", "gold_18k", "change_gold_18k"),
    ]:
        raw_price = payload.get(key)
        if raw_price is None:
            results.append(
                _unavailable_metal(purity_label, "No price returned by provider.")
            )
            continue
        try:
            price_dec = Decimal(str(raw_price))
        except (InvalidOperation, ValueError, TypeError):
            results.append(
                _unavailable_metal(purity_label, "Malformed price from provider.")
            )
            continue
        if price_dec <= 0:
            results.append(
                _unavailable_metal(purity_label, "Non-positive price from provider.")
            )
            continue

        change_val = payload.get(change_key)
        change_str = _str_or_none(
            Decimal(str(change_val)) if change_val is not None else None
        )

        results.append(
            MetalPrice(
                material=purity_label,
                price=_str_or_none(price_dec),
                source="goodreturns",
                timestamp=fetch_ts,
                change=change_str,
                data_status=STATUS_LIVE,
            )
        )

    # --- Silver ---
    raw_silver = payload.get("silver")
    if raw_silver is not None:
        try:
            silver_dec = Decimal(str(raw_silver))
        except (InvalidOperation, ValueError, TypeError):
            silver_dec = None
        if silver_dec is not None and silver_dec > 0:
            change_val = payload.get("change_silver")
            change_str = _str_or_none(
                Decimal(str(change_val)) if change_val is not None else None
            )
            results.append(
                MetalPrice(
                    material="Silver",
                    price=_str_or_none(silver_dec),
                    source="goodreturns",
                    timestamp=fetch_ts,
                    change=change_str,
                    data_status=STATUS_LIVE,
                )
            )
        else:
            results.append(
                _unavailable_metal("Silver", "Malformed or non-positive price from provider.")
            )
    else:
        results.append(
            _unavailable_metal("Silver", "No price returned by provider.")
        )

    # --- Platinum ---
    raw_plat = payload.get("platinum")
    if raw_plat is not None:
        try:
            plat_dec = Decimal(str(raw_plat))
        except (InvalidOperation, ValueError, TypeError):
            plat_dec = None
        if plat_dec is not None and plat_dec > 0:
            change_val = payload.get("change_platinum")
            change_str = _str_or_none(
                Decimal(str(change_val)) if change_val is not None else None
            )
            results.append(
                MetalPrice(
                    material="Platinum",
                    price=_str_or_none(plat_dec),
                    source="goodreturns",
                    timestamp=fetch_ts,
                    change=change_str,
                    data_status=STATUS_LIVE,
                )
            )
        else:
            results.append(
                _unavailable_metal("Platinum", "Malformed or non-positive price from provider.")
            )
    else:
        results.append(
            _unavailable_metal("Platinum", "No price returned by provider.")
        )

    # --- Palladium (always unavailable from GoodReturns) ---
    results.append(
        _unavailable_metal(
            "Palladium",
            "GoodReturns does not provide a verified precious-metal palladium rate.",
        )
    )

    return results


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _cache_ttl() -> int:
    return int(getattr(settings, "GOODRETURNS_CACHE_TTL", 300))


def _cache_max_stale() -> int:
    return int(getattr(settings, "GOODRETURNS_CACHE_MAX_STALE", 3600))


def _get_cached_age_seconds(cached: Dict[str, Any]) -> int:
    """
    Compute the age of a cached entry from its stored timestamp.

    The previous implementation stored 'age_seconds' as a static field
    which was never recalculated, so cache freshness was broken. We now
    store 'cached_at' (epoch seconds) and compute age on read.
    """
    cached_at = cached.get("cached_at")
    if cached_at is not None:
        try:
            return int(time.time() - int(cached_at))
        except (TypeError, ValueError):
            pass
    # Fallback: if an older-format cache entry exists, treat it as stale.
    return _cache_max_stale() + 1


def _refresh_cache() -> Optional[Dict[str, Any]]:
    """
    Fetch from GoodReturns and normalise. Returns the response dict on
    success, or None if the provider failed or produced no valid prices.
    """
    from .goodreturns_pricing import get_goodreturns_prices

    payload = get_goodreturns_prices()
    if payload is None:
        return None

    metals = _normalise_goodreturns_payload(payload)
    if not metals:
        return None

    # If every metal came back unavailable, treat as failure.
    if all(m.data_status == STATUS_UNAVAILABLE for m in metals):
        return None

    serialised = [m.to_dict() for m in metals]
    now_epoch = int(time.time())
    result = {
        "currency": CURRENCY_INR,
        "unit": UNIT_GRAM,
        "metals": serialised,
        "last_updated": _now_iso(),
        "cache_ttl_seconds": _cache_ttl(),
    }

    cache.set(
        CACHE_KEY,
        {
            "metals": serialised,
            "last_updated": result["last_updated"],
            "cached_at": now_epoch,
        },
        timeout=_cache_max_stale(),
    )
    return result


def get_metal_prices() -> Dict[str, Any]:
    """
    Returns a dict shaped for the API response:
        {
          "currency": "INR",
          "unit": "gram",
          "metals": [ {MetalPrice.to_dict()}, ... ],
          "last_updated": "<iso>",
          "cache_ttl_seconds": int,
        }
    """
    cached = cache.get(CACHE_KEY)
    now = _now_iso()

    if cached and isinstance(cached, dict):
        age = _get_cached_age_seconds(cached)
        metals = cached.get("metals") or []

        # Fresh cache — serve as-is, tagged "cached".
        if age < _cache_ttl():
            for m in metals:
                if m.get("data_status") == STATUS_LIVE:
                    m["data_status"] = STATUS_CACHED
            return {
                "currency": CURRENCY_INR,
                "unit": UNIT_GRAM,
                "metals": metals,
                "last_updated": cached.get("last_updated") or now,
                "cache_ttl_seconds": _cache_ttl(),
            }

        # Stale cache — try to refresh; fall back to stale data if refresh fails.
        if age < _cache_max_stale():
            refreshed = _refresh_cache()
            if refreshed:
                for m in refreshed["metals"]:
                    if m.get("data_status") == STATUS_LIVE:
                        m["data_status"] = STATUS_CACHED
                return refreshed
            # Refresh failed — serve stale.
            for m in metals:
                m["data_status"] = STATUS_STALE
            return {
                "currency": CURRENCY_INR,
                "unit": UNIT_GRAM,
                "metals": metals,
                "last_updated": cached.get("last_updated") or now,
                "cache_ttl_seconds": _cache_ttl(),
                "note": "Upstream provider unavailable; showing last cached values.",
            }

    # No usable cache — try a fresh fetch.
    fresh = _refresh_cache()
    if fresh:
        return fresh

    # No cache, no upstream — return explicit unavailable state per metal.
    return {
        "currency": CURRENCY_INR,
        "unit": UNIT_GRAM,
        "metals": [
            _unavailable_metal(
                m["label"],
                "Live market pricing is currently unavailable. Please try again shortly.",
            ).to_dict()
            for m in SUPPORTED_METALS
        ],
        "last_updated": now,
        "cache_ttl_seconds": _cache_ttl(),
        "note": "External market data provider could not be reached.",
    }


def get_market_prices() -> Dict[str, Any]:
    """
    Top-level entry point used by the view. Combines metal pricing with
    the (independent) stone pricing module.
    """
    from .stone_pricing import get_stone_prices  # local import avoids cycles

    metals_block = get_metal_prices()
    stones_block = get_stone_prices()

    return {
        "currency": metals_block.get("currency", CURRENCY_INR),
        "unit": metals_block.get("unit", UNIT_GRAM),
        "metals": metals_block.get("metals", []),
        "stones": stones_block,
        "last_updated": metals_block.get("last_updated"),
        "cache_ttl_seconds": metals_block.get("cache_ttl_seconds"),
        **(
            {"note": metals_block["note"]}
            if metals_block.get("note")
            else {}
        ),
    }