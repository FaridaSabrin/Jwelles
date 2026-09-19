
"""
Django settings for config project.
"""

from pathlib import Path
import logging
import os

from dotenv import load_dotenv


# =========================================================
# BASE DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv(BASE_DIR / ".env")

# Module-level logger for settings-time diagnostics.
_settings_logger = logging.getLogger("config.settings")


# =========================================================
# SECURITY
# =========================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-development-key",
)

DEBUG = os.getenv(
    "DEBUG",
    "True",
).lower() == "true"

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    "jwelles.onrender.com",
]


# =========================================================
# APPLICATIONS
# =========================================================

INSTALLED_APPS = [

    # -----------------------------------------------------
    # Django built-in apps
    # -----------------------------------------------------

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # -----------------------------------------------------
    # Third-party apps
    # -----------------------------------------------------

    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",

    # Cloudinary
    "cloudinary",

    # -----------------------------------------------------
    # Project apps
    # -----------------------------------------------------

    "store",
]


# =========================================================
# MIDDLEWARE
# =========================================================

MIDDLEWARE = [

    "django.middleware.security.SecurityMiddleware",

    # WhiteNoise serves Django static files in production.
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    # CORS middleware must be before CommonMiddleware.
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =========================================================
# URL CONFIGURATION
# =========================================================

ROOT_URLCONF = "config.urls"


# =========================================================
# TEMPLATES
# =========================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [
            BASE_DIR / "templates",
        ],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# =========================================================
# WSGI / ASGI
# =========================================================

WSGI_APPLICATION = "config.wsgi.application"

ASGI_APPLICATION = "config.asgi.application"


# =========================================================
# DATABASE - AIVEN MYSQL
# =========================================================

DB_SSL_CA = BASE_DIR / "certs" / "ca.pem"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",

        "NAME": os.getenv(
            "DB_NAME",
            "defaultdb",
        ),

        "USER": os.getenv(
            "DB_USER",
            "avnadmin",
        ),

        "PASSWORD": os.getenv(
            "DB_PASSWORD",
        ),

        "HOST": os.getenv(
            "DB_HOST",
            "mysql-38688417-jwelles-95f.h.aivencloud.com",
        ),

        "PORT": os.getenv(
            "DB_PORT",
            "21912",
        ),

        "OPTIONS": {
            "charset": "utf8mb4",

            "ssl": {
                "ca": str(DB_SSL_CA),
            },
        },

        "CONN_MAX_AGE": 60,
    }
}


# =========================================================
# CLOUDINARY CONFIGURATION
# =========================================================

CLOUDINARY_CLOUD_NAME = os.getenv(
    "CLOUDINARY_CLOUD_NAME"
)

CLOUDINARY_API_KEY = os.getenv(
    "CLOUDINARY_API_KEY"
)

CLOUDINARY_API_SECRET = os.getenv(
    "CLOUDINARY_API_SECRET"
)


# Cloudinary SDK configuration.
import cloudinary

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)


# =========================================================
# GOODRETURNS MARKET PRICING
# =========================================================
#
# GoodReturns is used as the server-side web source for
# Indian metal rates.
#
# Metals currently supported:
#   - Gold
#   - Silver
#   - Platinum
#
# Palladium remains part of JWELLES' supported metal list,
# but GoodReturns is not configured here as a verified
# palladium source.
#
# The frontend does NOT access GoodReturns directly.
#
# Flow:
#
# GoodReturns
#      ↓
# Django pricing provider
#      ↓
# Market-price cache
#      ↓
# Existing JWELLES product-pricing logic
#      ↓
# Frontend
#
# =========================================================

GOODRETURNS_GOLD_URL = os.getenv(
    "GOODRETURNS_GOLD_URL",
    "https://www.goodreturns.in/gold-rates/",
).strip()

GOODRETURNS_SILVER_URL = os.getenv(
    "GOODRETURNS_SILVER_URL",
    "https://www.goodreturns.in/silver-rates/",
).strip()

GOODRETURNS_PLATINUM_URL = os.getenv(
    "GOODRETURNS_PLATINUM_URL",
    "https://www.goodreturns.in/platinum-price.html",
).strip()


# Fresh cache duration.
#
# After this period the backend attempts to refresh the
# GoodReturns prices.
GOODRETURNS_CACHE_TTL = int(
    os.getenv(
        "GOODRETURNS_CACHE_TTL",
        "300",
    )
)


# Maximum period for serving stale cached data if the
# upstream GoodReturns page is temporarily unavailable.
GOODRETURNS_CACHE_MAX_STALE = int(
    os.getenv(
        "GOODRETURNS_CACHE_MAX_STALE",
        "3600",
    )
)


# HTTP request timeout for GoodReturns.
GOODRETURNS_REQUEST_TIMEOUT = int(
    os.getenv(
        "GOODRETURNS_REQUEST_TIMEOUT",
        "10",
    )
)


_settings_logger.info(
    "GoodReturns market pricing configured: "
    "gold=%s silver=%s platinum=%s cache_ttl=%ss "
    "max_stale=%ss timeout=%ss",
    GOODRETURNS_GOLD_URL,
    GOODRETURNS_SILVER_URL,
    GOODRETURNS_PLATINUM_URL,
    GOODRETURNS_CACHE_TTL,
    GOODRETURNS_CACHE_MAX_STALE,
    GOODRETURNS_REQUEST_TIMEOUT,
)


# =========================================================
# STONE PRICING (OpenFacet + FX) — backend-only
# =========================================================
#
# Diamond benchmark source: OpenFacet public matrix data.
# Currency conversion: open.er-api.com.
#
# This section is independent of GoodReturns metal pricing.
# Do not mix metal and stone pricing here.
# =========================================================

