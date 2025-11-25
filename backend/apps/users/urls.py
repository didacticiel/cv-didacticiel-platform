# backend/apps/users/urls.py

from . import views
from django.urls import path
from .views import ( 
    UserRegisterView,
    UserDetailView,
    AvatarUploadView,
    LogoutView,
    # ❌ Retrait de GoogleLogin qui n'est plus utilisé 
    google_auth, # 💡 Ajout de la nouvelle vue
)

# Définit le namespace pour les reverses (ex: reverse('users:user-register'))
app_name = 'users'

urlpatterns = [
    # 1. Enregistrement d'un nouvel utilisateur
    path("register/", UserRegisterView.as_view(), name="user-register"),
    
    # 2. Gestion du Profil de l'utilisateur connecté
    path("me/", UserDetailView.as_view(), name="user-detail"),
    
    # 3. Téléchargement et mise à jour de l'avatar
    path("me/avatar/", AvatarUploadView.as_view(), name="avatar-upload"),
    
    # 4. Déconnexion
    path("logout/", LogoutView.as_view(), name="user-logout"),
    
    # 5. Authentification Google (NOUVELLE MÉTHODE ID TOKEN)
    # Le frontend enverra le token à cet endpoint
    path("google-auth/", views.google_auth, name="google-auth-id-token"),
]