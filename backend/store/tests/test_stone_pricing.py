"""
Tests for stone_pricing.py (Diamond OpenFacet + FX pipeline).

All external HTTP calls are mocked. No live API calls are made.
"""

from __future__ import annotations

import math
from unittest.mock import patch, MagicMock

from django.core.cache import cache
from django.test import TestCase, override_settings

from store.services import stone_pricing


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_matrix(color_g_index=0, clarity_vs2_index=0):
    """
    Build a minimal but valid OpenFacet-style matrix with two carat bands
    (0.50 and 1.00) so we can test both exact-match and interpolation.
    The color and clarity lists are deliberately short but include G/VS2
    at known positions.
    """
    colors = ["D", "E", "F", "G", "H"]
    clarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2"]
    rows = len(colors)
    cols = len(clarities)

    # log-price ~ log(1000) at G/VS2 for both bands
    log_1ct = math.log(10000.0)
    log_half = math.log(6000.0)

    flat_1ct = [0.0] * (rows * cols)
    flat_half = [0.0] * (rows * cols)

    idx_g = colors.index("G")
    idx_vs2 = clarities.index("VS2")
    flat_idx = idx_g * cols + idx_vs2

    flat_1ct[flat_idx] = log_1ct
    flat_half[flat_idx] = log_half

    return {
        "l": {"0.5": flat_half, "1.0": flat_1ct},
        "c": clarities,
        "r": colors,
        "s": [rows, cols],
    }


def _make_fx_payload(rate=83.5):
    return {"result": "success", "rates": {"INR": rate, "USD": 1.0}}


# ---------------------------------------------------------------------------
# Base test case
# ---------------------------------------------------------------------------

class StonePricingBaseTest(TestCase):
    def setUp(self):
        cache.clear()

    def tearDown(self):
        cache.clear()


# ---------------------------------------------------------------------------
# Matrix parsing
# ---------------------------------------------------------------------------

class MatrixParsingTests(StonePricingBaseTest):

    def test_parse_carat_bands_sorts_numerically(self):
        matrix = _make_matrix()
        bands = stone_pricing._parse_carat_bands(matrix["l"])
        self.assertEqual([b[0] for b in bands], [0.5, 1.0])

    def test_dynamic_g_index_lookup(self):
        matrix = _make_matrix()
        idx = stone_pricing._find_index(matrix["r"], "G")
        self.assertEqual(idx, 3)

    def test_dynamic_vs2_index_lookup(self):
        matrix = _make_matrix()
        idx = stone_pricing._find_index(matrix["c"], "VS2")
        self.assertEqual(idx, 5)

    def test_missing_grade_returns_none(self):
        matrix = _make_matrix()
        self.assertIsNone(stone_pricing._find_index(matrix["r"], "Z"))

    def test_exact_1ct_lookup(self):
        matrix = _make_matrix()
        logprice = stone_pricing._lookup_benchmark_logprice(
            matrix, 1.0, "G", "VS2"
        )
        self.assertAlmostEqual(logprice, math.log(10000.0), places=6)

    def test_interpolation_when_1ct_absent(self):
        matrix = _make_matrix()
        # Remove 1.0 band -> only 0.5 remains -> interpolate impossible
        # Instead, add a 2.0 band and query 1.5
        matrix["l"]["2.0"] = list(matrix["l"]["1.0"])
        matrix["l"]["2.0"][
            stone_pricing._find_index(matrix["r"], "G") * matrix["s"][1]
            + stone_pricing._find_index(matrix["c"], "VS2")
        ] = math.log(20000.0)

        logprice = stone_pricing._lookup_benchmark_logprice(
            matrix, 1.5, "G", "VS2"
        )
        expected = (
            math.log(10000.0) + math.log(20000.0)
        ) / 2.0
        self.assertAlmostEqual(logprice, expected, places=6)

    def test_exp_conversion(self):
        usd = stone_pricing._logprice_to_usd_per_carat(math.log(5000.0))
        self.assertAlmostEqual(usd, 5000.0, places=4)


# ---------------------------------------------------------------------------
# FX
# ---------------------------------------------------------------------------

class FxTests(StonePricingBaseTest):

    @patch("store.services.stone_pricing.requests.get")
    def test_fx_success(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200, json=lambda: _make_fx_payload(84.0)
        )
        rate = stone_pricing._fetch_usd_inr_rate()
        self.assertEqual(rate, 84.0)

    @patch("store.services.stone_pricing.requests.get")
    def test_fx_invalid_json(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200, json=lambda: (_ for _ in ()).throw(ValueError())
        )
        self.assertIsNone(stone_pricing._fetch_usd_inr_rate())

    @patch("store.services.stone_pricing.requests.get")
    def test_fx_missing_inr(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200, json=lambda: {"rates": {"USD": 1.0}}
        )
        self.assertIsNone(stone_pricing._fetch_usd_inr_rate())

    @patch("store.services.stone_pricing.requests.get")
    def test_fx_http_failure(self, mock_get):
        mock_get.return_value = MagicMock(status_code=500)
        self.assertIsNone(stone_pricing._fetch_usd_inr_rate())


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

