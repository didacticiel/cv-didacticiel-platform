# backend/config/settings/base.py

#Configuration de base pour le projet Django

import sys
import os
from pathlib import Path
from datetime import timedelta
import environ

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
APPS_DIR = BASE_DIR / "apps"

# Environment variables
env = environ.Env(
    DEBUG=(bool, False),
    USE_TZ=(bool, True),
)

# Take environment variables from .env file if it exists
environ.Env.read_env(BASE_DIR / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env('DEBUG')

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=[])

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.sitemaps',
]

THIRD_PARTY_APPS = [
    # REST Framework
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    
    # CORS pour React
    'corsheaders',
    
    # Filtres avancés
    'django_filters',
    
    # Documentation API
    'drf_spectacular',
    
    # Éditeur de texte riche
    'ckeditor',
    'ckeditor_uploader',
    
    # Gestion des images
    'easy_thumbnails',
    
    # Pagination avancée
    #'rest_framework_pagination',
    
    # Permissions avancées
    'guardian',
    
    # Cache
    'django_redis',
    
    # Monitoring
    'django_extensions',
    
    # Internationalisation
    'rosetta',
]

LOCAL_APPS = [
    #'apps.users',
    'apps.courses',
    'apps.quiz',
    'apps.notifications',
    'apps.analytics',
    'apps.support',
    'apps.common',
    'apps.users.apps.UsersConfig',
    'apps.organizations',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

AUTH_USER_MODEL = 'users.User'

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Pour servir les fichiers statiques
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'apps.common.middleware.LastActivityMiddleware',  # Middleware personnalisé
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DATABASE_NAME'),
        'USER': env('DATABASE_USER'),
        'PASSWORD': env('DATABASE_PASSWORD'),
        'HOST': env('DATABASE_HOST', default='localhost'),
        'PORT': env('DATABASE_PORT', default='5432'),
        'ATOMIC_REQUESTS': True,
        'CONN_MAX_AGE': 60,
        'OPTIONS': {
            'sslmode': 'require',  # si using SSL
            'connect_timeout': 5,
        },
    }
}

# Cache configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': env('REDIS_URL', default='redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'elearning',
        'TIMEOUT': 300,
    }
}

# Sessions
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 1209600  # 2 weeks


AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
)
ANONYMOUS_USER_NAME = None  # optionnel, évite user anonyme Guardian

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
    #{
    #   'NAME': 'apps.users.validators.CustomPasswordValidator',
    #},
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = "Africa/Porto-Novo"
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ('fr', 'Français'),
    ('en', 'English'),
    ('es', 'Español'),
]

LOCALE_PATHS = [
    BASE_DIR / 'locale',
]

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

STATICFILES_FINDERS = [
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
]

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom user model
#AUTH_USER_MODEL = 'users.User'

# Site framework
SITE_ID = 1

# Django REST Framework

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'apps.users.authentication.CustomJWTAuthentication',  
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'apps.common.pagination.CustomPageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'login': '5/min',
    },
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}


# SIMPLE JWT configuration (SimpleJWT officiel)
from datetime import timedelta

# SimpleJWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# Cookies JWT HttpOnly
JWT_COOKIE_NAME = "didacticiel_jwt"
JWT_REFRESH_COOKIE_NAME = "didacticiel_jwt_refresh"
JWT_COOKIE_SECURE = True       # True en prod HTTPS
JWT_COOKIE_SAMESITE = "Lax"    # "Strict" possible
JWT_COOKIE_HTTPONLY = True






