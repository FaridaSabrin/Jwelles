"""
End-to-end tests for every Jewellery dropdown option. These verify that
each URL parameter actually filters real products through the API, not
just that the URL contains a magic string.
"""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from store.models import Category, Product, ProductTag


User = get_user_model()


class JewelleryDropdownFilterTests(APITestCase):
    """Each test asserts the exact products returned satisfy the filter."""

    @classmethod
    def setUpTestData(cls):
        # A handful of real products covering every attribute combination
        # the dropdown options are meant to reach.
        cls.ring = Product.objects.create(
            name="Wedding Gold Ring",
            price=Decimal("8000"),
            stock=10,
            is_available=True,
            is_best_seller=True,
            category="rings",
            metal_type="gold",
            gender="women",
        )
        cls.necklace = Product.objects.create(
            name="Diwali Necklace",
            price=Decimal("15000"),
            original_price=Decimal("18000"),
            stock=5,
            is_available=True,
            category="necklaces",
            metal_type="gold",
        )
        cls.cheap = Product.objects.create(
            name="Daily Earrings",
            price=Decimal("2500"),
            stock=20,
            is_available=True,
            category="earrings",
            metal_type="silver",
        )
        cls.luxury = Product.objects.create(
            name="Luxury Diamond Pendant",
            price=Decimal("75000"),
            stock=3,
            is_available=True,
            category="pendants",
            metal_type="diamond",
        )
        cls.restocked = Product.objects.create(
            name="Back in Stock Bracelet",
            price=Decimal("9000"),
            stock=4,
            previous_stock=0,
            back_in_stock=True,
            is_available=True,
            category="bracelets",
        )

        # Attach tags to appropriate products
        wedding = ProductTag.objects.get(slug="wedding")
        diwali = ProductTag.objects.get(slug="diwali")
        daily = ProductTag.objects.get(slug="daily")
        limited = ProductTag.objects.get(slug="limited")
        corporate = ProductTag.objects.get(slug="corporate")

        cls.ring.tags.add(wedding, limited)
        cls.necklace.tags.add(diwali)
        cls.cheap.tags.add(daily)
        cls.luxury.tags.add(corporate, limited)

    def _fetch(self, **params):
        url = reverse("product-list")
        return self.client.get(url, params).json()

    # --- Occasions ---------------------------------------------------------
    def test_wedding(self):
        data = self._fetch(occasion="wedding")
        self.assertEqual({p["name"] for p in data}, {"Wedding Gold Ring"})

    def test_diwali(self):
        data = self._fetch(occasion="diwali")
        self.assertEqual({p["name"] for p in data}, {"Diwali Necklace"})

    def test_occasion_without_matches(self):
        # No products tagged "engagement" in the fixture — must return []
        data = self._fetch(occasion="engagement")
        self.assertEqual(data, [])

    # --- Styles ------------------------------------------------------------
    def test_daily(self):
        data = self._fetch(style="daily")
        self.assertEqual({p["name"] for p in data}, {"Daily Earrings"})

    # --- Gift Ideas (price) -----------------------------------------------
    def test_gifts_under_5000(self):
        data = self._fetch(max_price=5000)
        self.assertTrue(all(Decimal(p["price"]) <= 5000 for p in data))
        self.assertIn("Daily Earrings", {p["name"] for p in data})

    def test_gifts_under_10000(self):
        data = self._fetch(max_price=10000)
        self.assertTrue(all(Decimal(p["price"]) <= 10000 for p in data))

    def test_gifts_under_25000(self):
        data = self._fetch(max_price=25000)
        self.assertTrue(all(Decimal(p["price"]) <= 25000 for p in data))
        self.assertIn("Wedding Gold Ring", {p["name"] for p in data})

    def test_luxury_gifts(self):
        data = self._fetch(min_price=50000)
        self.assertTrue(all(Decimal(p["price"]) >= 50000 for p in data))
        self.assertIn("Luxury Diamond Pendant", {p["name"] for p in data})

    # --- Tag-based ---------------------------------------------------------
    def test_corporate_gifts(self):
        data = self._fetch(tag="corporate")
        self.assertEqual({p["name"] for p in data}, {"Luxury Diamond Pendant"})

    def test_limited_edition(self):
        data = self._fetch(tag="limited")
        names = {p["name"] for p in data}
        self.assertIn("Wedding Gold Ring", names)
        self.assertIn("Luxury Diamond Pendant", names)

    # --- Trending ----------------------------------------------------------
    def test_best_sellers(self):
        data = self._fetch(best_seller="true")
        self.assertTrue(all(p["is_best_seller"] for p in data))
        self.assertIn("Wedding Gold Ring", {p["name"] for p in data})

    def test_new_arrivals_sort(self):
        data = self._fetch(sort="newest")
        self.assertEqual(data[0]["name"], "Back in Stock Bracelet")

    def test_special_offers(self):
        data = self._fetch(discount="true")
        self.assertTrue(all(p["original_price"] for p in data))

    def test_customer_favorites(self):
        data = self._fetch(sort="best_rated")
        # No reviews in fixture — just verify the endpoint accepts the sort
        # and returns a list without errors.
        self.assertIsInstance(data, list)

    def test_back_in_stock(self):
        data = self._fetch(back_in_stock="true")
        names = {p["name"] for p in data}
        self.assertIn("Back in Stock Bracelet", names)
        for p in data:
            self.assertTrue(p["back_in_stock"])
            self.assertGreater(p["stock"], 0)

    # --- Intersection filters ---------------------------------------------
    def test_wedding_plus_gold_plus_ring(self):
        data = self._fetch(occasion="wedding", metal_type="gold", category="rings")
        self.assertEqual({p["name"] for p in data}, {"Wedding Gold Ring"})

    def test_empty_intersection(self):
        data = self._fetch(occasion="wedding", category="earrings")
        self.assertEqual(data, [])