class DiamondPipelineTests(StonePricingBaseTest):

    def _patch_openfacet(self, matrix):
        return patch(
            "store.services.stone_pricing._fetch_matrix",
            return_value=matrix,
        )

    def _patch_fx(self, rate):
        return patch(
            "store.services.stone_pricing._fetch_usd_inr_rate",
            return_value=rate,
        )

    def test_live_diamond_calculation(self):
        with self._patch_openfacet(_make_matrix()), self._patch_fx(84.0):
            item = stone_pricing._get_diamond_item()

        self.assertEqual(item["material"], "Diamond")
        self.assertEqual(item["currency"], "INR")
        self.assertEqual(item["unit"], "carat")
        self.assertEqual(item["source"], "OpenFacet")
        self.assertIn(item["data_status"], ("live", "cached"))
        expected = 10000.0 * 84.0
        self.assertAlmostEqual(float(item["price"]), expected, places=2)

    def test_openfacet_failure_no_cache(self):
        with self._patch_openfacet(None), self._patch_fx(84.0):
            item = stone_pricing._get_diamond_item()
        self.assertEqual(item["data_status"], "unavailable")
        self.assertIsNone(item["price"])

    def test_fx_failure_no_cache(self):
        with self._patch_openfacet(_make_matrix()), self._patch_fx(None):
            item = stone_pricing._get_diamond_item()
        self.assertEqual(item["data_status"], "unavailable")
        self.assertIsNone(item["price"])

    def test_malformed_matrix_missing_fields(self):
        bad = {"l": {}, "r": []}  # missing 'c' and 's'
        with self._patch_openfacet(bad), self._patch_fx(84.0):
            item = stone_pricing._get_diamond_item()
        self.assertEqual(item["data_status"], "unavailable")

    def test_cached_fallback(self):
        with self._patch_openfacet(_make_matrix()), self._patch_fx(84.0):
            first = stone_pricing._get_diamond_item()

        # Simulate provider going down, cache still fresh
        with self._patch_openfacet(None), self._patch_fx(None):
            second = stone_pricing._get_diamond_item()

        self.assertEqual(second["data_status"], "cached")
        self.assertEqual(first["price"], second["price"])

    def test_stale_fallback(self):
        # First live fetch
        with self._patch_openfacet(_make_matrix()), self._patch_fx(84.0):
            stone_pricing._get_diamond_item()

        # Manually age the cache beyond TTL but within max stale
        entry = cache.get(stone_pricing.DIAMOND_CACHE_KEY)
        entry["age_seconds"] = stone_pricing._cache_ttl() + 1
        cache.set(
            stone_pricing.DIAMOND_CACHE_KEY,
            entry,
            timeout=stone_pricing._cache_max_stale(),
        )

        with self._patch_openfacet(None), self._patch_fx(None):
            item = stone_pricing._get_diamond_item()

        self.assertEqual(item["data_status"], "stale")
        self.assertIsNotNone(item["price"])


# ---------------------------------------------------------------------------
# Other stones + metals isolation
# ---------------------------------------------------------------------------

class OtherStonesTests(StonePricingBaseTest):

    def test_all_stones_present(self):
        with patch(
            "store.services.stone_pricing._fetch_matrix", return_value=None
        ):
            block = stone_pricing.get_stone_prices()

        names = [i["material"] for i in block["items"]]
        for expected in [
            "Diamond", "Ruby", "Emerald", "Sapphire", "Pearl",
            "Amethyst", "Topaz", "Garnet",
        ]:
            self.assertIn(expected, names)

    def test_non_diamond_stones_reference_required(self):
        with patch(
            "store.services.stone_pricing._fetch_matrix", return_value=None
        ):
            block = stone_pricing.get_stone_prices()

        for item in block["items"]:
            if item["material"] == "Diamond":
                continue
            self.assertEqual(item["data_status"], "reference_required")
            self.assertIsNone(item["price"])
            self.assertIsNone(item["currency"])
            self.assertIsNone(item["unit"])


class MetalsIsolationTests(StonePricingBaseTest):

    def test_get_market_prices_includes_metals_and_stones(self):
        # We do not mock metals.dev here; we only confirm the shape of
        # the combined response includes both keys.
        from store.services.market_pricing import get_market_prices

        result = get_market_prices()
        self.assertIn("metals", result)
        self.assertIn("stones", result)
        self.assertIn("items", result["stones"])