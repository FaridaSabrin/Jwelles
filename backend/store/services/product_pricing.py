"""
Product pricing engine for JWELLES.

Bridges the existing market-pricing and stone-pricing services to the
Product catalog. This module is the ONLY place allowed to compute a
product's live price. Views, serializers and checkout all call into
here — there is no duplicated pricing logic anywhere else.

Design contract
---------------
- `calculate_product_price(product)` returns a `PricedProduct` dataclass
  with the final price plus metadata the API can expose.
- The engine NEVER invents prices. If live data is unavailable, it
  falls back to the stored `Product.price` and flags the mode as
  `fallback_static`.
- All money math uses `Decimal`. No floats anywhere.
- The engine reuses `get_market_prices()` — it does NOT call Metals.Dev
  or OpenFacet directly. Caching is therefore inherited for free.

Pricing modes
-------------
"live"            -> live metal rate(s) + optional manual stone value
"hybrid"          -> live metal rate(s) + manual stone value
"static"          -> no live component; returns Product.price
"fallback_static" -> live pricing requested but data unavailable;
                     returns Product.price so the UI never breaks
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Optional

from ..models import Product

logger = logging.getLogger(__name__)

TWO_PLACES = Decimal("0.01")


# ---------------------------------------------------------------------------
# Metal / purity normalisation
# ---------------------------------------------------------------------------

# Map free-text `Product.metal_type` to the keys used by market_pricing.py.
_METAL_ALIASES = {
    "gold": "gold",
    "yellow gold": "gold",
    "white gold": "gold",
    "rose gold": "gold",
    "18k gold": "gold",
    "22k gold": "gold",
    "24k gold": "gold",
    "silver": "silver",
    "sterling silver": "silver",
    "925 silver": "silver",
    "platinum": "platinum",
    "palladium": "palladium",
}

# Karat numbers appearing in `Product.purity`, e.g. "18K", "22K", "24K".
_KARAT_RE = re.compile(r"(\d{2})\s*k", re.IGNORECASE)
# Sterling silver purity marker.
_STERLING_RE = re.compile(r"\b(925|sterling)\b", re.IGNORECASE)


def _normalise_metal(metal_type: Optional[str]) -> Optional[str]:
    if not metal_type:
        return None
    key = str(metal_type).strip().lower()
    return _METAL_ALIASES.get(key)


def _purity_factor(metal_key: str, purity: Optional[str]) -> Decimal:
    """
    Convert `Product.purity` into a multiplier on the 24K spot rate.

    - Gold / Platinum / Palladium: karat / 24  (18K -> 0.75, 22K -> 0.9167)
    - Silver: 0.925 if "925" or "sterling" present, else 1.0 (spot silver
      from Metals.Dev is already the fine-silver equivalent; using 0.925
      for sterling is the standard convention)
    - Anything unparseable: 1.0 (do not silently downgrade the price)
    """
    if not purity:
        return Decimal("1")

    text = str(purity)

    if metal_key == "silver":
        if _STERLING_RE.search(text):
            return Decimal("0.925")
        return Decimal("1")

    match = _KARAT_RE.search(text)
    if match:
        try:
            karat = Decimal(match.group(1))
        except InvalidOperation:
            return Decimal("1")
        if karat <= 0 or karat > 24:
            return Decimal("1")
        return (karat / Decimal("24")).quantize(
            Decimal("0.000001"), rounding=ROUND_HALF_UP
        )

    return Decimal("1")


# ---------------------------------------------------------------------------
# Result object
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PricedProduct:
    base_price: Decimal          # the stored Product.price
    calculated_price: Decimal    # what the API should expose as `price`
    pricing_mode: str            # live | hybrid | static | fallback_static
    pricing_source: str          # e.g. "metal_market", "static", "fallback"
    price_updated_at: Optional[str]
    live_components: dict        # diagnostic breakdown (not exposed to UI)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _quantise(value: Decimal) -> Decimal:
    return value.quantize(TWO_PLACES, rounding=ROUND_HALF_UP)


def _get_live_rate_per_gram(metal_key: str) -> tuple[Optional[Decimal], Optional[str], str]:
    """
    Pull the per-gram INR rate for `metal_key` from the existing market
    pricing service. Returns (rate, timestamp, data_status).

    Reuses `get_market_prices()` — no direct upstream calls here, so all
    of the existing live/cached/stale/unavailable handling is inherited.
    """
    # Local import: avoids a circular import at module load and lets the
    # existing market_pricing module stay untouched.
    from .market_pricing import get_market_prices

    try:
        block = get_market_prices()
    except Exception:
        logger.exception("Market pricing service raised; falling back to static.")
        return None, None, "unavailable"

    metals = block.get("metals") or []
    wanted_label = metal_key.capitalize()
    for entry in metals:
        if (entry.get("material") or "").lower() == metal_key:
            status = entry.get("data_status")
            if status in ("live", "cached", "stale"):
                raw_price = entry.get("price")
                if raw_price is None:
                    return None, None, "unavailable"
                try:
                    rate = Decimal(str(raw_price))
                except InvalidOperation:
                    return None, None, "unavailable"
                if rate <= 0:
                    return None, None, "unavailable"
                return rate, entry.get("timestamp"), status
            return None, None, "unavailable"

    logger.warning("Metal '%s' not present in market pricing payload.", wanted_label)
    return None, None, "unavailable"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def calculate_product_price(product: Product) -> PricedProduct:
    """
    Compute the final price for a single product.

    Safe to call on every product in a list — the underlying market rate
    is fetched once per request (shared cache) regardless of how many
    products are priced.
    """
    stored_price = _safe_decimal(product.price, fallback=Decimal("0"))
    base_price = _safe_decimal(product.original_price, fallback=stored_price)
    making_charge_percent = _safe_decimal(
        getattr(product, "making_charge_percent", None), fallback=Decimal("0")
    )
    stone_value = _safe_decimal(
        getattr(product, "stone_value", None), fallback=Decimal("0")
    )
    weight = _safe_decimal(product.weight, fallback=None)

    metal_key = _normalise_metal(product.metal_type)

    # No metal, no weight -> pure static product.
    if not metal_key or weight is None or weight <= 0:
        return PricedProduct(
            base_price=base_price,
            calculated_price=stored_price,
            pricing_mode="static",
            pricing_source="static",
            price_updated_at=None,
            live_components={},
        )

    rate, timestamp, status = _get_live_rate_per_gram(metal_key)

    if rate is None:
        # Live data requested but unavailable -> honest fallback.
        return PricedProduct(
            base_price=base_price,
            calculated_price=stored_price,
            pricing_mode="fallback_static",
            pricing_source="fallback",
            price_updated_at=None,
            live_components={"metal": metal_key, "status": status},
        )

    purity_factor = _purity_factor(metal_key, product.purity)
    metal_value = rate * purity_factor * weight
    making_charges = metal_value * (making_charge_percent / Decimal("100"))
    calculated = _quantise(metal_value + making_charges + stone_value)

    has_live_metal = True
    has_manual_stone = stone_value > 0
    mode = "hybrid" if has_manual_stone else "live"

    return PricedProduct(
        base_price=base_price,
        calculated_price=calculated,
        pricing_mode=mode,
        pricing_source="metal_market" if not has_manual_stone else "metal_market+manual_stone",
        price_updated_at=timestamp,
        live_components={
            "metal": metal_key,
            "rate_per_gram_24k": str(rate),
            "purity_factor": str(purity_factor),
            "weight_grams": str(weight),
            "metal_value": str(_quantise(metal_value)),
            "making_charge_percent": str(making_charge_percent),
            "making_charges": str(_quantise(making_charges)),
            "stone_value": str(stone_value),
            "data_status": status,
        },
    )


def calculate_prices_for_products(products) -> dict[int, PricedProduct]:
    """
    Batch helper. Fetches the market rate ONCE (via the shared cache in
    market_pricing.get_market_prices) and applies it to every product,
    so a page of 20 gold products triggers at most one upstream call.

    Returns {product_id: PricedProduct}.
    """
    results: dict[int, PricedProduct] = {}
    for product in products:
        results[product.id] = calculate_product_price(product)
    return results


def _safe_decimal(value, fallback: Optional[Decimal]) -> Optional[Decimal]:
    if value is None:
        return fallback
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return fallback