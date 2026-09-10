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

# Module-level logger for settings-time diagnostics (e.g. missing Brevo
# credentials). Real handler/formatter config lives in LOGGING below; this
# just needs `logging` configured enough that the message reaches stderr,
# which Render captures regardless.
_settings_logger = logging.getLogger("config.settings")


# =========================================================
# SECURITY
# =========================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "django-insecure-development-key",
)

DEBUG = os.getenv("DEBUG", "True").lower() == "true"

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

    # WhiteNoise serves Django static files in production
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    # CORS middleware must be before CommonMiddleware
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
#
# Cloudinary stores uploaded images.
#
# Aiven:
#   Stores application/database information
#
# Cloudinary:
#   Stores product/category/custom-jewelry images
#
# Render:
#   Runs Django backend
#
# IMPORTANT:
# Never hard-code the API secret here.
# Store credentials in .env locally and Render
# Environment Variables in production.
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


# Cloudinary SDK configuration
import cloudinary

cloudinary.config(
    cloud_name=CLOUDINARY_CLOUD_NAME,
    api_key=CLOUDINARY_API_KEY,
    api_secret=CLOUDINARY_API_SECRET,
)


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

# WhiteNoise storage for production static files
STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
)


# =========================================================
# MEDIA FILES
# =========================================================
#
# These settings can remain for existing local media files.
#
# New Cloudinary images will not depend on Render's
# local filesystem when your models use CloudinaryField.
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
#
# OTP emails are sent via a direct HTTPS call to Brevo's REST API
# (POST https://api.brevo.com/v3/smtp/email) from store/views.py's
# send_otp_email() — not through Django's SMTP email backend. This avoids
# SMTP entirely (no EMAIL_HOST/EMAIL_HOST_USER/EMAIL_HOST_PASSWORD, no SMTP
# login vs. sender-email confusion, no port 587 connectivity issues).
#
# Required environment variables (set in Render -> Environment, and in
# backend/.env for local development):
#
#   BREVO_API_KEY       - Brevo dashboard -> SMTP & API -> API Keys tab.
#                          This is a REST API key, sent as the `api-key`
#                          header — NOT the SMTP key from the SMTP tab
#                          (that credential is for SMTP only and does not
#                          work here).
#   BREVO_SENDER_EMAIL  - a sender address VERIFIED in your Brevo account
#                          (Brevo rejects sends from unverified senders).
#   BREVO_SENDER_NAME   - display name for the From header. Optional,
#                          defaults to "Jwelles".
#
# BREVO_API_URL below is the fixed Brevo endpoint — not meant to be
# overridden per environment, just kept as a named setting instead of a
# magic string inline in views.py.
#
# EMAIL_CONFIGURED tells send_otp_email() whether it can even attempt a
# send. There is deliberately no "fall back to printing the email
# somewhere" path for missing/invalid config, in dev or production: if
# it's not configured, send_otp_email() returns False and the caller
# (RegisterView / ResendOTPView) reports the failure instead of a false
# "OTP sent" success.
# =========================================================

BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "").strip()
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL", "").strip()
BREVO_SENDER_NAME = os.getenv("BREVO_SENDER_NAME", "Jwelles").strip()

EMAIL_CONFIGURED = bool(BREVO_API_KEY and BREVO_SENDER_EMAIL)

if not EMAIL_CONFIGURED:
    _log = _settings_logger.critical if not DEBUG else _settings_logger.warning
    _log(
        "BREVO_API_KEY / BREVO_SENDER_EMAIL are not set. OTP emails CANNOT "
        "be sent until both are configured (Render -> Environment in "
        "production, backend/.env locally)."
    )

DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    f"{BREVO_SENDER_NAME} <{BREVO_SENDER_EMAIL}>" if BREVO_SENDER_EMAIL else "webmaster@localhost",
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
#
# Render captures whatever the process writes to stdout/stderr as the
# service's logs, so a plain StreamHandler is all that's needed here —
# no external log service required. This is what makes the
# "OTP generated" / "Attempting to send OTP email" / "OTP email sent
# successfully" / "Failed to send OTP email: <error>" messages from
# store/views.py show up in the Render dashboard's Logs tab.
#
# Only messages and exception text are logged — nowhere in this project
# do we log passwords, the Brevo SMTP key, or OTP values themselves.
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
        # store.views: registration / OTP generation / OTP email sending
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