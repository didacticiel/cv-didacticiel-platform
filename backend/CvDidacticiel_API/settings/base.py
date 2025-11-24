# settings/base.py
import sys
import os
from pathlib import Path
from datetime import timedelta
import environ
from django.contrib import admin


# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
APPS_DIR = BASE_DIR / "apps"
TEMPLATE_DIR =  os.path.join(BASE_DIR, "templates")

# Environment variables
env = environ.Env(
    DEBUG=(bool, False),
    USE_TZ=(bool, True),
    # Définition du domaine backend avec valeur par défaut pour dev
    BACKEND_DOMAIN=(str, 'http://localhost:8000'),
    # 🎯 AJOUT : Variables pour l'authentification Google
    GOOGLE_CLIENT_ID=(str, 'VOTRE_CLIENT_ID_GOOGLE_DEV'),
    GOOGLE_SECRET=(str, 'VOTRE_SECRET_GOOGLE_DEV'),
    # 💡 AJOUT : Assurer que FRONTEND_URL est bien initialisé
    FRONTEND_URL=(str, 'http://localhost:8080'), 
)

# Take environment variables from .env file if it exists
environ.Env.read_env(BASE_DIR / '.env')

# --- Nouvelle variable : Domaine Backend ---
# Récupère le domaine de base pour la construction des URLs (prod ou dev)
BACKEND_DOMAIN = env('BACKEND_DOMAIN') 

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
    
    # CORS pour un futur frontend
    'corsheaders',
    
    # Filtres avancés
    'django_filters',
    
    # Documentation API
    'drf_spectacular',
    
    # Authentification
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google', 
    'dj_rest_auth',
    'dj_rest_auth.registration',
    
    # Gestion des images (avatars, photos de travaux)
    'easy_thumbnails',

    
    # Cache
    'django_redis',
    
    # Monitoring
    'django_extensions',
    
    # Internationalisation
    'rosetta',
]

# MODIFIE POUR CV DIDACTICIEL: Nos applications spécifiques
LOCAL_APPS = [
    'apps.cv_app',
    'apps.users',      
    
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# 💡 CORRECTION : Assurez-vous que le chemin est correct si l'application 'users' est dans 'apps'
AUTH_USER_MODEL = 'users.User' 

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware', 
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.locale.LocaleMiddleware',
]

# Note: ROOT_URLCONF doit être corrigé pour correspondre à votre nom de projet

ROOT_URLCONF = 'CvDidacticiel_API.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [TEMPLATE_DIR],
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

WSGI_APPLICATION = 'CvDidacticiel_API.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DATABASE_NAME'),
        'USER': env('DATABASE_USER'),
        'PASSWORD': env('DATABASE_PASSWORD'),
        # Pour Docker Compose, HOST doit être 'db'
        'HOST': env('DATABASE_HOST', default='localhost'), 
        'PORT': env('DATABASE_PORT', default='5432'),
        'ATOMIC_REQUESTS': True,
        'CONN_MAX_AGE': 60,
        'OPTIONS': {
            # 'sslmode': 'require',  # si using SSL
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
        'KEY_PREFIX': 'sedodo',
        'TIMEOUT': 300,
    }
}

# Sessions
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 1209600  # 2 weeks
SESSION_COOKIE_SAMESITE = 'None' 
SESSION_COOKIE_SECURE = False 
# 🎯 AJOUT : Désactiver la politique Cross-Origin-Opener pour le développement (pour la popup Social Login)
SECURE_CROSS_ORIGIN_OPENER_POLICY = None

# 🎯 MODIFICATION CRITIQUE : Ajout du backend d'authentification allauth
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',  
    'guardian.backends.ObjectPermissionBackend',
)
ANONYMOUS_USER_NAME = None

# Password validation (inchangé)
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
]

# Internationalization (inchangé)
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = "Africa/Porto-Novo"
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ('fr', 'Français'),
    ('en', 'English'),
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

# Site framework
SITE_ID = 1

# 🎯 MODIFICATION CRITIQUE : Configuration pour dj-rest-auth avec support JWT
# 💡 IMPORTANT : Utilisation de env('FRONTEND_URL') pour la redirection.
REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_HTTPONLY': False,
    'SESSION_LOGIN': False,
    'USER_DETAILS_SERIALIZER': 'apps.users.serializers.UserSerializer',
    'JWT_AUTH_COOKIE': 'cv_didacticiel_jwt',
    'JWT_AUTH_REFRESH_COOKIE': 'cv_didacticiel_jwt_refresh',
    'SOCIAL_AUTH_TOKEN_STRATEGY': 'jwt',
    # 💡 Utilise l'URL du frontend lue par env()
    'SOCIAL_AUTH_REDIRECT_URI': f'{env("FRONTEND_URL")}/auth/social/callback', 
    
    # Nouvelle configuration pour les champs d'inscription
    'REGISTER_SERIALIZER': 'dj_rest_auth.registration.serializers.RegisterSerializer',
    'REGISTER_PERMISSION_CLASSES': ['rest_framework.permissions.AllowAny'],
}

# 🎯 URL du frontend (celle qui apparaît dans Google Console)
FRONTEND_URL = env('FRONTEND_URL') 
# Redirection après succès (Utilise l'URL du frontend pour le social login)
LOGIN_REDIRECT_URL = f'{FRONTEND_URL}/auth/social/callback/'
ACCOUNT_LOGOUT_REDIRECT_URL = '/'

