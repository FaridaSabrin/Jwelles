
from rest_framework import permissions


class IsSupportStaff(permissions.BasePermission):
    """
    Allows access to:
    - Django superusers/admins
    - Users assigned to the "Support Staff" Django group

    Support Staff do not need is_staff=True, which keeps them
    separate from Django Admin access.
    """

    message = "You do not have permission to access support management."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return bool(
            request.user.is_superuser
            or request.user.groups.filter(name="Support Staff").exists()
        )