STONE_OPENFACET_MATRIX_URL = os.getenv(
    "STONE_OPENFACET_MATRIX_URL",
    "https://data.openfacet.net/matrix.json",
).strip()

STONE_FX_URL = os.getenv(
    "STONE_FX_URL",
    "https://open.er-api.com/v6/latest/USD",
).strip()

STONE_PROVIDER_TIMEOUT = int(
    os.getenv(
        "STONE_PROVIDER_TIMEOUT",
        "8",
    )
)

STONE_CACHE_TTL = int(
    os.getenv(
        "STONE_CACHE_TTL",
        "3600",
    )
)

STONE_FX_CACHE_TTL = int(
    os.getenv(
        "STONE_FX_CACHE_TTL",
        "43200",
    )
)

STONE_MAX_STALE_SECONDS = int(
    os.getenv(
        "STONE_MAX_STALE_SECONDS",
        "86400",
    )
)


# =========================================================
# CACHES
# =========================================================
#
# Django's locmem cache is per-process.
#
# With a single Render worker this is fine for the current
# market-pricing cache.
#
# If multiple workers are introduced later, Redis can be
# used without changing the standard Django cache calls
# inside market_pricing.py.
# =========================================================

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "jwelles-default",
        "TIMEOUT": 300,
    }
}


# =========================================================
# PASSWORD VALIDATION
# =========================================================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME":
        "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },

    {
        "NAME":
        "django.contrib.auth.password_validation.MinimumLengthValidator",
    },

    {
        "NAME":
        "django.contrib.auth.password_validation.CommonPasswordValidator",
    },

    {
        "NAME":
        "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# =========================================================
# INTERNATIONALIZATION
# =========================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# =========================================================
# STATIC FILES
# =========================================================

STATIC_URL = "/static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
)


# =========================================================
# MEDIA FILES
# =========================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# =========================================================
# DEFAULT PRIMARY KEY
# =========================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# =========================================================
# DJANGO REST FRAMEWORK
# =========================================================

REST_FRAMEWORK = {

    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],

    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],

    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
}


# =========================================================
# CORS CONFIGURATION
# =========================================================

CORS_ALLOWED_ORIGINS = [

    # -----------------------------------------------------
    # Local React / Vite
    # -----------------------------------------------------

    "http://localhost:5174",
    "http://127.0.0.1:5174",

    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # -----------------------------------------------------
    # Other local development
    # -----------------------------------------------------

    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # -----------------------------------------------------
    # Production Frontend - Vercel
    # -----------------------------------------------------

    "https://jwelles.vercel.app",

    # -----------------------------------------------------
    # Production Backend - Render
    # -----------------------------------------------------

    "https://jwelles.onrender.com",
]


# =========================================================
# CORS HEADERS
# =========================================================

CORS_ALLOW_HEADERS = [

    "accept",

    "accept-encoding",

    "authorization",

    "content-type",

    "dnt",

    "origin",

    "user-agent",

    "x-csrftoken",

    "x-requested-with",
]


# =========================================================
# CORS METHODS
# =========================================================

CORS_ALLOW_METHODS = [

    "DELETE",

    "GET",

    "OPTIONS",

    "PATCH",

    "POST",

    "PUT",
]


# =========================================================
# CSRF TRUSTED ORIGINS
# =========================================================

CSRF_TRUSTED_ORIGINS = [

    # -----------------------------------------------------
    # Local React / Vite
    # -----------------------------------------------------

    "http://localhost:5174",
    "http://127.0.0.1:5174",

    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # -----------------------------------------------------
    # Other local development
    # -----------------------------------------------------

    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # -----------------------------------------------------
    # Production Frontend - Vercel
    # -----------------------------------------------------

    "https://jwelles.vercel.app",

    # -----------------------------------------------------
    # Production Backend - Render
    # -----------------------------------------------------

    "https://jwelles.onrender.com",
]


# =========================================================
# EMAIL (Brevo Transactional REST API)
# =========================================================

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

BREVO_API_KEY = os.getenv(
    "BREVO_API_KEY",
    "",
).strip()

BREVO_SENDER_EMAIL = os.getenv(
    "BREVO_SENDER_EMAIL",
    "",
).strip()

BREVO_SENDER_NAME = os.getenv(
    "BREVO_SENDER_NAME",
    "Jwelles",
).strip()


EMAIL_CONFIGURED = bool(
    BREVO_API_KEY and BREVO_SENDER_EMAIL
)


if not EMAIL_CONFIGURED:

    _log = (
        _settings_logger.critical
        if not DEBUG
        else _settings_logger.warning
    )

    _log(
        "BREVO_API_KEY / BREVO_SENDER_EMAIL are not set. "
        "OTP emails CANNOT be sent until both are configured "
        "(Render -> Environment in production, backend/.env locally)."
    )


DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    (
        f"{BREVO_SENDER_NAME} <{BREVO_SENDER_EMAIL}>"
        if BREVO_SENDER_EMAIL
        else "webmaster@localhost"
    ),
)


# =========================================================
# DEVELOPMENT / PRODUCTION SECURITY
# =========================================================

if not DEBUG:

    SECURE_SSL_REDIRECT = True

    SESSION_COOKIE_SECURE = True

    CSRF_COOKIE_SECURE = True

    SECURE_HSTS_SECONDS = 31536000

    SECURE_HSTS_INCLUDE_SUBDOMAINS = True

    SECURE_HSTS_PRELOAD = True


# =========================================================
# LOGGING
# =========================================================

LOGGING = {
    "version": 1,

    "disable_existing_loggers": False,

    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name}: {message}",
            "style": "{",
        },
    },

    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },

    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },

    "loggers": {

        "django": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },

        "store": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },

        "config.settings": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