# Désactivez l'e-mail de confirmation si vous voulez une connexion instantanée
ACCOUNT_EMAIL_VERIFICATION = 'none' 

# Permet de se connecter avec l'email (si c'est votre USERNAME_FIELD)

# Nouvelle configuration (recommandée)
ACCOUNT_LOGIN_METHODS = {'email'}  
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*'] 
# 🎯 Configuration allauth
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_USER_MODEL_USERNAME_FIELD = None

# 🎯 Pour éviter les problèmes de redirection
SOCIALACCOUNT_AUTO_SIGNUP = True
SOCIALACCOUNT_EMAIL_VERIFICATION = 'none'
# 🎯 Adaptateur personnalisé
SOCIALACCOUNT_ADAPTER = 'apps.users.custom_adapter.CustomSocialAccountAdapter'
# 🎯 MODIFICATION CRITIQUE : Configuration pour les providers sociaux
SOCIALACCOUNT_LOGIN_ON_GET = False  # Changez à False pour plus de sécurité



# Configuration allauth pour Google
SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            # 💡 Lit de la variable d'environnement (sans VITE_)
            'client_id': env('GOOGLE_CLIENT_ID'), 
            'secret': env('GOOGLE_SECRET'),
            'key': ''  
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'offline',  # Pour obtenir un refresh token
        },
        'VERIFIED_EMAIL': True,
    }
}

# Django REST Framework (inchangé)
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',  
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
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
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# Cookies JWT HttpOnly
JWT_COOKIE_NAME = "cv_didacticiel_jwt"
JWT_REFRESH_COOKIE_NAME = "cv_didacticiel_jwt_refresh"
# JWT_COOKIE_SECURE doit être True en production HTTPS
JWT_COOKIE_SECURE = env.bool('JWT_COOKIE_SECURE', default=False) 
JWT_COOKIE_SAMESITE = "Lax"    
JWT_COOKIE_HTTPONLY = True

# CORS settings
CORS_ALLOW_ALL_ORIGINS = env.bool('CORS_ALLOW_ALL_ORIGINS', default=False)

# CORS settings pour React
# On utilise la logique conditionnelle ci-dessous

if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=[
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    FRONTEND_URL 
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

# MODIFIE POUR CV DIDACTICIEL: Documentation API (inchangé)
SPECTACULAR_SETTINGS = {
    'TITLE': 'CV Didacticiel Platform API',
    'DESCRIPTION': 'API complète pour la plateforme de mise de création de cv en ligne, proffessionel, compatible et recommander.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
    'TAGS': [
        {'name': 'Authentication', 'description': 'Endpoints d\'authentification'},
        {'name': 'users', 'description': 'Gestion des comptes utilisateurs'},
        {'name': 'cv_app', 'description': 'Création, gestion et téléchargement de CV'},
       
    ],
}

# CKEditor Configuration (inchangé)
CKEDITOR_UPLOAD_PATH = "uploads/"
CKEDITOR_IMAGE_BACKEND = "pillow"

# Email configuration (inchangé)
EMAIL_BACKEND = env('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env('EMAIL_HOST', default='localhost')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='noreply@cvdidacticiel.bj')

# Logging (inchangé)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    # ... (handlers et loggers)
}

# Celery Configuration (inchangé)
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='redis://localhost:6379/0')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Configuration des thumbnails (inchangé)
THUMBNAIL_ALIASES = {
    '': {
        'profile_pic_small': {'size': (50, 50), 'crop': True},
        'profile_pic_medium': {'size': (150, 150), 'crop': True},
        'work_photo_thumb': {'size': (200, 150), 'crop': True},
        'work_photo_large': {'size': (800, 600), 'crop': False},
    },
}

# Security settings (inchangé)
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# MODIFIE POUR CV DIDACTICIEL: Settings spécifiques à l'application (inchangé)
APP_SETTINGS = {
    'MAX_CV_DESCRIPTION_LENGTH': 5000,
    'MAX_CV_PER_USER': 10,
    'ALLOWED_IMAGE_TYPES': ['jpg', 'jpeg', 'png'],
    'MAX_UPLOAD_SIZE': 5 * 1024 * 1024, 
    'PRICE_CV_DOWNLOAD': env.int('PRICE_CV_DOWNLOAD', default=2500) 
}

# MODIFIE POUR CV DIDACTICIEL: Rate limiting spécifique (inchangé)
API_RATE_LIMITS = {
    'cv_creation': '5/hour',
    'user_registration': '3/hour',
    'password_reset': '5/hour',
    'profile_update': '20/hour',
}

# MODIFIE POUR CV DIDACTICIEL: Feature flags (inchangé)
FEATURE_FLAGS = {
    'GENERATION_AI': env.bool('FEATURE_GENERATION_AI', default=True),
}

# File storage (pour production avec AWS S3) (inchangé)
if env.bool('USE_S3', default=False):
    # ... (configuration S3)
    pass

# Settings de développement spécifiques (inchangé)
if DEBUG:
    # Django Debug Toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']

# --- Personnalisation de l'Admin Django --- (inchangé)
ADMIN_SITE_TITLE = "API CvDidacticiel"
ADMIN_SITE_HEADER = "Administration de l'API CvDidacticiel"
ADMIN_SITE_INDEX_TITLE = "Tableau de Bord Administratif"