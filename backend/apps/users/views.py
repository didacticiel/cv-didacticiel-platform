# apps/users/views.py

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.translation import gettext_lazy as _

# Import pour l'authentification sociale
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.socialaccount.helpers import complete_social_login
from dj_rest_auth.registration.views import SocialLoginView
from django.conf import settings

from .serializers import (
    UserRegisterSerializer, 
    UserSerializer, 
    UserAvatarSerializer
)

User = get_user_model()

# =========================================================================
# 1. AUTHENTIFICATION DE BASE (Basée sur Simple JWT)
# =========================================================================

class UserRegisterView(generics.CreateAPIView):
    """
    Endpoint POST /api/v1/users/register/
    Permet l'enregistrement d'un nouvel utilisateur.
    """
    queryset = User.objects.all()
    # 🎯 CORRECTION : Utilisation du bon sérialiseur
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]  # Ouvert à tous

    def create(self, request, *args, **kwargs):
        # Utilise le sérialiseur pour créer l'utilisateur
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Après la création, nous obtenons immédiatement les tokens JWT pour l'utilisateur
        user = serializer.instance
        refresh = RefreshToken.for_user(user)
        
        # Le frontend peut maintenant se connecter automatiquement après l'enregistrement
        return Response(
            {
                "message": _("Compte créé avec succès. Vous êtes maintenant connecté."), 
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data
            }, 
            status=status.HTTP_201_CREATED, 
        )

# =========================================================================
# 2. GESTION DU PROFIL (L'utilisateur connecté)
# =========================================================================

class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Endpoint GET/PUT /api/v1/users/me/
    Permet de visualiser les détails de l'utilisateur connecté et de mettre à jour son profil.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # Nécessite le token JWT

    def get_object(self):
        # Retourne l'objet utilisateur de la requête authentifiée (request.user)
        return self.request.user

# =========================================================================
# 3. LOGOUT (Blacklisting du Refresh Token)
# =========================================================================

class LogoutView(APIView):
    """
    Endpoint POST /api/v1/users/logout/
    Ajoute le Refresh Token à la liste noire (Blacklist) pour invalider toutes les sessions.
    Nécessite le token JWT.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Le Refresh Token est envoyé dans le corps de la requête
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": _("Déconnexion réussie.")}, status=status.HTTP_205_RESET_CONTENT)
            else:
                return Response(
                    {"detail": _("Token de rafraîchissement manquant.")}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            # Si le token est déjà blacklisté ou invalide
            return Response(
                {"detail": _("Token de rafraîchissement invalide.")}, 
                status=status.HTTP_400_BAD_REQUEST
            )

# =========================================================================
# 4. GESTION DES FICHIERS (Avatar)
# =========================================================================

class AvatarUploadView(APIView):
    """
    Endpoint PATCH /api/v1/users/me/avatar/
    Permet de télécharger l'avatar de l'utilisateur.
    """
    # Permet de parser les requêtes contenant des fichiers (multipart/form-data)
    parser_classes = [MultiPartParser, FormParser]  
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        user = request.user
        
        # Le fichier est dans request.FILES pour MultiPartParser
        if 'avatar' not in request.FILES:
            return Response(
                {"avatar": _("Veuillez fournir un fichier d'image.")}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Nous n'utilisons qu'une partie des champs (l'avatar)
        serializer = UserAvatarSerializer(
            user, 
            data={'avatar': request.FILES['avatar']}, 
            partial=True
        )
            
        if serializer.is_valid():
            serializer.save()
            # Retourne les données utilisateur mises à jour
            return Response(UserSerializer(user).data) 
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =========================================================================
# 5. AUTHENTIFICATION GOOGLE
# =========================================================================
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
# 
# Import de la vue standard de dj-rest-auth
from dj_rest_auth.registration.views import SocialLoginView
from .custom_adapter import CustomGoogleOAuth2Adapter

class GoogleLogin(SocialLoginView):
    """
    Endpoint pour gérer l'échange du code Google (code) contre les tokens JWT.
    Le client envoie le 'code' et le 'state'.
    dj-rest-auth gère toute la logique OAuth2 interne et la connexion.
    """
    # 🎯 Utilise votre adaptateur personnalisé pour la gestion du callback_url
    adapter_class = CustomGoogleOAuth2Adapter 
    client_class = OAuth2Client