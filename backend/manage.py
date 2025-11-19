#!/usr/bin/env python
import os
import sys

# 👇👇👇 bloc   👇👇👇
def get_settings_module():
    if 'test' in sys.argv or 'pytest' in sys.modules:
        return 'CvDidacticiel_API.settings.testing'
    
    environment = os.environ.get('DJANGO_ENVIRONMENT', 'development').lower()
    
    settings_map = {
        'development': 'CvDidacticiel_API.settings.development',
        'dev': 'CvDidacticiel_API.settings.development',
        'staging': 'CvDidacticiel_API.settings.staging',
        'stage': 'CvDidacticiel_API.settings.staging',
        'production': 'CvDidacticiel_API.settings.production',
        'prod': 'CvDidacticiel_API.settings.production',
    }
    
    return settings_map.get(environment, 'CvDidacticiel_API.settings.development')

if not os.environ.get('DJANGO_SETTINGS_MODULE'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', get_settings_module())
# 👆👆👆 FIN DU BLOC  👆👆👆

def main():
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()