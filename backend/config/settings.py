"""
Django settings for config project.
"""

from pathlib import Path
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

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"


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
# EMAIL
# =========================================================

EMAIL_BACKEND = (
    "django.core.mail.backends.console.EmailBackend"
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