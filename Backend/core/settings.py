from pathlib import Path
import os
from dotenv import load_dotenv

load_dotenv()

# ===========================
# BASE
# ===========================
BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = True
SECRET_KEY = os.getenv("SECRET_KEY")
ALLOWED_HOSTS = []

# ===========================
# APPS
# ===========================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # REST + auth
    "rest_framework",
    "rest_framework.authtoken",
    # Cloudinary
    "cloudinary",
    "cloudinary_storage",
    # Celery
    "django_celery_results",
    # Apps
    "users.apps.UsersConfig",
    "videos.apps.VideosConfig",
    "shorts.apps.ShortsConfig",
    # Swagger
    "drf_yasg",
]

# ===========================
# MIDDLEWARE
# ===========================
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
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

WSGI_APPLICATION = "core.wsgi.application"

# ===========================
# DATABASE
# ===========================
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ===========================
# PASSWORD VALIDATION
# ===========================
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ===========================
# INTERNATIONALIZATION
# ===========================
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ===========================
# STATIC & MEDIA
# ===========================
STATIC_URL = "/static/"
AUTH_USER_MODEL = "users.User"

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.getenv("CLOUD_NAME"),
    "API_KEY": os.getenv("API_KEY"),
    "API_SECRET": os.getenv("API_SECRET"),
}

# ===========================
# CELERY
# ===========================
CELERY_BROKER_URL = "redis://localhost:6379/0"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_BACKEND = "django-db"
CELERY_RESULT_EXTENDED = True

# ===========================
# REST FRAMEWORK
# ===========================
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
}

# ===========================
# SWAGGER
# ===========================
SWAGGER_SETTINGS = {
    "USE_SESSION_AUTH": False,  # No usar session auth
    "SECURITY_DEFINITIONS": {
        "Token": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
        }
    },
    "DEFAULT_MODEL_RENDERING": "example",
    "SWAGGER_UI_BUNDLE_JS": "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.5.0/swagger-ui-bundle.js",
    "SWAGGER_UI_STANDALONE_PRESET_JS": "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.5.0/swagger-ui-standalone-preset.js",
    "SWAGGER_UI_CSS": "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.5.0/swagger-ui.css",
    "DEEP_LINKING": True,
    "SHOW_EXTENSIONS": True,
    "SHOW_COMMON_EXTENSIONS": True,
}

# ===========================
# DEFAULT PRIMARY KEY
# ===========================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
