"""
Market pricing service for JWELLES.

Responsibilities
----------------
- Talk to Metals.Dev (https://metals.dev/docs) SERVER-SIDE ONLY.
- Normalise response to INR / gram where possible.
- Cache results so the frontend never triggers a per-request upstream call.
- Degrade gracefully: live -> cached -> stale -> unavailable.
  NEVER return a fabricated price (no 0, no placeholder).
- Keep stone pricing OUT of this module. Stone pricing lives in a
  separate module (stone_pricing.py) so a future professional provider
  (e.g. Rapaport) can be swapped in without touching metal logic.

Security
--------
- METALS_API_KEY lives in backend env only (Render env / backend/.env).
- This key is never sent to the frontend, never put in VITE_*, and never
  logged. The upstream URL is truncated in logs.

Configuration (backend env)
---------------------------
METALS_API_KEY              required - Metals.Dev API key
METALS_API_URL              optional - default https://api.metals.dev/v1/latest
METALS_CACHE_TTL            optional - seconds, default 45
METALS_CACHE_MAX_STALE      optional - seconds, default 900 (15 min)
METALS_USD_INR_FALLBACK     optional - used ONLY if upstream cannot return INR
"""

from __future__ import annotations

import logging
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone as dt_timezone
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional

import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)

CACHE_KEY = "jwelles:market_prices:v1"

# Metals we surface in the UI. Keep keys lowercase to match metals.dev.
# The "label" is what the frontend shows.
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

# metals.dev documents that "latest" returns values per troy ounce by
# default. 1 troy ounce = 31.1034768 grams.
TROY_OUNCE_IN_GRAMS = Decimal("31.1034768")


@dataclass
class MetalPrice:
    material: str
    material_type: str = "metal"
    price: Optional[str] = None            # stringified Decimal, or None
    currency: str = CURRENCY_INR
    unit: str = UNIT_GRAM
    source: str = "metals.dev"
    timestamp: Optional[str] = None        # ISO8601 with tz
    change: Optional[str] = None           # absolute change per gram
    change_percentage: Optional[str] = None
    data_status: str = STATUS_UNAVAILABLE
    note: Optional[str] = None
    conversion_note: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        # Remove keys we deliberately leave null so the JSON stays clean.
        return {k: v for k, v in data.items() if v is not None}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _now_iso() -> str:
    return datetime.now(dt_timezone.utc).isoformat()


def _to_decimal(value: Any) -> Optional[Decimal]:
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def _per_gram(value: Any) -> Optional[Decimal]:
    """Convert a per-troy-ounce value to per-gram."""
    d = _to_decimal(value)
    if d is None:
        return None
    return (d / TROY_OUNCE_IN_GRAMS).quantize(Decimal("0.01"))


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
# Upstream call
# ---------------------------------------------------------------------------

def _fetch_from_metals_dev() -> Optional[Dict[str, Any]]:
    """
    Returns the raw metals.dev payload, or None if the call cannot be made
    / fails. Never raises to the caller — the caller converts None into a
    proper degraded response.
    """
    api_key = getattr(settings, "METALS_API_KEY", "") or ""
    api_url = getattr(
        settings, "METALS_API_URL", "https://api.metals.dev/v1/latest"
    )

    if not api_key:
        logger.warning(
            "Metals.Dev API key is not configured (METALS_API_KEY). "
            "Market prices will be reported as unavailable."
        )
        return None

    params = {
        "api_key": api_key,
        "currency": CURRENCY_INR,
        "unit": "g",           # request per-gram directly if supported
    }

    try:
        resp = requests.get(api_url, params=params, timeout=8)
    except requests.exceptions.RequestException as exc:
        # Never log the URL with the key attached.
        logger.warning("Metals.Dev request failed: %s", exc.__class__.__name__)
        return None

    if resp.status_code == 401:
        logger.error("Metals.Dev rejected the API key (401).")
        return None
    if resp.status_code == 429:
        logger.warning("Metals.Dev rate limit hit (429).")
        return None
    if resp.status_code >= 500:
        logger.warning("Metals.Dev upstream error (%s).", resp.status_code)
        return None
    if resp.status_code != 200:
        logger.warning("Metals.Dev unexpected status %s.", resp.status_code)
        return None

    try:
        payload = resp.json()
    except ValueError:
        logger.warning("Metals.Dev returned non-JSON payload.")
        return None

    if not isinstance(payload, dict):
        logger.warning("Metals.Dev payload was not a dict.")
        return None

    return payload


