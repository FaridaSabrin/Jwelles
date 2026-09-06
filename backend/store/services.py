import math
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

import requests

from .models import DeliveryServiceArea, PincodeLocation

POSTAL_API_BASE_URL = "https://api.postalpincode.in/pincode"
REQUESTS_TIMEOUT = getattr(settings, "REQUESTS_TIMEOUT", 5)

# The API resets connections made with the default python-requests
# User-Agent (likely basic bot filtering) — a browser-like one works fine.
REQUESTS_HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; JewelleryStoreBackend/1.0)"}


def get_pincode_details(pincode):
    """Fetch pincode details from the India Post pincode API."""
    try:
        response = requests.get(f"{POSTAL_API_BASE_URL}/{pincode}", timeout=REQUESTS_TIMEOUT, headers=REQUESTS_HEADERS)
        response.raise_for_status()
        data = response.json()

        if data and isinstance(data, list) and len(data) > 0:
            first_result = data[0]
            if first_result.get("Status") == "Success" and first_result.get("PostOffice"):
                post_office = first_result["PostOffice"][0]
                return {
                    "pincode": pincode,
                    "city": post_office.get("District", ""),
                    "district": post_office.get("District", ""),
                    "state": post_office.get("State", ""),
                    "country": post_office.get("Country", "India"),
                    "raw_response": first_result,
                }
    except requests.RequestException:
        pass

    return None


def get_cached_or_fetch_pincode(pincode):
    """Get pincode location from the local cache, or fetch + cache it."""
    try:
        pincode_location = PincodeLocation.objects.get(pincode=pincode)
        if pincode_location.updated_at >= timezone.now() - timedelta(days=7):
            return pincode_location
    except PincodeLocation.DoesNotExist:
        pass

    details = get_pincode_details(pincode)
    if details:
        pincode_location, _ = PincodeLocation.objects.update_or_create(
            pincode=pincode,
            defaults={
                "city": details["city"],
                "district": details["district"],
                "state": details["state"],
                "country": details["country"],
                "raw_response": details["raw_response"],
            },
        )
        return pincode_location

    return None


