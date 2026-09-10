"""
Automated tests for the Customer Support ticket feature.

Run with:
    python manage.py test store.test_support -v 2

Uses Django's test runner, which creates and destroys its own throwaway test
database for the run — it never touches real data in the configured MySQL
database.
"""
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from store.models import Address, Order, SupportTicket, SupportMessage

User = get_user_model()


def make_order(user):
    """Minimal valid Order for a user, for order-linking tests."""
    address = Address.objects.create(
        user=user, full_name=user.get_full_name() or user.username, email=user.email,
        phone="9999999999", line1="1 Test Street", city="Testville", state="TS", pincode="123456",
    )
    today = timezone.localdate()
    return Order.objects.create(
        user=user, shipping_address=address, subtotal=1000, total=1000,
        estimated_delivery_start=today + timedelta(days=3), estimated_delivery_end=today + timedelta(days=6),
    )


class SupportTicketCustomerTests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(username="alice@example.com", email="alice@example.com", password="pass12345", first_name="Alice")
        self.bob = User.objects.create_user(username="bob@example.com", email="bob@example.com", password="pass12345", first_name="Bob")
        self.alice_order = make_order(self.alice)
        self.bob_order = make_order(self.bob)

    def create_ticket(self, user, **overrides):
        self.client.force_authenticate(user=user)
        payload = {
            "category": "order_issue",
            "subject": "Where is my order?",
            "description": "It has been 10 days and I have not received my order.",
            "priority": "high",
        }
        payload.update(overrides)
        return self.client.post("/api/v1/support/tickets/", payload, format="json")

    # 1. Create ticket
    def test_create_ticket_creates_ticket_and_first_message(self):
        response = self.create_ticket(self.alice)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data["ticket_id"].startswith("SUP-"))
        self.assertEqual(response.data["status"], "open")
        self.assertEqual(response.data["priority"], "high")
        self.assertEqual(len(response.data["messages"]), 1)
        self.assertEqual(response.data["messages"][0]["message"], "It has been 10 days and I have not received my order.")
        self.assertFalse(response.data["messages"][0]["is_admin_reply"])
        self.assertEqual(SupportTicket.objects.count(), 1)
        self.assertEqual(SupportMessage.objects.count(), 1)

    def test_create_ticket_requires_auth(self):
        response = self.client.post("/api/v1/support/tickets/", {"category": "other", "subject": "x", "description": "y"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_ticket_rejects_blank_subject(self):
        response = self.create_ticket(self.alice, subject="   ")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("subject", response.data)

    def test_create_ticket_rejects_invalid_category(self):
        response = self.create_ticket(self.alice, category="not_a_real_category")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("category", response.data)

    def test_create_ticket_can_link_own_order(self):
        response = self.create_ticket(self.alice, order_id=self.alice_order.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["order"]["id"], self.alice_order.id)

    def test_create_ticket_rejects_other_users_order(self):
        response = self.create_ticket(self.alice, order_id=self.bob_order.id)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("order_id", response.data)
        self.assertEqual(SupportTicket.objects.count(), 0)

    # 2. View ticket list
    def test_list_only_returns_own_tickets(self):
        self.create_ticket(self.alice)
        self.create_ticket(self.bob, subject="Bob's issue")
        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/v1/support/tickets/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["subject"], "Where is my order?")

    def test_list_filters_by_status_and_priority(self):
        self.create_ticket(self.alice, priority="low")
        self.create_ticket(self.alice, subject="Second", priority="high")
        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/v1/support/tickets/?priority=high")
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["subject"], "Second")

    # 3. View ticket details
    def test_ticket_detail_owner_can_view(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(f"/api/v1/support/tickets/{created['ticket_id']}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["ticket_id"], created["ticket_id"])

    # 6. Cannot access another user's ticket
    def test_ticket_detail_rejects_non_owner(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.bob)
        response = self.client.get(f"/api/v1/support/tickets/{created['ticket_id']}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # 4. Send follow-up message
    def test_send_followup_message(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.alice)
        response = self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/messages/", {"message": "Any update?"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertFalse(response.data["is_admin_reply"])
        detail = self.client.get(f"/api/v1/support/tickets/{created['ticket_id']}/").data
        self.assertEqual(len(detail["messages"]), 2)

    def test_cannot_message_another_users_ticket(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.bob)
        response = self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/messages/", {"message": "sneaky"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_followup_message_reopens_from_awaiting_customer(self):
        created = self.create_ticket(self.alice).data
        ticket = SupportTicket.objects.get(ticket_id=created["ticket_id"])
        ticket.status = "awaiting_customer"
        ticket.save(update_fields=["status"])
        self.client.force_authenticate(user=self.alice)
        self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/messages/", {"message": "Following up"}, format="json")
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, "in_progress")

    # 7. Cannot send message to closed ticket
    def test_cannot_message_closed_ticket(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.alice)
        self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/close/")
        response = self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/messages/", {"message": "hello?"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 5. Close ticket
    def test_owner_can_close_ticket(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.alice)
        response = self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/close/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "closed")
        self.assertIsNotNone(response.data["closed_at"])

    def test_non_owner_cannot_close_ticket(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.bob)
        response = self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/close/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_close_already_closed_ticket(self):
        created = self.create_ticket(self.alice).data
        self.client.force_authenticate(user=self.alice)
        self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/close/")
        response = self.client.post(f"/api/v1/support/tickets/{created['ticket_id']}/close/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class SupportTicketAdminTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin@example.com", email="admin@example.com", password="pass12345", is_staff=True)
        self.alice = User.objects.create_user(username="alice@example.com", email="alice@example.com", password="pass12345", first_name="Alice")
        self.bob = User.objects.create_user(username="bob@example.com", email="bob@example.com", password="pass12345", first_name="Bob")

        self.client.force_authenticate(user=self.alice)
        self.alice_ticket = self.client.post("/api/v1/support/tickets/", {
            "category": "payment_issue", "subject": "Double charged", "description": "I was charged twice.", "priority": "high",
        }, format="json").data

        self.client.force_authenticate(user=self.bob)
        self.bob_ticket = self.client.post("/api/v1/support/tickets/", {
            "category": "product_issue", "subject": "Item arrived damaged", "description": "The necklace clasp is broken.", "priority": "medium",
        }, format="json").data

    # Non-admin blocked
    def test_customer_cannot_access_admin_list(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.get("/api/v1/admin/support/tickets/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_access_admin_list(self):
        response = self.client.get("/api/v1/admin/support/tickets/")
        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    # 1. View all tickets
    def test_admin_sees_all_tickets(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/v1/admin/support/tickets/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertIn(response.data[0]["user"]["email"], ("alice@example.com", "bob@example.com"))

    # 2. Search
    def test_admin_can_search_by_subject(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/v1/admin/support/tickets/?search=damaged")
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["ticket_id"], self.bob_ticket["ticket_id"])

    def test_admin_can_search_by_customer_email(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/v1/admin/support/tickets/?search=alice@example.com")
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["ticket_id"], self.alice_ticket["ticket_id"])

    # 3. Filter
    def test_admin_can_filter_by_priority(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/v1/admin/support/tickets/?priority=high")
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["ticket_id"], self.alice_ticket["ticket_id"])

    def test_admin_can_filter_by_status(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get("/api/v1/admin/support/tickets/?status=open")
        self.assertEqual(len(response.data), 2)

    # 4. View ticket detail (any user's)
    def test_admin_can_view_any_ticket_detail(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get(f"/api/v1/admin/support/tickets/{self.bob_ticket['ticket_id']}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["user"]["email"], "bob@example.com")

    # 5. Reply to ticket
    def test_admin_can_reply(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f"/api/v1/admin/support/tickets/{self.alice_ticket['ticket_id']}/messages/", {"message": "We're looking into this."}, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data["is_admin_reply"])
        # Replying nudges an open ticket to in_progress
        ticket = SupportTicket.objects.get(ticket_id=self.alice_ticket["ticket_id"])
        self.assertEqual(ticket.status, "in_progress")

    def test_customer_sees_admin_reply(self):
        self.client.force_authenticate(user=self.admin)
        self.client.post(f"/api/v1/admin/support/tickets/{self.alice_ticket['ticket_id']}/messages/", {"message": "We're looking into this."}, format="json")
        self.client.force_authenticate(user=self.alice)
        response = self.client.get(f"/api/v1/support/tickets/{self.alice_ticket['ticket_id']}/")
        messages = response.data["messages"]
        self.assertEqual(len(messages), 2)
        self.assertTrue(messages[-1]["is_admin_reply"])
        self.assertEqual(messages[-1]["message"], "We're looking into this.")

    # 6. Update status
    def test_admin_can_update_status(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(f"/api/v1/admin/support/tickets/{self.alice_ticket['ticket_id']}/", {"status": "resolved"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "resolved")
        self.assertIsNotNone(response.data["resolved_at"])

    # 7. Update priority
    def test_admin_can_update_priority(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.patch(f"/api/v1/admin/support/tickets/{self.alice_ticket['ticket_id']}/", {"priority": "low"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["priority"], "low")

    def test_customer_cannot_update_status(self):
        self.client.force_authenticate(user=self.alice)
        response = self.client.patch(f"/api/v1/support/tickets/{self.alice_ticket['ticket_id']}/", {"status": "resolved"}, format="json")
        # Customer-facing detail endpoint has no PATCH handler at all.
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)


class SupportTicketIntegrationFlowTests(APITestCase):
    """End-to-end walk of the full flow described in the spec:
    create -> admin sees it -> admin replies -> customer sees reply ->
    customer follow-up -> admin resolves -> customer closes."""

    def test_full_ticket_lifecycle(self):
        alice = User.objects.create_user(username="alice@example.com", email="alice@example.com", password="pass12345", first_name="Alice")
        admin = User.objects.create_user(username="admin@example.com", email="admin@example.com", password="pass12345", is_staff=True)

        # 1. Customer creates ticket
        self.client.force_authenticate(user=alice)
        create_response = self.client.post("/api/v1/support/tickets/", {
            "category": "delivery_issue", "subject": "Package delayed", "description": "Tracking hasn't moved in 5 days.", "priority": "medium",
        }, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        ticket_id = create_response.data["ticket_id"]

        # 2. Ticket exists in DB, owned by alice, status open
        ticket = SupportTicket.objects.get(ticket_id=ticket_id)
        self.assertEqual(ticket.user, alice)
        self.assertEqual(ticket.status, "open")

        # 3. Admin sees it in the queue
        self.client.force_authenticate(user=admin)
        admin_list = self.client.get("/api/v1/admin/support/tickets/")
        self.assertEqual(len(admin_list.data), 1)

        # 4. Admin replies -> auto in_progress
        reply = self.client.post(f"/api/v1/admin/support/tickets/{ticket_id}/messages/", {"message": "Checking with the courier now."}, format="json")
        self.assertEqual(reply.status_code, status.HTTP_201_CREATED)
        ticket.refresh_from_db()
        self.assertEqual(ticket.status, "in_progress")

        # 5. Customer sees the reply
        self.client.force_authenticate(user=alice)
        detail = self.client.get(f"/api/v1/support/tickets/{ticket_id}/")
        self.assertEqual(len(detail.data["messages"]), 2)
        self.assertTrue(detail.data["messages"][-1]["is_admin_reply"])

        # 6. Customer sends a follow-up
        followup = self.client.post(f"/api/v1/support/tickets/{ticket_id}/messages/", {"message": "Thank you, please keep me posted."}, format="json")
        self.assertEqual(followup.status_code, status.HTTP_201_CREATED)

        # 7. Admin marks resolved
        self.client.force_authenticate(user=admin)
        resolved = self.client.patch(f"/api/v1/admin/support/tickets/{ticket_id}/", {"status": "resolved"}, format="json")
        self.assertEqual(resolved.status_code, status.HTTP_200_OK)
        self.assertEqual(resolved.data["status"], "resolved")

        # 8. Customer closes the resolved ticket
        self.client.force_authenticate(user=alice)
        closed = self.client.post(f"/api/v1/support/tickets/{ticket_id}/close/")
        self.assertEqual(closed.status_code, status.HTTP_200_OK)
        self.assertEqual(closed.data["status"], "closed")

        # 9. No further messages accepted
        blocked = self.client.post(f"/api/v1/support/tickets/{ticket_id}/messages/", {"message": "one more thing"}, format="json")
        self.assertEqual(blocked.status_code, status.HTTP_400_BAD_REQUEST)

        self.assertEqual(SupportMessage.objects.filter(ticket=ticket).count(), 3)
