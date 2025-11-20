# backend/CvDidacticiel_API/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
# 👇👇 NOUVELLE IMPORTATION NÉCESSAIRE 👇👇
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from django.conf import settings



urlpatterns = [
    path('admin/', admin.site.urls),

    # --- AUTHENTIFICATION JWT ---
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/logout/', TokenBlacklistView.as_view(), name='token_blacklist'),

    # --- GESTION DES UTILISATEURS ---
    path('api/v1/users/', include('apps.users.urls')),

    # --- DOCUMENTATION API (CORRIGÉ) ---
    # 1. Schéma brut OpenAPI
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    # 2. Interface Swagger UI
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'), 
    # 3. Interface ReDoc (optionnel)
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # --- LOGIQUE MÉTIER (Prochaine étape : CV App) ---
    path('api/v1/', include('apps.cv_app.urls')), 
    
    
    
    
]

if settings.DEBUG: # N'ajoutez la Debug Toolbar qu'en mode DEBUG
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)), # AJOUTEZ CETTE LIGNE
    ] + urlpatterns