"""
Automated tests for wishlist PRIVATE collection privacy.

A product that lives only inside a PRIVATE wishlist collection must never
surface in the general/public wishlist API (the one that powers the navbar
badge, product-card hearts, PDP wishlist state, and the profile "Wishlist
Items" summary).

Run with:
    python manage.py test store.test_wishlist_privacy -v 2
"""
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from store.models import Product, WishlistItem, WishlistCollection, WishlistCollectionItem

User = get_user_model()


def make_product(name="Ring A", price="1000.00"):
    return Product.objects.create(name=name, price=price, stock=5)


class WishlistPrivacyTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(
            username="alice@example.com", email="alice@example.com", password="pass12345", first_name="Alice",
        )
        self.client.force_authenticate(user=self.alice)

        self.ring_a = make_product("Ring A")
        self.necklace_b = make_product("Necklace B")
        self.bracelet_c = make_product("Bracelet C")
        self.ring_d = make_product("Ring D")

        self.private_collection = WishlistCollection.objects.create(user=self.alice, name="Secret", visibility="private")
        self.public_collection = WishlistCollection.objects.create(user=self.alice, name="Shareable", visibility="public")

    def wishlist_product_ids(self):
        response = self.client.get("/api/v1/wishlist/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return {item["product"]["id"] for item in response.data}

    # 1. Product only in a PRIVATE collection must not appear in the general wishlist.
    def test_private_only_product_excluded_from_general_wishlist(self):
        WishlistItem.objects.create(user=self.alice, product=self.ring_a)
        WishlistCollectionItem.objects.create(collection=self.private_collection, product=self.ring_a)

        self.assertNotIn(self.ring_a.id, self.wishlist_product_ids())

    # 2. Product only in a PUBLIC collection keeps existing behaviour.
    def test_public_only_product_still_appears_in_general_wishlist(self):
        WishlistItem.objects.create(user=self.alice, product=self.ring_d)
        WishlistCollectionItem.objects.create(collection=self.public_collection, product=self.ring_d)

        self.assertIn(self.ring_d.id, self.wishlist_product_ids())

    # 3. Product in PRIVATE + PUBLIC collections is still publicly visible,
    #    and loses that visibility the moment it's removed from the PUBLIC one.
    def test_product_in_both_private_and_public_is_visible_until_removed_from_public(self):
        WishlistItem.objects.create(user=self.alice, product=self.ring_a)
        WishlistCollectionItem.objects.create(collection=self.private_collection, product=self.ring_a)
        WishlistCollectionItem.objects.create(collection=self.public_collection, product=self.ring_a)

        self.assertIn(self.ring_a.id, self.wishlist_product_ids())

        WishlistCollectionItem.objects.get(collection=self.public_collection, product=self.ring_a).delete()

        self.assertNotIn(self.ring_a.id, self.wishlist_product_ids())

    # 4. Multiple private collections combined must not leak into the general wishlist.
    def test_multiple_private_collections_do_not_affect_general_wishlist(self):
        other_private = WishlistCollection.objects.create(user=self.alice, name="Also secret", visibility="private")
        for product in (self.ring_a, self.necklace_b):
            WishlistItem.objects.create(user=self.alice, product=product)
            WishlistCollectionItem.objects.create(collection=self.private_collection, product=product)
        WishlistItem.objects.create(user=self.alice, product=self.bracelet_c)
        WishlistCollectionItem.objects.create(collection=other_private, product=self.bracelet_c)

        WishlistItem.objects.create(user=self.alice, product=self.ring_d)
        WishlistCollectionItem.objects.create(collection=self.public_collection, product=self.ring_d)

        visible = self.wishlist_product_ids()
        self.assertEqual(visible, {self.ring_d.id})

    # 5. A private collection with many products must not inflate the public count.
    def test_private_collection_does_not_inflate_wishlist_count(self):
        for product in (self.ring_a, self.necklace_b, self.bracelet_c):
            WishlistItem.objects.create(user=self.alice, product=product)
            WishlistCollectionItem.objects.create(collection=self.private_collection, product=product)

        response = self.client.get("/api/v1/wishlist/")
        self.assertEqual(len(response.data), 0)

    # 6. A product with no collection membership at all keeps existing (unassigned) behaviour.
    def test_uncategorised_wishlist_item_still_visible(self):
        WishlistItem.objects.create(user=self.alice, product=self.ring_d)
        self.assertIn(self.ring_d.id, self.wishlist_product_ids())

    # Security: another user's private collection membership must never affect this user's wishlist.
    def test_only_the_owners_own_collections_are_considered(self):
        bob = User.objects.create_user(username="bob@example.com", email="bob@example.com", password="pass12345")
        bob_private = WishlistCollection.objects.create(user=bob, name="Bob secret", visibility="private")
        WishlistCollectionItem.objects.create(collection=bob_private, product=self.ring_a)

        WishlistItem.objects.create(user=self.alice, product=self.ring_a)

        self.assertIn(self.ring_a.id, self.wishlist_product_ids())