# CORS settings pour React
CORS_ALLOW_ALL_ORIGINS = True 

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:5173',
    'http://127.0.0.1:5173',
])

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Documentation API
SPECTACULAR_SETTINGS = {
    'TITLE': 'E-Learning Platform API',
    'DESCRIPTION': 'API complète pour la plateforme d\'apprentissage en ligne',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
    'DEFAULT_GENERATOR_CLASS': 'drf_spectacular.generators.SchemaGenerator',
    'SERVE_PERMISSIONS': ['rest_framework.permissions.IsAuthenticated'],
    'SERVERS': [
        {'url': 'http://localhost:8000', 'description': 'Development server'},
        {'url': 'https://api.example.com', 'description': 'Production server'},
    ],
    'TAGS': [
        {'name': 'Authentication', 'description': 'Endpoints d\'authentification'},
        {'name': 'Users', 'description': 'Gestion des utilisateurs'},
        {'name': 'Courses', 'description': 'Gestion des cours'},
        {'name': 'Lessons', 'description': 'Gestion des leçons'},
        {'name': 'Quiz', 'description': 'Système de quiz'},
        {'name': 'Progress', 'description': 'Suivi des progrès'},
        {'name': 'Notifications', 'description': 'Système de notifications'},
    ],
}

# CKEditor Configuration
CKEDITOR_UPLOAD_PATH = "uploads/"
CKEDITOR_IMAGE_BACKEND = "pillow"
CKEDITOR_JQUERY_URL = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js'

CKEDITOR_CONFIGS = {
    'default': {
        'toolbar': 'full',
        'height': 300,
        'width': '100%',
        'extraPlugins': ','.join([
            'uploadimage',
            'div',
            'autolink',
            'autoembed',
            'embedsemantic',
            'autogrow',
            'widget',
            'lineutils',
            'clipboard',
            'dialog',
            'dialogui',
            'elementspath'
        ]),
    },
    'basic': {
        'toolbar': 'Basic',
        'height': 200,
        'width': '100%',
    }
}

# Email configuration
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='localhost')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@example.com')
SERVER_EMAIL = env('SERVER_EMAIL', default='admin@example.com')

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'colored_sql',  # ← Utilise le formateur coloré
            'stream': sys.stdout,
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

# Celery Configuration (pour les tâches asynchrones)
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Configuration des thumbnails
THUMBNAIL_ALIASES = {
    '': {
        'avatar_small': {'size': (50, 50), 'crop': True},
        'avatar_medium': {'size': (150, 150), 'crop': True},
        'avatar_large': {'size': (300, 300), 'crop': True},
        'course_thumb': {'size': (400, 300), 'crop': True},
        'course_banner': {'size': (1200, 400), 'crop': True},
    },
}

THUMBNAIL_HIGH_RESOLUTION = True
THUMBNAIL_QUALITY = 85

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Custom settings pour l'application
APP_SETTINGS = {
    'MAX_UPLOAD_SIZE': 50 * 1024 * 1024,  # 50MB
    'ALLOWED_FILE_TYPES': [
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
        'jpg', 'jpeg', 'png', 'gif', 'svg',
        'mp4', 'avi', 'mkv', 'webm',
        'mp3', 'wav', 'ogg',
        'zip', 'rar', '7z',
    ],
    'CERTIFICATE_TEMPLATE_PATH': 'certificates/template.html',
    'DEFAULT_COURSE_DURATION': 30,  # jours
    'MAX_QUIZ_ATTEMPTS': 3,
    'QUIZ_TIME_LIMIT': 60,  # minutes
    'EMAIL_VERIFICATION_TIMEOUT': 24,  # heures
    'PASSWORD_RESET_TIMEOUT': 1,  # heure
    'PREMIUM_FEATURES': [
        'unlimited_courses',
        'certificate_generation',
        'priority_support',
        'advanced_analytics',
        'offline_download',
    ],
}

# Notifications settings
NOTIFICATION_SETTINGS = {
    'CHANNELS': {
        'email': {
            'enabled': True,
            'template_dir': 'emails/',
        },
        'sms': {
            'enabled': False,
            'provider': 'twilio',
            'api_key': env('SMS_API_KEY', default=''),
        },
        'push': {
            'enabled': True,
            'firebase_key': env('FIREBASE_KEY', default=''),
        },
        'in_app': {
            'enabled': True,
            'retention_days': 30,
        },
    },
    'TYPES': {
        'course_enrollment': {
            'email': True,
            'in_app': True,
        },
        'lesson_completed': {
            'in_app': True,
        },
        'quiz_completed': {
            'email': True,
            'in_app': True,
        },
        'certificate_earned': {
            'email': True,
            'in_app': True,
            'push': True,
        },
        'new_message': {
            'email': True,
            'in_app': True,
            'push': True,
        },
    }
}

