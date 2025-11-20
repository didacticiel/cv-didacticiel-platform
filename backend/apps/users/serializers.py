from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions
from django.utils.translation import gettext_lazy as _

User = get_user_model()

# =========================================================================
# 1. ENREGISTREMENT (REGISTER)
# =========================================================================

class UserRegisterSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la création d'un nouvel utilisateur."""
    
    # Champ write_only pour la sécurité lors de l'enregistrement
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
        extra_kwargs = {
            'username': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    def validate(self, data):
        # Validation de la correspondance des mots de passe
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": _("Les mots de passe ne correspondent pas.")})

        # Validation de la complexité du mot de passe
        try:
            validate_password(data['password'], user=User(**data))
        except django_exceptions.ValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        # Création de l'utilisateur avec son mot de passe haché
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

# =========================================================================
# 2. CONNEXION (LOGIN - basé sur email/password)
# =========================================================================

class LoginSerializer(serializers.Serializer):
    """Sérialiseur pour la connexion (méthode non utilisée directement par JWT, mais utile)."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})

# =========================================================================
# 3. DÉTAILS DU PROFIL (GET/UPDATE /users/me/)
# =========================================================================

class UserDetailSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la lecture et la mise à jour du profil utilisateur."""
    
    # Ajout du champ 'avatar' pour la lecture et la mise à jour
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
            'avatar_url', # Le chemin complet de l'image
            'is_staff', 
            'date_joined'
        )
        read_only_fields = ('id', 'email', 'is_premium_subscriber', 'is_staff', 'date_joined')
        
# =========================================================================
# 4. TÉLÉCHARGEMENT D'AVATAR (PATCH /users/me/avatar/)
# =========================================================================

class UserAvatarSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la mise à jour du champ avatar uniquement."""
    class Meta:
        model = User
        fields = ('avatar',)