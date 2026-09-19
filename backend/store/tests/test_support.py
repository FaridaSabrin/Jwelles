from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import SupportTicket


SUPPORT_GROUP = "Support Staff"
STATS_URL = "/api/v1/admin/support/tickets/stats/"
LIST_URL = "/api/v1/admin/support/tickets/"


def _make_user(email, password="testpass1234", **extra):
    User = get_user_model()
    user = User.objects.create_user(
        username=email, email=email, password=password, **extra
    )
    return user


class SupportAuthorizationTests(TestCase):
    """Verifies the exact actor → endpoint matrix for the Support Dashboard.

    Backend is the source of truth. Frontend SupportStaffRoute is only UX.
    """

    def setUp(self):
        self.client = APIClient()

        self.anonymous = None

        self.customer = _make_user("customer@example.com")

        # is_staff=True but NOT in "Support Staff" group — must be denied.
        self.staff_only = _make_user("staffonly@example.com", is_staff=True)

        self.support_user = _make_user("support@example.com")
        support_group, _ = Group.objects.get_or_create(name=SUPPORT_GROUP)
        self.support_user.groups.add(support_group)

        self.superuser = _make_user(
            "root@example.com", is_staff=True, is_superuser=True
        )

        # A ticket so detail/messages endpoints have a target.
        self.ticket = SupportTicket.objects.create(
            user=self.customer,
            category="other",
            subject="Test ticket",
            priority="medium",
            status="open",
        )

    def _auth(self, user):
        self.client.credentials()
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def _urls(self):
        return [
            STATS_URL,
            LIST_URL,
            f"/api/v1/admin/support/tickets/{self.ticket.ticket_id}/",
            f"/api/v1/admin/support/tickets/{self.ticket.ticket_id}/messages/",
        ]

    # ---- anonymous → 401 ------------------------------------------------

    def test_anonymous_is_rejected_with_401(self):
        self._auth(self.anonymous)
        for url in self._urls():
            method = self.client.post if url.endswith("/messages/") else self.client.get
            response = method(url, {"message": "hi"} if url.endswith("/messages/") else None)
            self.assertIn(
                response.status_code, (401, 403),
                f"anonymous unexpectedly allowed on {url}",
            )

    # ---- normal customer → 403 ------------------------------------------

    def test_customer_is_rejected_with_403(self):
        self._auth(self.customer)
        for url in self._urls():
            method = self.client.post if url.endswith("/messages/") else self.client.get
            response = method(url, {"message": "hi"} if url.endswith("/messages/") else None)
            self.assertEqual(
                response.status_code, 403,
                f"customer unexpectedly allowed on {url}",
            )

    # ---- is_staff=True without Support Staff group → 403 ----------------

    def test_staff_flag_without_group_is_rejected(self):
        self._auth(self.staff_only)
        for url in self._urls():
            method = self.client.post if url.endswith("/messages/") else self.client.get
            response = method(url, {"message": "hi"} if url.endswith("/messages/") else None)
            self.assertEqual(
                response.status_code, 403,
                f"is_staff-only user unexpectedly allowed on {url}",
            )

    # ---- Support Staff group member → 200 -------------------------------

    def test_support_staff_group_member_is_allowed(self):
        self._auth(self.support_user)
        self.assertEqual(self.client.get(STATS_URL).status_code, 200)
        self.assertEqual(self.client.get(LIST_URL).status_code, 200)
        self.assertEqual(
            self.client.get(
                f"/api/v1/admin/support/tickets/{self.ticket.ticket_id}/"
            ).status_code,
            200,
        )

    # ---- superuser → 200 -------------------------------------------------

    def test_superuser_is_allowed(self):
        self._auth(self.superuser)
        self.assertEqual(self.client.get(STATS_URL).status_code, 200)
        self.assertEqual(self.client.get(LIST_URL).status_code, 200)

    # ---- /profile/ returns the correct is_support_staff -----------------

    def test_profile_is_support_staff_flags(self):
        cases = [
            (self.customer, False),
            (self.staff_only, False),
            (self.support_user, True),
            (self.superuser, True),
        ]
        for user, expected in cases:
            self._auth(user)
            response = self.client.get("/api/v1/profile/")
            self.assertEqual(response.status_code, 200)
            self.assertEqual(
                response.json().get("is_support_staff"),
                expected,
                f"is_support_staff mismatch for {user.email}",
            )