# Analytics settings
ANALYTICS_SETTINGS = {
    'TRACKING_ENABLED': env.bool('ANALYTICS_TRACKING_ENABLED', default=True),
    'RETENTION_DAYS': env.int('ANALYTICS_RETENTION_DAYS', default=365),
    'BATCH_SIZE': env.int('ANALYTICS_BATCH_SIZE', default=1000),
    'EXPORT_FORMATS': ['csv', 'xlsx', 'json'],
    'METRICS': [
        'user_engagement',
        'course_completion',
        'quiz_performance',
        'learning_progress',
        'revenue_tracking',
    ],
}

# File storage (pour production avec AWS S3)
if env.bool('USE_S3', default=False):
    AWS_ACCESS_KEY_ID = env('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = env('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = env('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = env('AWS_S3_REGION_NAME', default='eu-west-1')
    AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'
    AWS_DEFAULT_ACL = None
    AWS_S3_OBJECT_PARAMETERS = {
        'CacheControl': 'max-age=86400',
    }
    AWS_LOCATION = 'static'
    AWS_MEDIA_LOCATION = 'media'
    
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    STATICFILES_STORAGE = 'storages.backends.s3boto3.S3StaticStorage'
    
    STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_LOCATION}/'
    MEDIA_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/{AWS_MEDIA_LOCATION}/'

# API Rate limiting
API_RATE_LIMITS = {
    'authentication': '10/min',
    'user_registration': '3/hour',
    'password_reset': '5/hour',
    'email_verification': '10/hour',
    'file_upload': '20/hour',
    'quiz_submission': '50/hour',
}

# Backup settings
BACKUP_SETTINGS = {
    'ENABLED': env.bool('BACKUP_ENABLED', default=False),
    'SCHEDULE': env('BACKUP_SCHEDULE', default='0 2 * * *'),  # Cron format
    'RETENTION_DAYS': env.int('BACKUP_RETENTION_DAYS', default=30),
    'DESTINATIONS': env.list('BACKUP_DESTINATIONS', default=['local']),
    'ENCRYPTION_KEY': env('BACKUP_ENCRYPTION_KEY', default=''),
}

# Feature flags
FEATURE_FLAGS = {
    'COURSE_REVIEWS': env.bool('FEATURE_COURSE_REVIEWS', default=True),
    'LIVE_CHAT': env.bool('FEATURE_LIVE_CHAT', default=False),
    'VIDEO_STREAMING': env.bool('FEATURE_VIDEO_STREAMING', default=True),
    'GAMIFICATION': env.bool('FEATURE_GAMIFICATION', default=True),
    'SOCIAL_LOGIN': env.bool('FEATURE_SOCIAL_LOGIN', default=True),
    'MOBILE_APP': env.bool('FEATURE_MOBILE_APP', default=False),
    'AI_RECOMMENDATIONS': env.bool('FEATURE_AI_RECOMMENDATIONS', default=False),
    'ADVANCED_ANALYTICS': env.bool('FEATURE_ADVANCED_ANALYTICS', default=True),
}

# Version et maintenance
APP_VERSION = '1.0.0'
MAINTENANCE_MODE = env.bool('MAINTENANCE_MODE', default=False)
MAINTENANCE_MESSAGE = env('MAINTENANCE_MESSAGE', default='Site en maintenance. Retour bientôt!')

# Settings de développement spécifiques
if DEBUG:
    # Django Debug Toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    
    INTERNAL_IPS = [
        '127.0.0.1',
        '0.0.0.0',
    ]
    
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TOOLBAR_CALLBACK': lambda request: DEBUG,
    }
    
    # Email backend pour le développement
    if EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend':
        EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'



# Fin de settings/base.py