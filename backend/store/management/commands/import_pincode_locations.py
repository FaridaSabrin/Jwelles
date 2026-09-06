"""Populates store.models.PincodeLocation with real, all-India pincode ->
city/district/state/latitude/longitude data.

Reuses the exact same lookup chain the checkout API already relies on
(store.services.get_cached_or_fetch_pincode + geocode_pincode) instead of
introducing a second, parallel data pipeline:

  pincode -> India Post API -> city/district/state (cached on PincodeLocation)
          -> geocode_pincode(): offline major-city table, else a live
             Nominatim/OpenStreetMap lookup by district+state (also cached)

Nothing is ever fabricated: if a pincode can't be resolved by India Post, or
its district/state can't be geocoded by Nominatim, the corresponding
field(s) are left None rather than guessed — see geocode_pincode()'s
docstring in store/services.py.

Usage:
    python manage.py import_pincode_locations
    python manage.py import_pincode_locations --pincodes 110001,400001
    python manage.py import_pincode_locations --force   # bypass the normal 7-day freshness cache

Safe to run repeatedly: PincodeLocation.pincode is unique, records are
written with update_or_create-equivalent semantics (via
get_cached_or_fetch_pincode), nothing is ever deleted, and unrelated tables
are untouched.
"""
import time
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from store import services
from store.models import PincodeLocation

# A representative pincode from every state and union territory, so a fresh
# database has at least one working example everywhere out of the box. This
# is a starting set for convenience/testing — NOT the full ~19,000-pincode
# all-India list, and it doesn't need to be: any other pincode is resolved
# automatically, live, the first time a shopper enters it (same lookup
# chain, see the module docstring above).
DEFAULT_PINCODES = [
    "110001",  # Delhi
    "249407",  # Haridwar, Uttarakhand
    "400001",  # Mumbai, Maharashtra
    "560001",  # Bengaluru, Karnataka
    "700001",  # Kolkata, West Bengal
    "600001",  # Chennai, Tamil Nadu
    "500001",  # Hyderabad, Telangana
    "380001",  # Ahmedabad, Gujarat
    "302001",  # Jaipur, Rajasthan
    "462001",  # Bhopal, Madhya Pradesh
    "160001",  # Chandigarh (UT)
    "781001",  # Guwahati, Assam
    "695001",  # Thiruvananthapuram, Kerala
    "190001",  # Srinagar, Jammu & Kashmir (UT)
    "403001",  # Panaji, Goa
    "744101",  # Port Blair, Andaman & Nicobar Islands (UT)
]

# Nominatim's usage policy asks for ~1 request/second; India Post has no
# published limit but the same pace is a reasonable, polite default.
REQUEST_INTERVAL_SECONDS = 1.1


class Command(BaseCommand):
    help = (
        "Populates PincodeLocation for a set of Indian pincodes (city/district/state "
        "via the India Post API, latitude/longitude via the same geocoding chain the "
        "checkout API uses). Safe to run repeatedly; never deletes or fabricates data."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--pincodes",
            type=str,
            default=None,
            help="Comma-separated 6-digit pincodes to import. Defaults to one representative pincode per state/UT.",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-fetch even pincodes already cached and fresh (bypasses the normal 7-day cache).",
        )

    def handle(self, *args, **options):
        raw_pincodes = options["pincodes"]
        pincodes = [p.strip() for p in raw_pincodes.split(",") if p.strip()] if raw_pincodes else DEFAULT_PINCODES
        force = options["force"]

        created = updated = failed = 0

        for pincode in pincodes:
            if not (pincode.isdigit() and len(pincode) == 6):
                self.stderr.write(self.style.WARNING(f"{pincode}: not a valid 6-digit Indian pincode — skipped."))
                failed += 1
                continue

            existed = PincodeLocation.objects.filter(pincode=pincode).exists()

            if force and existed:
                # Back-date so get_cached_or_fetch_pincode treats it as stale
                # and re-fetches, without deleting/recreating the row.
                PincodeLocation.objects.filter(pincode=pincode).update(updated_at=timezone.now() - timedelta(days=8))

            location = services.get_cached_or_fetch_pincode(pincode)
            if not location:
                self.stderr.write(self.style.WARNING(f"{pincode}: India Post API couldn't resolve this pincode — skipped."))
                failed += 1
                continue

            latitude, longitude = services.geocode_pincode(location)
            if latitude is not None and longitude is not None and (location.latitude != latitude or location.longitude != longitude):
                location.latitude, location.longitude = latitude, longitude
                location.save(update_fields=["latitude", "longitude"])

            if existed:
                updated += 1
            else:
                created += 1

            coord_note = f"({latitude}, {longitude})" if latitude is not None else "(coordinates unavailable — left null, not invented)"
            self.stdout.write(f"{pincode}: {location.city}, {location.district}, {location.state} {coord_note}")

            time.sleep(REQUEST_INTERVAL_SECONDS)

        self.stdout.write(self.style.SUCCESS(
            f"Done — {created} created, {updated} updated, {failed} failed/skipped (of {len(pincodes)} requested)."
        ))
