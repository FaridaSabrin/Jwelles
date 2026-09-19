from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError


SUPPORT_GROUP_NAME = "Support Staff"


class Command(BaseCommand):
    help = (
        "Add an existing user to the 'Support Staff' Django group so they "
        "can access the Support Dashboard. Idempotent — safe to run "
        "multiple times. Never creates users or passwords."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            required=True,
            help="Email of an existing user to add to the Support Staff group.",
        )

    def handle(self, *args, **options):
        email = (options["email"] or "").strip().lower()
        if not email:
            raise CommandError("--email is required.")

        User = get_user_model()

        # 1. Find or create the Support Staff group.
        group, group_created = Group.objects.get_or_create(
            name=SUPPORT_GROUP_NAME
        )
        if group_created:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created group '{SUPPORT_GROUP_NAME}'."
                )
            )
        else:
            self.stdout.write(
                f"Group '{SUPPORT_GROUP_NAME}' already exists."
            )

        # 2. Find the existing user. Never create one.
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            raise CommandError(
                f"No user found with email '{email}'. "
                "The user must register first; this command only "
                "grants the Support Staff role to an existing account."
            )

        # 3. Add to group (idempotent — M2M .add() is a no-op if already in).
        if user.groups.filter(name=SUPPORT_GROUP_NAME).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"User '{user.email}' is already in "
                    f"'{SUPPORT_GROUP_NAME}'. Nothing to do."
                )
            )
            return

        user.groups.add(group)

        # 4. Clear success message.
        self.stdout.write(
            self.style.SUCCESS(
                f"Added user '{user.email}' to group "
                f"'{SUPPORT_GROUP_NAME}'. "
                f"They can now access /support-dashboard."
            )
        )