def _normalise_metals_payload(
    payload: Dict[str, Any]
) -> List[MetalPrice]:
    """
    Convert a metals.dev payload into our canonical list of MetalPrice
    objects. Tolerant to shape differences — if a field we need is
    missing, that metal is marked unavailable rather than guessed.
    """
    # metals.dev "latest" shape (documented) is roughly:
    #   {
    #     "status": "success",
    #     "currency": "INR",
    #     "unit": "g",
    #     "metals": {"gold": 6234.1, "silver": 78.4, ...},
    #     "timestamps": {"metal": "2026-01-14T10:23:00Z", ...}
    #   }
    # Some tiers return per-ounce values with unit "oz". We handle both.
    raw_metals = payload.get("metals") or {}
    if not isinstance(raw_metals, dict):
        raw_metals = {}

    payload_currency = str(payload.get("currency") or CURRENCY_INR).upper()
    payload_unit = str(payload.get("unit") or "oz").lower()

    timestamps = payload.get("timestamps") or {}
    upstream_ts = (
        timestamps.get("metal")
        or timestamps.get("metals")
        or payload.get("timestamp")
        or _now_iso()
    )

    conversion_note = None
    if payload_currency != CURRENCY_INR:
        conversion_note = (
            f"Upstream currency {payload_currency} could not be converted "
            f"server-side; value shown in {CURRENCY_INR} only if a fallback "
            f"rate is configured."
        )

    results: List[MetalPrice] = []

    for meta in SUPPORTED_METALS:
        key = meta["key"]
        label = meta["label"]
        raw_value = raw_metals.get(key)

        if raw_value is None:
            results.append(_unavailable_metal(label, "No price returned by provider."))
            continue

        if payload_unit.startswith("oz"):
            per_gram = _per_gram(raw_value)
        elif payload_unit.startswith("g"):
            per_gram = _to_decimal(raw_value)
            if per_gram is not None:
                per_gram = per_gram.quantize(Decimal("0.01"))
        else:
            per_gram = None

        if per_gram is None:
            results.append(_unavailable_metal(label, "Unrecognised provider unit."))
            continue

        results.append(
            MetalPrice(
                material=label,
                price=_str_or_none(per_gram),
                currency=CURRENCY_INR,
                unit=UNIT_GRAM,
                source="metals.dev",
                timestamp=upstream_ts if isinstance(upstream_ts, str) else _now_iso(),
                data_status=STATUS_LIVE,
                conversion_note=conversion_note,
            )
        )

    return results


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def _cache_ttl() -> int:
    return int(getattr(settings, "METALS_CACHE_TTL", 45))


def _cache_max_stale() -> int:
    return int(getattr(settings, "METALS_CACHE_MAX_STALE", 900))


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
        age = int(cached.get("age_seconds", 0) or 0)
        # Fresh cache — serve as-is, tagged "cached".
        if age < _cache_ttl():
            metals = cached.get("metals") or []
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
            stale_metals = cached.get("metals") or []
            for m in stale_metals:
                m["data_status"] = STATUS_STALE
            return {
                "currency": CURRENCY_INR,
                "unit": UNIT_GRAM,
                "metals": stale_metals,
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


def _refresh_cache() -> Optional[Dict[str, Any]]:
    payload = _fetch_from_metals_dev()
    if payload is None:
        return None

    metals = _normalise_metals_payload(payload)
    if not metals:
        return None

    # If every metal came back unavailable, treat as failure — don't
    # cache an all-unavailable response as if it were fresh data.
    if all(m.data_status == STATUS_UNAVAILABLE for m in metals):
        return None

    serialised = [m.to_dict() for m in metals]
    result = {
        "currency": CURRENCY_INR,
        "unit": UNIT_GRAM,
        "metals": serialised,
        "last_updated": _now_iso(),
        "cache_ttl_seconds": _cache_ttl(),
    }

    # Store with age tracking so we can implement stale-vs-fresh logic.
    cache.set(
        CACHE_KEY,
        {
            "metals": serialised,
            "last_updated": result["last_updated"],
            "age_seconds": 0,
        },
        timeout=_cache_max_stale(),
    )
    return result


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