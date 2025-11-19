# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

# ----------------------------
# 1. ENREGISTREMENT (REGISTER)
# ----------------------------

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Sérieliseur pour l'enregistrement d'un nouvel utilisateur.
    Utilise l'email comme identifiant principal.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'password', 'password2')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
        }

    def validate(self, attrs):
        """Vérifie l'unicité de l'email et la correspondance des mots de passe."""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(_("Les deux mots de passe ne correspondent pas."))
        
        # Le modèle utilisateur est configuré pour utiliser l'email comme USERNAME_FIELD
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError(_("Cette adresse email est déjà utilisée."))
            
        return attrs

    def create(self, validated_data):
        """Crée l'utilisateur et met à jour le champ username (facultatif) avec l'email."""
        
        # Nous utilisons l'email pour le champ 'username' car il est requis par AbstractUser
        username = validated_data['email'] 
        
        user = User.objects.create_user(
            email=validated_data['email'],
            username=username, # On utilise l'email ici
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password']
        )
        return user

# ----------------------------
# 2. CONNEXION (LOGIN)
# ----------------------------

class LoginSerializer(serializers.Serializer):
    """
    Sérieliseur personnalisé pour la connexion utilisant l'email (ou l'identifiant).
    Ceci est une étape de validation avant l'obtention du token JWT.
    """
    # Nous utilisons 'email' car c'est notre USERNAME_FIELD
    email = serializers.CharField() 
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Tente d'authentifier l'utilisateur en utilisant l'email et le mot de passe
            user = authenticate(request=self.context.get('request'), email=email, password=password)

            if not user:
                # Vérifie si l'utilisateur existe pour donner un message plus précis
                try:
                    User.objects.get(email__iexact=email)
                except User.DoesNotExist:
                    raise serializers.ValidationError(_("L'utilisateur avec cette adresse e-mail n'existe pas."))
                
                # Si l'utilisateur existe mais le mot de passe est faux
                raise serializers.ValidationError(_("Mot de passe invalide."))
            
            if not user.is_active:
                raise serializers.ValidationError(_("Ce compte est désactivé."))

            # Ajoute l'objet user validé pour la vue (si la vue en a besoin)
            data['user'] = user
            return data
        
        raise serializers.ValidationError(_("Doit inclure l'e-mail et le mot de passe."))

# ----------------------------
# 3. DÉTAILS ET MISE À JOUR (ME)
# ----------------------------

class UserDetailSerializer(serializers.ModelSerializer):
    """
    Sérieliseur pour la lecture et la mise à jour des informations de profil
    de l'utilisateur connecté (/api/v1/users/me/).
    """
    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 
            'is_premium_subscriber', # Notre champ de monétisation
            'is_staff', 'date_joined'
        )
        read_only_fields = (
            'id', 'email', 'is_premium_subscriber', # L'email et le statut premium ne sont pas modifiables ici
            'is_staff', 'date_joined'
        )