# backend/CvDidacticiel_API/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static 
from rest_framework_simplejwt.views import TokenRefreshView

# Importations pour DRF Spectacular
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView
)

# Importations pour dj-rest-auth/allauth (nous utiliserons le flux standard)
# Remarque: Nous utilisons maintenant des vues personnalisées (UserRegisterView, LogoutView) dans apps.users
# Les lignes suivantes sont conservées pour les autres fonctionnalités dj-rest-auth (ex: password reset)
#from dj_rest_auth.registration.views import SocialAccountListView, SocialAccountDisconnectView
#from dj_rest_auth.views import LogoutView # NOTE: Vous utilisez la vue LogoutView locale, celle-ci est redondante ici.

# Définition des chemins d'accès de l'API et de l'Admin

urlpatterns = [
    # --- ADMIN DJANGO ---
    path('admin/', admin.site.urls),

    # --- API SCHÉMA & DOC (DRF SPECTACULAR) ---
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'), 
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # --- AUTHENTIFICATION CONSOLIDÉE ---
    
    # 1. Endpoints standards (Login, Logout, Password Change/Reset)
    # Logique : Utilisé pour les fonctionnalités dj-rest-auth qui ne sont pas gérées par apps.users
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    
    # 2. Endpoints d'Inscription/Enregistrement
    #path('api/v1/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # 3. Social Login (allauth)
    # Logique : Ce chemin est commenté car il n'est plus nécessaire pour le Google ID Token
    #path('api/v1/auth/', include('allauth.urls')), 
    
    # --- API LOCALE (Vos applications) ---
    # Logique : Toutes vos vues d'authentification personnalisées (register, me, logout, google_login) sont ici
    path('api/v1/users/', include('apps.users.urls', namespace='users')),
    path('api/v1/cvs/', include('apps.cv_app.urls', namespace='cv_app')), 
    
]

# Gestion des fichiers médias et statiques en développement, et Debug Toolbar
if settings.DEBUG:
    # 1. Debug Toolbar
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
    
    # 2. Fichiers Médias
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)