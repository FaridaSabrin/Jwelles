"""
Stone pricing service for JWELLES.

Design intent
-------------
Gemstone pricing is NOT a universal live market rate. Diamond pricing
depends on the 4Cs (carat, cut, colour, clarity). This module exposes
a provider-abstraction interface:

  Diamond  -> OpenFacet public matrix data (USD/carat) -> INR conversion
  Other stones -> reference_required (no live provider yet)

The module deliberately NEVER fabricates prices. If the provider or FX
conversion is unavailable and no usable cache exists, the Diamond item
is returned with price=None and data_status="unavailable".

Caching follows the same philosophy as market_pricing.py:
  live -> cached -> stale -> unavailable
"""

from __future__ import annotations

import logging
import math
from datetime import datetime, timezone as dt_timezone
from typing import Any, Dict, List, Optional, Tuple

import requests
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

SUPPORTED_STONES: List[str] = [
    "Diamond",
    "Ruby",
    "Emerald",
    "Sapphire",
    "Pearl",
    "Amethyst",
    "Topaz",
    "Garnet",
]

STATUS_LIVE = "live"
STATUS_CACHED = "cached"
STATUS_STALE = "stale"
STATUS_UNAVAILABLE = "unavailable"
STATUS_REFERENCE_REQUIRED = "reference_required"

DIAMOND_CACHE_KEY = "jwelles:stone_prices:diamond:v1"
FX_CACHE_KEY = "jwelles:fx:usd_inr:v1"

# Fixed benchmark specification
BENCHMARK_CARAT = 1.00
BENCHMARK_COLOR = "G"
BENCHMARK_CLARITY = "VS2"
BENCHMARK_SHAPE = "Round"

BENCHMARK_NOTE = (
    "Reference benchmark: 1.00ct G/VS2 Round. "
    "Actual diamond pricing varies by carat, color, clarity, cut and "
    "other grading factors."
)


# ---------------------------------------------------------------------------
# Config helpers
# ---------------------------------------------------------------------------

def _cfg(name: str, default: Any) -> Any:
    return getattr(settings, name, default)


def _openfacet_url() -> str:
    return _cfg("STONE_OPENFACET_MATRIX_URL", "https://data.openfacet.net/matrix.json")


def _fx_url() -> str:
    return _cfg("STONE_FX_URL", "https://open.er-api.com/v6/latest/USD")


def _provider_timeout() -> int:
    return int(_cfg("STONE_PROVIDER_TIMEOUT", 8))


def _cache_ttl() -> int:
    return int(_cfg("STONE_CACHE_TTL", 3600))


def _cache_max_stale() -> int:
    return int(_cfg("STONE_MAX_STALE_SECONDS", 86400))


def _fx_cache_ttl() -> int:
    return int(_cfg("STONE_FX_CACHE_TTL", 43200))


