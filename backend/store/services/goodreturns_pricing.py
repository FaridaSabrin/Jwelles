"""
GoodReturns metal pricing provider for JWELLES.

Responsibilities
----------------
- Fetch GoodReturns HTML pages for gold, silver, and platinum rates.
- Parse INR/gram rates for:
    - Gold 24K, 22K, 18K
    - Silver
    - Platinum
- Extract daily change where reliably available.
- Return a normalized dict consumed by market_pricing.py.

Important:
- Never fabricate a price.
- Never use arbitrary numbers such as dates/year/quantity as prices.
- Gold rates are read directly from GoodReturns' 1 gram / Today row.
- Silver and platinum rates are read directly from their 1 gram / Today row.
"""

from __future__ import annotations

import logging
import re
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, Optional

import requests
from bs4 import BeautifulSoup
from django.conf import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

def _gold_url() -> str:
    return getattr(
        settings,
        "GOODRETURNS_GOLD_URL",
        "https://www.goodreturns.in/gold-rates/",
    ).strip()


def _silver_url() -> str:
    return getattr(
        settings,
        "GOODRETURNS_SILVER_URL",
        "https://www.goodreturns.in/silver-rates/",
    ).strip()


def _platinum_url() -> str:
    return getattr(
        settings,
        "GOODRETURNS_PLATINUM_URL",
        "https://www.goodreturns.in/platinum-price.html",
    ).strip()


def _request_timeout() -> int:
    return int(
        getattr(
            settings,
            "GOODRETURNS_REQUEST_TIMEOUT",
            10,
        )
    )


# ---------------------------------------------------------------------------
# Number helpers
# ---------------------------------------------------------------------------

_NUMBER_RE = re.compile(
    r"\d[\d,]*(?:\.\d+)?"
)

_SIGNED_NUMBER_RE = re.compile(
    r"([+-])\s*(?:₹|Rs\.?|INR)?\s*"
    r"([\d,]+(?:\.\d+)?)",
    flags=re.IGNORECASE,
)


def _parse_decimal(value: str) -> Optional[Decimal]:
    """Safely convert a numeric string to Decimal."""
    if not value:
        return None

    cleaned = (
        str(value)
        .replace(",", "")
        .replace("₹", "")
        .strip()
    )

    try:
        number = Decimal(cleaned)
    except (InvalidOperation, ValueError):
        return None

    if number <= 0:
        return None

    return number


def _extract_numbers(text: str) -> list[Decimal]:
    """
    Extract all numeric values from text.

    Unlike the old implementation, this helper does not decide
    which number is the price. The caller must determine that from
    table structure/column position.
    """
    if not text:
        return []

    text = str(text).replace("\xa0", " ")

    values: list[Decimal] = []

    for raw in _NUMBER_RE.findall(text):
        value = _parse_decimal(raw)

        if value is not None:
            values.append(value)

    return values


def _extract_change(text: str) -> Optional[Decimal]:
    """
    Extract an explicitly signed change.

    Examples:
        +158
        -46
        +₹158
        - ₹46
    """
    if not text:
        return None

    text = str(text).replace("\xa0", " ")

    match = _SIGNED_NUMBER_RE.search(text)

    if not match:
        return None

    number = _parse_decimal(match.group(2))

    if number is None:
        return None

    if match.group(1) == "-":
        return -number

    return number


def _quantize_price(value: Decimal) -> Optional[Decimal]:
    """Return a positive price rounded to two decimal places."""
    if value <= 0:
        return None

    return value.quantize(Decimal("0.01"))


# ---------------------------------------------------------------------------
# HTTP fetch
# ---------------------------------------------------------------------------

def _fetch_page(url: str) -> Optional[str]:
    """
    Fetch a GoodReturns page.

    Returns HTML only for a successful and non-empty response.
    """
    if not url:
        return None

    try:
        response = requests.get(
            url,
            timeout=_request_timeout(),
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
                "Accept": (
                    "text/html,application/xhtml+xml,"
                    "application/xml;q=0.9,*/*;q=0.8"
                ),
                "Accept-Language": "en-IN,en;q=0.9",
                "Cache-Control": "no-cache",
            },
        )
    except requests.exceptions.RequestException as exc:
        logger.warning(
            "GoodReturns request failed for %s: %s",
            url.split("?")[0],
            exc.__class__.__name__,
        )
        return None

    if response.status_code != 200:
        logger.warning(
            "GoodReturns returned HTTP %s for %s",
            response.status_code,
            url.split("?")[0],
        )
        return None

    if not response.text or len(response.text) < 500:
        logger.warning(
            "GoodReturns response suspiciously short for %s",
            url.split("?")[0],
        )
        return None

    return response.text


# ---------------------------------------------------------------------------
# Table helpers
# ---------------------------------------------------------------------------

