# apps/users/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from django.utils.translation import gettext_lazy as _

User = get_user_model()

# Logique : Nous avons retiré les importations inutilisées de dj_rest_auth/allauth car nous utilisons la méthode ID Token.


# =========================================================================
# 1. ENREGISTREMENT (REGISTER)
# Logique : Utilisé pour l'inscription classique (email et mot de passe).
# =========================================================================

class UserRegisterSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'un nouvel utilisateur (inscription classique)."""
    
    # Logique : Champs en 'write_only' pour ne jamais exposer les mots de passe lors de la lecture.
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = (
            'email', 
            'username', 
            'first_name', 
            'last_name', 
            'password', 
            'password2'
        )
        # Logique : Assure que le prénom, nom et nom d'utilisateur sont toujours fournis.
        extra_kwargs = {
            'username': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, data):
        # Logique : Étape 1 - Vérification de la correspondance des mots de passe.
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": _("Les mots de passe ne correspondent pas.")})

        # Logique : Étape 2 - Préparation des données pour la validation du mot de passe.
        # Nous créons une instance temporaire de User SANS mot de passe pour vérifier 
        # la complexité en fonction des règles de validation de Django (ex: ne pas utiliser le nom ou l'email).
        user_data_for_validation = {
            'email': data.get('email'),
            'username': data.get('username'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
        }

        # Logique : Étape 3 - Validation de la complexité du mot de passe via les règles de settings.py.
        try:
            validate_password(data['password'], user=User(**user_data_for_validation))
        except django_exceptions.ValidationError as e:
            # Si la validation échoue, renvoie les messages d'erreur de Django.
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return data

    def create(self, validated_data):
        # Logique : Retire le champ 'password2' qui n'est pas un champ de modèle.
        validated_data.pop('password2')
        
        # Logique : Utilise la méthode create_user pour hacher correctement le mot de passe.
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
            # Note : Le champ registration_method restera à 'email' (sa valeur par défaut).
        )
        return user

# =========================================================================
# 2. CONNEXION (LOGIN - basé sur email/password)
# Logique : Champ simple pour la connexion, les vues JWT utilisent généralement ces champs implicitement.
# =========================================================================

class LoginSerializer(serializers.Serializer):
    """Sérialiseur pour la connexion (email/password)."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

# =========================================================================
# 3. DÉTAILS DU PROFIL (GET/UPDATE /users/me/)
# Logique : Permet de lire et mettre à jour les informations du profil.
# =========================================================================

class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la lecture et la mise à jour du profil utilisateur."""
    
    # Logique : 'source='avatar'' mappe le champ de fichier à une URL lisible, 'read_only' car il n'est pas uploadé via ce champ.
    avatar_url = serializers.ImageField(source='avatar', read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 
            'email', 
            'username', 
            'first_name', 
            'last_name', 
            'is_premium_subscriber', 
            'avatar_url', 
            'is_staff', 
            'date_joined'
        )
        # Logique : Ces champs ne peuvent pas être modifiés par l'utilisateur via cette API.
        read_only_fields = ('id', 'email', 'is_premium_subscriber', 'is_staff', 'date_joined')
        
# =========================================================================
# 4. TÉLÉCHARGEMENT D'AVATAR (PATCH /users/me/avatar/)
# Logique : Sérialiseur dédié pour ne gérer que le téléchargement d'image.
# =========================================================================

class UserAvatarSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour du champ avatar uniquement."""
    class Meta:
        model = User
        fields = ('avatar',) 

# Note : La classe CustomSocialLoginSerializer a été retirée car nous utilisons la méthode ID Token/Simple JWT, 
# qui ne nécessite pas les bibliothèques dj-rest-auth ou django-allauth.