def calculate_distance_km(lat1, lon1, lat2, lon2):
    """Great-circle distance between two points, via the Haversine formula."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None

    earth_radius_km = 6371

    lat1_rad, lon1_rad = math.radians(float(lat1)), math.radians(float(lon1))
    lat2_rad, lon2_rad = math.radians(float(lat2)), math.radians(float(lon2))

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))

    return earth_radius_km * c


# Fallback coordinates for major Indian cities, used when the postal API
# response doesn't carry coordinates (it normally doesn't) and there is no
# paid geocoding API key configured. Good enough for a small-business radius
# check; swap in a real geocoder (Google/Mapbox) here if one becomes available.
_CITY_COORDINATES = {
    "new delhi": (28.6139, 77.2090),
    "central delhi": (28.6519, 77.2315),
    "delhi": (28.7041, 77.1025),
    "mumbai": (19.0760, 72.8777),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "chennai": (13.0827, 80.2707),
    "kolkata": (22.5726, 88.3639),
    "hyderabad": (17.3850, 78.4867),
    "pune": (18.5204, 73.8567),
    "ahmedabad": (23.0225, 72.5714),
    "jaipur": (26.9124, 75.7873),
    "gurugram": (28.4595, 77.0266),
    "gurgaon": (28.4595, 77.0266),
    "noida": (28.5355, 77.3910),
}


NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
# Nominatim (OpenStreetMap's free, keyless geocoding service) requires an
# identifying User-Agent and a max of ~1 request/second — see
# https://operations.osmfoundation.org/policies/nominatim/. We only ever hit
# it once per pincode (result is cached on PincodeLocation indefinitely
# after that, via get_cached_or_fetch_pincode's 7-day-fresh check), so this
# is well within the policy for normal traffic.
NOMINATIM_HEADERS = {"User-Agent": "JewelleryStoreBackend/1.0 (pincode geocoding)"}


def geocode_district_state(district, state, country="India"):
    """Looks up real coordinates for a district/state via Nominatim — used
    as the all-India fallback when a pincode's city isn't in the small
    offline _CITY_COORDINATES table below. Returns (None, None) rather than
    guessing if the lookup fails or finds nothing; coordinates are never
    fabricated (see get_serviceability's handling of a None,None result)."""
    query = ", ".join(part for part in (district, state, country) if part)
    if not query:
        return None, None

    try:
        response = requests.get(
            NOMINATIM_SEARCH_URL,
            params={"format": "json", "countrycodes": "in", "limit": 1, "q": query},
            timeout=REQUESTS_TIMEOUT,
            headers=NOMINATIM_HEADERS,
        )
        response.raise_for_status()
        results = response.json()
        if results:
            return float(results[0]["lat"]), float(results[0]["lon"])
    except (requests.RequestException, ValueError, KeyError, IndexError):
        pass

    return None, None


def geocode_pincode(pincode_location):
    """Best-effort geocoding for a cached pincode location. Tries, in order:
    0) coordinates already saved on this PincodeLocation from a previous
       call — this is what keeps the Nominatim lookup below to roughly once
       per pincode rather than once per request (PincodeLocation rows are
       otherwise reused as-is for 7 days by get_cached_or_fetch_pincode, but
       that reuse happens before this function runs, so without this check
       step 3 would re-hit Nominatim on every single request for any
       pincode outside the offline table — this line is what prevents that),
    1) coordinates already embedded in the India Post response (it doesn't
       currently return any, but future-proofs against it changing),
    2) a small offline table of major-city coordinates (fast, no network),
    3) a live Nominatim lookup by district/state — this is what extends
       coverage to all of India rather than just the handful of cities in
       the offline table, without ever inventing a value."""
    if pincode_location.latitude is not None and pincode_location.longitude is not None:
        return pincode_location.latitude, pincode_location.longitude

    raw_response = pincode_location.raw_response or {}
    if "latitude" in raw_response and "longitude" in raw_response:
        return raw_response["latitude"], raw_response["longitude"]

    city = (pincode_location.city or pincode_location.district or pincode_location.state or "").lower()
    if city in _CITY_COORDINATES:
        return _CITY_COORDINATES[city]

    return geocode_district_state(pincode_location.district or pincode_location.city, pincode_location.state)


def get_delivery_estimate(service_area=None, delivery_days_min=None, delivery_days_max=None):
    today = timezone.localdate()

    if service_area:
        delivery_days_min, delivery_days_max = service_area.delivery_days_min, service_area.delivery_days_max

    return {
        "start": (today + timedelta(days=delivery_days_min if delivery_days_min is not None else 3)).isoformat(),
        "end": (today + timedelta(days=delivery_days_max if delivery_days_max is not None else 6)).isoformat(),
    }


def _check_service_areas(latitude, longitude):
    """Checks a coordinate against every active DeliveryServiceArea.

    This is THE delivery decision — not a sanity check, not a country-wide
    bounding box. Returns (matched_area, matched_distance, nearest_area,
    nearest_distance):
      * matched_area/matched_distance: the (nearest) area the point falls
        WITHIN (distance <= that area's radius_km); None if it's outside
        every configured area, in which case the location is NOT serviceable.
      * nearest_area/nearest_distance: the closest active area regardless of
        radius, kept only so an "outside radius" response can still explain
        how far away and which radius applies.

    Delivery areas are read entirely from the database — no city name or
    coordinate is hardcoded here, so adding a Mumbai or Bengaluru
    DeliveryServiceArea row immediately extends coverage with no code
    change."""
    if latitude is None or longitude is None:
        return None, None, None, None

    matched_area = matched_distance = None
    nearest_area = nearest_distance = None

    for area in DeliveryServiceArea.objects.filter(active=True):
        distance = calculate_distance_km(latitude, longitude, area.center_latitude, area.center_longitude)
        if distance is None:
            continue
        if nearest_distance is None or distance < nearest_distance:
            nearest_area, nearest_distance = area, distance
        if distance <= float(area.radius_km) and (matched_distance is None or distance < matched_distance):
            matched_area, matched_distance = area, distance

    return matched_area, matched_distance, nearest_area, nearest_distance


# ---------------------------------------------------------------------
# TEMPORARY DEBUG INSTRUMENTATION
# ---------------------------------------------------------------------
# Requested while investigating an unexpectedly large serviceability
# distance. Prints the exact inputs/output of a radius check to the
# runserver console (DEBUG-only — never runs with DEBUG=False, and the
# same block is what ServiceabilityView optionally echoes back in the API
# response under "debug"). Safe to delete once the investigation is done;
# doesn't touch the actual calculation.
def _build_debug_block(source, latitude, longitude, area, distance_km, accuracy_meters=None):
    """Builds the "debug" block echoed in the API response (DEBUG-only —
    stripped by ServiceabilityView when settings.DEBUG is False) and printed
    to the console, in the exact shape asked for during this investigation:
    USER LOCATION / SERVICE AREA / CALCULATED / SOURCE."""
    debug = {
        "source": source,  # "browser-geolocation" or "pincode-derived-fallback"
        "user_latitude": latitude,
        "user_longitude": longitude,
        "service_area": {
            "name": area.name,
            "latitude": float(area.center_latitude),
            "longitude": float(area.center_longitude),
            "radius_km": float(area.radius_km),
        } if area else None,
        "distance_km": distance_km,
    }
    if accuracy_meters is not None:
        debug["accuracy_meters"] = accuracy_meters

    if settings.DEBUG:
        area_name = area.name if area else None
        area_lat = area.center_latitude if area else None
        area_lon = area.center_longitude if area else None
        area_radius = area.radius_km if area else None
        accuracy_part = f", accuracy={accuracy_meters}m" if accuracy_meters is not None else ""
        message = (
            f"[serviceability debug] SOURCE: {source} | "
            f"USER LOCATION: lat={latitude}, lng={longitude}{accuracy_part} | "
            f"SERVICE AREA: name={area_name!r}, lat={area_lat}, lng={area_lon}, radius_km={area_radius} | "
            f"CALCULATED distance_km={distance_km}"
        )
        print(message, flush=True)  # stdout is block-buffered when redirected (e.g. runserver piped to a log file) — force it out immediately
    return debug


def get_serviceability_by_coordinates(latitude, longitude, accuracy_meters=None):
    """Authoritative serviceability check using exact coordinates — meant for
    the browser Geolocation API's position.coords.{latitude,longitude}. This
    is preferred over get_serviceability() below because a pincode covers an
    area, not a point; use this whenever real coordinates are available.

    Serviceable strictly means: within radius_km of at least one active
    DeliveryServiceArea. A coordinate merely being "somewhere in India" is
    NOT sufficient — see _check_service_areas().

    accuracy_meters (position.coords.accuracy) is optional and purely
    informational — echoed in the debug block, never used in the decision."""
    matched_area, matched_distance, nearest_area, nearest_distance = _check_service_areas(latitude, longitude)

    if matched_area:
        debug = _build_debug_block("browser-geolocation", latitude, longitude, matched_area, round(matched_distance, 2), accuracy_meters)
        delivery_estimate = get_delivery_estimate(matched_area)
        return {
            "success": True,
            "serviceable": True,
            "distance_km": round(matched_distance, 2),
            "radius_km": float(matched_area.radius_km),
            "service_area": matched_area.name,
            "delivery_days_min": matched_area.delivery_days_min,
            "delivery_days_max": matched_area.delivery_days_max,
            "delivery_start": delivery_estimate["start"],
            "delivery_end": delivery_estimate["end"],
            "message": "Delivery available at your location.",
            "debug": debug,
        }

    distance_km = round(nearest_distance, 2) if nearest_distance is not None else None
    debug = _build_debug_block("browser-geolocation", latitude, longitude, nearest_area, distance_km, accuracy_meters)
    return {
        "success": True,
        "serviceable": False,
        "distance_km": distance_km,
        "radius_km": float(nearest_area.radius_km) if nearest_area else None,
        "service_area": nearest_area.name if nearest_area else None,
        "message": "Sorry, we do not currently deliver to your current location.",
        "debug": debug,
    }


def get_serviceability(pincode):
    """Pincode-only serviceability check — the fallback path used when the
    browser's exact coordinates aren't available (permission denied,
    unsupported browser, etc.), and the primary signal for the checkout
    page's pincode field.

    IMPORTANT: a pincode being real (India Post resolves it) is NOT the same
    as it being serviceable — PincodeLocation only ever answers "where is
    this", never "do we deliver there". Serviceability is decided purely by
    distance to an active DeliveryServiceArea, exactly like the coordinate
    path above. If the pincode can't be geocoded to a lat/lon at all, we
    can't compute that distance, so it's reported not serviceable (with a
    distinct message) rather than assumed either way."""
    pincode_location = get_cached_or_fetch_pincode(pincode)

    if not pincode_location:
        return {
            "success": False,
            "pincode": pincode,
            "serviceable": False,
            "message": "Please enter a valid 6-digit pincode.",
        }

    lat, lon = geocode_pincode(pincode_location)
    if lat and lon:
        pincode_location.latitude, pincode_location.longitude = lat, lon
        pincode_location.save(update_fields=["latitude", "longitude"])

    base = {
        "success": True,
        "pincode": pincode,
        "city": pincode_location.city,
        "district": pincode_location.district,
        "state": pincode_location.state,
        "country": pincode_location.country,
    }

    if lat is None or lon is None:
        return {
            **base,
            "serviceable": False,
            "message": "We couldn't confirm delivery availability for this location. Please try again or use current location.",
        }

    matched_area, matched_distance, nearest_area, nearest_distance = _check_service_areas(lat, lon)

    if matched_area:
        debug = _build_debug_block("pincode-derived-fallback", lat, lon, matched_area, round(matched_distance, 2))
        delivery_estimate = get_delivery_estimate(matched_area)
        return {
            **base,
            "serviceable": True,
            "delivery_days_min": matched_area.delivery_days_min,
            "delivery_days_max": matched_area.delivery_days_max,
            "delivery_start": delivery_estimate["start"],
            "delivery_end": delivery_estimate["end"],
            "distance_km": round(matched_distance, 2),
            "radius_km": float(matched_area.radius_km),
            "service_area": matched_area.name,
            "message": "Delivery available at this pincode.",
            "debug": debug,
        }

    distance_km = round(nearest_distance, 2) if nearest_distance is not None else None
    debug = _build_debug_block("pincode-derived-fallback", lat, lon, nearest_area, distance_km)
    return {
        **base,
        "serviceable": False,
        "distance_km": distance_km,
        "radius_km": float(nearest_area.radius_km) if nearest_area else None,
        "service_area": nearest_area.name if nearest_area else None,
        "message": "Sorry, delivery is currently unavailable at this location.",
        "debug": debug,
    }