def _now_iso() -> str:
    return datetime.now(dt_timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# OpenFacet matrix parsing
# ---------------------------------------------------------------------------

def _fetch_matrix() -> Optional[Dict[str, Any]]:
    """Fetch OpenFacet's documented matrix.json. Returns None on any failure."""
    url = _openfacet_url()
    try:
        resp = requests.get(url, timeout=_provider_timeout())
    except requests.exceptions.RequestException as exc:
        logger.warning("OpenFacet request failed: %s", exc.__class__.__name__)
        return None

    if resp.status_code != 200:
        logger.warning("OpenFacet returned status %s", resp.status_code)
        return None

    try:
        payload = resp.json()
    except ValueError:
        logger.warning("OpenFacet returned non-JSON payload")
        return None

    if not isinstance(payload, dict):
        logger.warning("OpenFacet payload was not a dict")
        return None

    for required in ("l", "c", "r", "s"):
        if required not in payload:
            logger.warning("OpenFacet matrix missing field: %s", required)
            return None

    return payload


def _normalise_grade(value: str) -> str:
    return str(value).strip().upper()


def _find_index(grades: List[str], target: str) -> Optional[int]:
    """Find index of target grade in provider's grade list (case-insensitive)."""
    t = _normalise_grade(target)
    for i, g in enumerate(grades):
        if _normalise_grade(g) == t:
            return i
    return None


def _parse_carat_bands(l: Dict[str, Any]) -> List[Tuple[float, List[float]]]:
    """
    Convert {'0.5': [...], '1.0': [...], ...} into
    [(0.5, [...]), (1.0, [...]), ...] sorted by numeric carat.
    """
    bands: List[Tuple[float, List[float]]] = []
    for k, v in l.items():
        try:
            carat = float(k)
        except (TypeError, ValueError):
            continue
        if not isinstance(v, list):
            continue
        bands.append((carat, v))
    bands.sort(key=lambda x: x[0])
    return bands


def _extract_logprice_from_flat(
    flat: List[float],
    columns: int,
    row_index: int,
    col_index: int,
) -> Optional[float]:
    """
    Row-major flat-array indexing: index = row * columns + col.
    Documented assumption; change here if provider uses column-major.
    """
    if columns <= 0:
        return None
    idx = row_index * columns + col_index
    if idx < 0 or idx >= len(flat):
        return None
    try:
        return float(flat[idx])
    except (TypeError, ValueError):
        return None


def _lookup_benchmark_logprice(
    matrix: Dict[str, Any],
    carat: float,
    color: str,
    clarity: str,
) -> Optional[float]:
    """
    Return log(per-carat USD price) for the requested spec, using the
    documented matrix structure and log-space interpolation when carat
    is not an exact anchor band.
    """
    r = matrix.get("r")
    c = matrix.get("c")
    s = matrix.get("s")
    l = matrix.get("l")

    if not (isinstance(r, list) and isinstance(c, list)):
        return None
    if not (isinstance(s, list) and len(s) == 2):
        return None
    if not isinstance(l, dict):
        return None

    try:
        rows, columns = int(s[0]), int(s[1])
    except (TypeError, ValueError):
        return None

    # Dynamic index resolution — never hardcode G=4, VS2=5
    row_index = _find_index(r, color)
    col_index = _find_index(c, clarity)
    if row_index is None or col_index is None:
        return None

    bands = _parse_carat_bands(l)
    if not bands:
        return None

    # Exact anchor match
    for band_carat, flat in bands:
        if math.isclose(band_carat, carat, rel_tol=0, abs_tol=1e-9):
            return _extract_logprice_from_flat(
                flat, columns, row_index, col_index
            )

    # Otherwise interpolate between surrounding anchors
    lower = None
    upper = None
    for band_carat, flat in bands:
        if band_carat < carat:
            lower = (band_carat, flat)
        elif band_carat > carat and upper is None:
            upper = (band_carat, flat)
            break

    if lower is None or upper is None:
        return None

    c1, flat1 = lower
    c2, flat2 = upper
    if c2 == c1:
        return None

    logp1 = _extract_logprice_from_flat(flat1, columns, row_index, col_index)
    logp2 = _extract_logprice_from_flat(flat2, columns, row_index, col_index)
    if logp1 is None or logp2 is None:
        return None

    lam = (carat - c1) / (c2 - c1)
    return (1.0 - lam) * logp1 + lam * logp2


def _logprice_to_usd_per_carat(logprice: float) -> Optional[float]:
    try:
        price = math.exp(logprice)
    except (OverflowError, ValueError):
        return None
    if price <= 0:
        return None
    return price


# ---------------------------------------------------------------------------
# FX conversion (isolated helper, Diamond-only)
# ---------------------------------------------------------------------------

def _fetch_usd_inr_rate() -> Optional[float]:
    """
    Fetch USD->INR from open.er-api.com. Returns None on failure.
    Never returns a fabricated rate.
    """
    url = _fx_url()
    try:
        resp = requests.get(url, timeout=_provider_timeout())
    except requests.exceptions.RequestException as exc:
        logger.warning("FX request failed: %s", exc.__class__.__name__)
        return None

    if resp.status_code != 200:
        logger.warning("FX provider returned status %s", resp.status_code)
        return None

    try:
        payload = resp.json()
    except ValueError:
        logger.warning("FX provider returned non-JSON payload")
        return None

    if not isinstance(payload, dict):
        return None

    rates = payload.get("rates")
    if not isinstance(rates, dict):
        return None

    raw = rates.get("INR")
    try:
        rate = float(raw)
    except (TypeError, ValueError):
        return None
    if rate <= 0:
        return None
    return rate


def _get_cached_fx_rate() -> Optional[Dict[str, Any]]:
    cached = cache.get(FX_CACHE_KEY)
    if isinstance(cached, dict):
        return cached
    return None


def _store_fx_rate(rate: float) -> Dict[str, Any]:
    entry = {"rate": rate, "timestamp": _now_iso(), "age_seconds": 0}
    cache.set(FX_CACHE_KEY, entry, timeout=_cache_max_stale())
    return entry


def _resolve_fx_rate() -> Optional[Dict[str, Any]]:
    """
    Return {'rate': float, 'data_status': 'live'|'cached'|'stale'} or None.
    Never returns a fabricated rate.
    """
    cached = _get_cached_fx_rate()

    if cached:
        age = int(cached.get("age_seconds", 0) or 0)
        rate = cached.get("rate")
        if isinstance(rate, (int, float)) and rate > 0:
            if age < _fx_cache_ttl():
                return {"rate": float(rate), "data_status": STATUS_CACHED}
            if age < _cache_max_stale():
                fresh = _fetch_usd_inr_rate()
                if fresh is not None:
                    _store_fx_rate(fresh)
                    return {"rate": fresh, "data_status": STATUS_LIVE}
                return {"rate": float(rate), "data_status": STATUS_STALE}

    fresh = _fetch_usd_inr_rate()
    if fresh is not None:
        _store_fx_rate(fresh)
        return {"rate": fresh, "data_status": STATUS_LIVE}

    return None


# ---------------------------------------------------------------------------
# Diamond item construction
# ---------------------------------------------------------------------------

def _unavailable_diamond(note: str) -> Dict[str, Any]:
    return {
        "material": "Diamond",
        "material_type": "stone",
        "price": None,
        "currency": None,
        "unit": None,
        "source": None,
        "timestamp": _now_iso(),
        "change": None,
        "change_percentage": None,
        "data_status": STATUS_UNAVAILABLE,
        "note": note,
    }


def _build_diamond_item(
    usd_per_carat: float,
    fx_rate: float,
    data_status: str,
    timestamp: str,
) -> Dict[str, Any]:
    inr_per_carat = usd_per_carat * fx_rate
    return {
        "material": "Diamond",
        "material_type": "stone",
        "price": format(inr_per_carat, ".2f"),
        "currency": "INR",
        "unit": "carat",
        "source": "OpenFacet",
        "source_currency": "USD",
        "timestamp": timestamp,
        "change": None,
        "change_percentage": None,
        "data_status": data_status,
        "note": BENCHMARK_NOTE,
    }


def _compute_fresh_diamond() -> Optional[Dict[str, Any]]:
    matrix = _fetch_matrix()
    if matrix is None:
        return None

    logprice = _lookup_benchmark_logprice(
        matrix, BENCHMARK_CARAT, BENCHMARK_COLOR, BENCHMARK_CLARITY
    )
    if logprice is None:
        return None

    usd_per_carat = _logprice_to_usd_per_carat(logprice)
    if usd_per_carat is None:
        return None

    fx = _resolve_fx_rate()
    if fx is None:
        return None

    item = _build_diamond_item(
        usd_per_carat=usd_per_carat,
        fx_rate=fx["rate"],
        data_status=STATUS_LIVE,
        timestamp=_now_iso(),
    )
    return item


def _get_diamond_item() -> Dict[str, Any]:
    """
    Full live -> cached -> stale -> unavailable flow for Diamond.
    """
    cached = cache.get(DIAMOND_CACHE_KEY)

    if isinstance(cached, dict):
        age = int(cached.get("age_seconds", 0) or 0)
        item = cached.get("item")

        if isinstance(item, dict) and age < _cache_ttl():
            item = dict(item)
            if item.get("data_status") == STATUS_LIVE:
                item["data_status"] = STATUS_CACHED
            return item

        if isinstance(item, dict) and age < _cache_max_stale():
            fresh = _compute_fresh_diamond()
            if fresh is not None:
                cache.set(
                    DIAMOND_CACHE_KEY,
                    {"item": fresh, "age_seconds": 0},
                    timeout=_cache_max_stale(),
                )
                fresh = dict(fresh)
                fresh["data_status"] = STATUS_CACHED
                return fresh
            stale = dict(item)
            stale["data_status"] = STATUS_STALE
            return stale

    fresh = _compute_fresh_diamond()
    if fresh is not None:
        cache.set(
            DIAMOND_CACHE_KEY,
            {"item": fresh, "age_seconds": 0},
            timeout=_cache_max_stale(),
        )
        return fresh

    return _unavailable_diamond(
        "Live diamond benchmark is currently unavailable. "
        "Please try again shortly."
    )


# ---------------------------------------------------------------------------
# Non-Diamond stones
# ---------------------------------------------------------------------------

def _reference_stone(name: str) -> Dict[str, Any]:
    return {
        "material": name,
        "material_type": "stone",
        "price": None,
        "currency": None,
        "unit": None,
        "source": None,
        "timestamp": None,
        "change": None,
        "change_percentage": None,
        "data_status": STATUS_REFERENCE_REQUIRED,
        "note": (
            "Live stone pricing requires a professional provider. "
            "No universal live rate exists for this gemstone yet."
        ),
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_stone_prices() -> Dict[str, Any]:
    """
    Stones block for /api/v1/market-prices/.
    """
    items: List[Dict[str, Any]] = []

    for name in SUPPORTED_STONES:
        if name == "Diamond":
            items.append(_get_diamond_item())
        else:
            items.append(_reference_stone(name))

    return {
        "provider_available": True,
        "provider": "OpenFacet (Diamond only)",
        "note": (
            "Diamond benchmark sourced from OpenFacet public matrix data "
            "and converted to INR using a live USD->INR rate. All other "
            "stones require a professional provider and are shown for "
            "reference only."
        ),
        "items": items,
    }