def _normalise_cell(text: str) -> str:
    """Normalise whitespace for reliable table matching."""
    return re.sub(
        r"\s+",
        " ",
        str(text).replace("\xa0", " "),
    ).strip()


def _get_table_rows(table) -> list[list[str]]:
    """Return normalised text cells for a table."""
    rows: list[list[str]] = []

    for row in table.find_all("tr"):
        cells = row.find_all(["th", "td"])

        if not cells:
            continue

        values = [
            _normalise_cell(
                cell.get_text(" ", strip=True)
            )
            for cell in cells
        ]

        if values:
            rows.append(values)

    return rows


def _is_one_gram_label(text: str) -> bool:
    """
    Match GoodReturns' 1 gram row.

    Examples:
        1
        1 g
        1 gm
        1 gram
        1 grams
    """
    normalised = _normalise_cell(text).lower()

    return bool(
        re.fullmatch(
            r"1(?:\s*(?:g|gm|gram|grams))?",
            normalised,
        )
    )


# ---------------------------------------------------------------------------
# Gold parser
# ---------------------------------------------------------------------------

def _parse_gold(html: str) -> Dict[str, Any]:
    """
    Parse the GoodReturns gold table.

    Current GoodReturns structure:

        Gram | 24K | 22K | 18K
        1    | ₹... | ₹... | ₹...

    The parser identifies the header columns instead of assuming
    that the first numbers on the page are prices.
    """
    result: Dict[str, Any] = {
        "gold_24k": None,
        "gold_22k": None,
        "gold_18k": None,
        "change_gold_24k": None,
        "change_gold_22k": None,
        "change_gold_18k": None,
    }

    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    for table in soup.find_all("table"):
        rows = _get_table_rows(table)

        if len(rows) < 2:
            continue

        header_index: Optional[int] = None
        column_indexes: Dict[str, int] = {}

        # Find the header containing 24K / 22K / 18K.
        for index, row in enumerate(rows):
            normalised = [
                cell.lower().replace(" ", "")
                for cell in row
            ]

            if (
                any("24k" in cell for cell in normalised)
                and any("22k" in cell for cell in normalised)
                and any("18k" in cell for cell in normalised)
            ):
                header_index = index

                for column, cell in enumerate(normalised):
                    if "24k" in cell:
                        column_indexes["gold_24k"] = column
                    elif "22k" in cell:
                        column_indexes["gold_22k"] = column
                    elif "18k" in cell:
                        column_indexes["gold_18k"] = column

                break

        if header_index is None:
            continue

        if len(column_indexes) != 3:
            continue

        # Find the actual 1 gram row.
        for row in rows[header_index + 1:]:
            if not row:
                continue

            if not _is_one_gram_label(row[0]):
                continue

            # Extract each purity by its header position.
            for key, column in column_indexes.items():
                if column >= len(row):
                    continue

                cell = row[column]

                # The cell contains:
                # ₹15,442 (+158)
                #
                # First number = Today
                # Signed number = Change
                numbers = _extract_numbers(cell)

                if not numbers:
                    continue

                price = _quantize_price(numbers[0])

                if price is None:
                    continue

                result[key] = price

                change = _extract_change(cell)

                change_key = f"change_{key}"

                if change is not None:
                    result[change_key] = change

            # Do not use another table once the correct 1g row
            # has been found.
            if any(
                result[key] is not None
                for key in (
                    "gold_24k",
                    "gold_22k",
                    "gold_18k",
                )
            ):
                return result

    logger.warning(
        "GoodReturns gold parser could not find the 1 gram "
        "24K/22K/18K table row."
    )

    return result


# ---------------------------------------------------------------------------
# Generic 1 gram parser for Silver / Platinum
# ---------------------------------------------------------------------------

def _parse_single_metal_table(
    html: str,
    *,
    metal_name: str,
    minimum_price: Decimal,
) -> tuple[Optional[Decimal], Optional[Decimal]]:
    """
    Parse a single-metal GoodReturns table.

    Expected structure:

        Gram | Today | Yesterday | Change
        1    | ₹250  | ₹245      | +₹5

    or:

        Gram | Today | Yesterday | Change
        1    | ₹5,512 | ₹5,558   | -₹46
    """
    soup = BeautifulSoup(
        html,
        "html.parser",
    )

    metal_name = metal_name.lower()

    for table in soup.find_all("table"):
        rows = _get_table_rows(table)

        if len(rows) < 2:
            continue

        header_index: Optional[int] = None
        today_index: Optional[int] = None
        change_index: Optional[int] = None

        for index, row in enumerate(rows):
            normalised = [
                cell.lower()
                for cell in row
            ]

            has_today = any(
                cell == "today"
                or cell.startswith("today ")
                for cell in normalised
            )

            has_gram = any(
                cell == "gram"
                or "gram" in cell
                for cell in normalised
            )

            if has_today and has_gram:
                header_index = index

                for column, cell in enumerate(normalised):
                    if cell == "today":
                        today_index = column

                    if cell == "change":
                        change_index = column

                break

        if header_index is None or today_index is None:
            continue

        # Find the 1 gram row.
        for row in rows[header_index + 1:]:
            if not row:
                continue

            if not _is_one_gram_label(row[0]):
                continue

            if today_index >= len(row):
                continue

            today_cell = row[today_index]

            numbers = _extract_numbers(today_cell)

            if not numbers:
                continue

            price = _quantize_price(numbers[0])

            if price is None:
                continue

            # Safety validation:
            # Reject obvious quantity/date values such as 1 or 2026.
            if price < minimum_price:
                continue

            change: Optional[Decimal] = None

            if (
                change_index is not None
                and change_index < len(row)
            ):
                change = _extract_change(
                    row[change_index]
                )

            # Some pages put the change directly inside
            # the Today cell, e.g. "₹5,512 (-46)".
            if change is None:
                change = _extract_change(today_cell)

            return price, change

    logger.warning(
        "GoodReturns %s parser could not find a valid 1 gram "
        "Today row.",
        metal_name,
    )

    return None, None


