# sedodo_platform/settings/development.py

from .base import *

# --- Spécifiques au Développement ---

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

DATABASES['default']['OPTIONS']['sslmode'] = 'disable' # Pour le dev local