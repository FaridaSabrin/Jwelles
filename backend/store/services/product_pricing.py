"""
Product pricing engine for JWELLES.

Bridges the existing market-pricing and stone-pricing services to the
Product catalog. This module is the ONLY place allowed to compute a
product's live price.

Design contract
---------------
- `calculate_product_price(product)` returns a `PricedProduct`.
- The engine NEVER invents prices.
- If live data is unavailable, it falls back to Product.price.
- All money math uses Decimal.
- The engine reuses `get_market_prices()`.
- Gold rates are selected by the product's actual purity:
    24K -> Gold 24K market rate
    22K -> Gold 22K market rate
    18K -> Gold 18K market rate
- Gold purity is NOT multiplied again because GoodReturns already
  provides purity-specific rates.
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

_KARAT_RE = re.compile(
    r"(\d{2})\s*k",
    re.IGNORECASE,
)

_STERLING_RE = re.compile(
    r"\b(925|sterling)\b",
    re.IGNORECASE,
)


def _normalise_metal(
    metal_type: Optional[str],
) -> Optional[str]:
    if not metal_type:
        return None

    key = str(metal_type).strip().lower()

    return _METAL_ALIASES.get(key)


def _get_gold_karat(
    purity: Optional[str],
) -> Optional[int]:
    """
    Extract Gold karat from Product.purity.

    Examples:
        24K -> 24
        22K -> 22
        18K -> 18
    """
    if not purity:
        return None

    match = _KARAT_RE.search(
        str(purity)
    )

    if not match:
        return None

    try:
        karat = int(match.group(1))
    except (TypeError, ValueError):
        return None

    if karat not in (18, 22, 24):
        return None

    return karat


def _silver_purity_factor(
    purity: Optional[str],
) -> Decimal:
    """
    Silver:
    - 925 / Sterling -> 0.925
    - otherwise -> 1.0

    GoodReturns silver is treated as the fine-silver market rate.
    """
    if not purity:
        return Decimal("1")

    if _STERLING_RE.search(str(purity)):
        return Decimal("0.925")

    return Decimal("1")


# ---------------------------------------------------------------------------
# Result object
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class PricedProduct:
    base_price: Decimal
    calculated_price: Decimal
    pricing_mode: str
    pricing_source: str
    price_updated_at: Optional[str]
    live_components: dict


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _quantise(
    value: Decimal,
) -> Decimal:
    return value.quantize(
        TWO_PLACES,
        rounding=ROUND_HALF_UP,
    )


def _get_live_rate_per_gram(
    metal_key: str,
    purity: Optional[str],
) -> tuple[
    Optional[Decimal],
    Optional[str],
    str,
    Optional[str],
]:
    """
    Pull the correct per-gram INR rate from market_pricing.

    Returns:

        (
            rate,
            timestamp,
            data_status,
            market_material
        )

    Examples:

        Gold + 24K -> Gold 24K
        Gold + 22K -> Gold 22K
        Gold + 18K -> Gold 18K

        Silver -> Silver
        Platinum -> Platinum
    """

    from .market_pricing import get_market_prices

    try:
        block = get_market_prices()

    except Exception:
        logger.exception(
            "Market pricing service raised; "
            "falling back to static."
        )

        return (
            None,
            None,
            "unavailable",
            None,
        )

    metals = block.get("metals") or []

    # ---------------------------------------------------------
    # Determine the exact market material to use.
    # ---------------------------------------------------------

    if metal_key == "gold":
        karat = _get_gold_karat(purity)

        if karat is None:
            logger.warning(
                "Gold product has unsupported or missing purity: %r",
                purity,
            )

            return (
                None,
                None,
                "unavailable",
                None,
            )

        wanted_material = f"gold {karat}k"

    elif metal_key == "silver":
        wanted_material = "silver"

    elif metal_key == "platinum":
        wanted_material = "platinum"

    elif metal_key == "palladium":
        wanted_material = "palladium"

    else:
        logger.warning(
            "Unsupported metal key '%s'.",
            metal_key,
        )

        return (
            None,
            None,
            "unavailable",
            None,
        )

    # ---------------------------------------------------------
    # Find exact material.
    # ---------------------------------------------------------

    for entry in metals:
        material = str(
            entry.get("material") or ""
        ).strip().lower()

        if material != wanted_material:
            continue

        status = entry.get(
            "data_status"
        )

        if status not in (
            "live",
            "cached",
            "stale",
        ):
            return (
                None,
                None,
                "unavailable",
                entry.get("material"),
            )

        raw_price = entry.get("price")

        if raw_price is None:
            return (
                None,
                None,
                "unavailable",
                entry.get("material"),
            )

        try:
            rate = Decimal(
                str(raw_price)
            )
        except (
            InvalidOperation,
            TypeError,
            ValueError,
        ):
            logger.warning(
                "Invalid market price for %s: %r",
                wanted_material,
                raw_price,
            )

            return (
                None,
                None,
                "unavailable",
                entry.get("material"),
            )

        if rate <= 0:
            return (
                None,
                None,
                "unavailable",
                entry.get("material"),
            )

        return (
            rate,
            entry.get("timestamp"),
            status,
            entry.get("material"),
        )

    logger.warning(
        "Market material '%s' not present in market pricing payload.",
        wanted_material,
    )

    return (
        None,
        None,
        "unavailable",
        None,
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def calculate_product_price(
    product: Product,
) -> PricedProduct:
    """
    Compute the final live price for a single product.

    Calculation:

        metal_rate × weight
        + making charges
        + manual stone value

    For Gold, the market rate already matches the product purity,
    so NO additional gold purity factor is applied.
    """

    stored_price = _safe_decimal(
        product.price,
        fallback=Decimal("0"),
    )

    base_price = _safe_decimal(
        product.original_price,
        fallback=stored_price,
    )

    making_charge_percent = _safe_decimal(
        getattr(
            product,
            "making_charge_percent",
            None,
        ),
        fallback=Decimal("0"),
    )

    stone_value = _safe_decimal(
        getattr(
            product,
            "stone_value",
            None,
        ),
        fallback=Decimal("0"),
    )

    weight = _safe_decimal(
        product.weight,
        fallback=None,
    )

    metal_key = _normalise_metal(
        product.metal_type
    )

    # ---------------------------------------------------------
    # Static product
    # ---------------------------------------------------------

    if (
        not metal_key
        or weight is None
        or weight <= 0
    ):
        return PricedProduct(
            base_price=base_price,
            calculated_price=stored_price,
            pricing_mode="static",
            pricing_source="static",
            price_updated_at=None,
            live_components={},
        )

    # ---------------------------------------------------------
    # Exact live market rate
    # ---------------------------------------------------------

    (
        rate,
        timestamp,
        status,
        market_material,
    ) = _get_live_rate_per_gram(
        metal_key,
        product.purity,
    )

    # ---------------------------------------------------------
    # Live rate unavailable
    # ---------------------------------------------------------

    if rate is None:
        return PricedProduct(
            base_price=base_price,
            calculated_price=stored_price,
            pricing_mode="fallback_static",
            pricing_source="fallback",
            price_updated_at=None,
            live_components={
                "metal": metal_key,
                "purity": str(
                    product.purity or ""
                ),
                "status": status,
            },
        )

    # ---------------------------------------------------------
    # Purity handling
    # ---------------------------------------------------------
    #
    # Gold:
    #   GoodReturns already gives:
    #       24K -> Gold 24K rate
    #       22K -> Gold 22K rate
    #       18K -> Gold 18K rate
    #
    # Therefore:
    #
    #       purity_factor = 1
    #
    # and we DO NOT multiply 22/24 or 18/24 again.
    #
    # Silver:
    #   925 / Sterling -> 0.925
    #   otherwise -> 1
    #
    # Platinum:
    #   GoodReturns rate is used directly.
    # ---------------------------------------------------------

    if metal_key == "gold":
        purity_factor = Decimal("1")

    elif metal_key == "silver":
        purity_factor = _silver_purity_factor(
            product.purity
        )

    else:
        purity_factor = Decimal("1")

    metal_value = (
        rate
        * purity_factor
        * weight
    )

    making_charges = (
        metal_value
        * (
            making_charge_percent
            / Decimal("100")
        )
    )

    calculated = _quantise(
        metal_value
        + making_charges
        + stone_value
    )

    has_manual_stone = (
        stone_value > 0
    )

    mode = (
        "hybrid"
        if has_manual_stone
        else "live"
    )

    pricing_source = (
        "metal_market+manual_stone"
        if has_manual_stone
        else "metal_market"
    )

    return PricedProduct(
        base_price=base_price,
        calculated_price=calculated,
        pricing_mode=mode,
        pricing_source=pricing_source,
        price_updated_at=timestamp,
        live_components={
            "metal": metal_key,
            "purity": str(
                product.purity or ""
            ),
            "market_material": market_material,
            "rate_per_gram": str(rate),
            "purity_factor": str(
                purity_factor
            ),
            "weight_grams": str(weight),
            "metal_value": str(
                _quantise(metal_value)
            ),
            "making_charge_percent": str(
                making_charge_percent
            ),
            "making_charges": str(
                _quantise(making_charges)
            ),
            "stone_value": str(
                stone_value
            ),
            "data_status": status,
        },
    )


def calculate_prices_for_products(
    products,
) -> dict[int, PricedProduct]:
    """
    Batch helper.

    The underlying market-pricing service has its own cache, so
    multiple products reuse the same market data.
    """

    results: dict[
        int,
        PricedProduct,
    ] = {}

    for product in products:
        results[product.id] = (
            calculate_product_price(product)
        )

    return results


# ---------------------------------------------------------------------------
# Decimal helper
# ---------------------------------------------------------------------------

def _safe_decimal(
    value,
    fallback: Optional[Decimal],
) -> Optional[Decimal]:
    if value is None:
        return fallback

    try:
        return Decimal(
            str(value)
        )

    except (
        InvalidOperation,
        TypeError,
        ValueError,
    ):
        return fallback