# ---------------------------------------------------------------------------
# Silver parser
# ---------------------------------------------------------------------------

def _parse_silver(html: str) -> Dict[str, Any]:
    """
    Parse GoodReturns silver price per gram.
    """
    result: Dict[str, Any] = {
        "silver_per_gram": None,
        "change_silver": None,
    }

    price, change = _parse_single_metal_table(
        html,
        metal_name="silver",
        minimum_price=Decimal("10"),
    )

    if price is not None:
        result["silver_per_gram"] = price

    if change is not None:
        result["change_silver"] = change

    return result


# ---------------------------------------------------------------------------
# Platinum parser
# ---------------------------------------------------------------------------

def _parse_platinum(html: str) -> Dict[str, Any]:
    """
    Parse GoodReturns platinum price per gram.
    """
    result: Dict[str, Any] = {
        "platinum_per_gram": None,
        "change_platinum": None,
    }

    price, change = _parse_single_metal_table(
        html,
        metal_name="platinum",
        minimum_price=Decimal("100"),
    )

    if price is not None:
        result["platinum_per_gram"] = price

    if change is not None:
        result["change_platinum"] = change

    return result


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_goodreturns_prices() -> Optional[Dict[str, Any]]:
    """
    Fetch and parse all GoodReturns metal pages.

    Returns:

        {
            "source": "goodreturns",

            "gold_24k": Decimal,
            "gold_22k": Decimal,
            "gold_18k": Decimal,

            "silver": Decimal,
            "platinum": Decimal,

            "change_gold_24k": Decimal,
            "change_gold_22k": Decimal,
            "change_gold_18k": Decimal,

            "change_silver": Decimal,
            "change_platinum": Decimal,
        }

    Missing individual metals are omitted.

    Returns None only when no valid metal price can be extracted.
    """

    result: Dict[str, Any] = {
        "source": "goodreturns",
    }

    # ------------------------------------------------------------------
    # Gold
    # ------------------------------------------------------------------

    gold_html = _fetch_page(_gold_url())

    if gold_html:
        gold = _parse_gold(gold_html)

        for key in (
            "gold_24k",
            "gold_22k",
            "gold_18k",
        ):
            value = gold.get(key)

            if value is not None and value > 0:
                result[key] = value

        for key in (
            "change_gold_24k",
            "change_gold_22k",
            "change_gold_18k",
        ):
            value = gold.get(key)

            if value is not None:
                result[key] = value

    # ------------------------------------------------------------------
    # Silver
    # ------------------------------------------------------------------

    silver_html = _fetch_page(_silver_url())

    if silver_html:
        silver = _parse_silver(silver_html)

        value = silver.get("silver_per_gram")

        if value is not None and value > 0:
            result["silver"] = value

        change = silver.get("change_silver")

        if change is not None:
            result["change_silver"] = change

    # ------------------------------------------------------------------
    # Platinum
    # ------------------------------------------------------------------

    platinum_html = _fetch_page(_platinum_url())

    if platinum_html:
        platinum = _parse_platinum(platinum_html)

        value = platinum.get("platinum_per_gram")

        if value is not None and value > 0:
            result["platinum"] = value

        change = platinum.get("change_platinum")

        if change is not None:
            result["change_platinum"] = change

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------

    price_keys = (
        "gold_24k",
        "gold_22k",
        "gold_18k",
        "silver",
        "platinum",
    )

    valid_prices = [
        key
        for key in price_keys
        if result.get(key) is not None
    ]

    if not valid_prices:
        logger.warning(
            "GoodReturns: no valid prices extracted from any page."
        )
        return None

    logger.info(
        "GoodReturns prices extracted successfully: %s",
        ", ".join(valid_prices),
    )

    return result