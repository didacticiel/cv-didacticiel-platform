# apps/users/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

# Logique : Définir les méthodes d'inscription possibles pour garantir la cohérence des données.
REGISTRATION_CHOICES = [
    ('email', _('Email & Password')), # Utilisateur standard (inscription classique)
    ('google', _('Google OAuth')),    # Utilisateur inscrit via Google
]

# =========================================================================
# 1. Modèle Utilisateur Personnalisé (Hérite d'AbstractUser)
# =========================================================================

class User(AbstractUser):
    """
    Modèle Utilisateur personnalisé pour la plateforme Cv Didacticiel.
    Hérite de la fonctionnalité de base d'authentification (mots de passe hachés, permissions, etc.)
    mais permet d'utiliser l'email comme identifiant principal.
    """
    
    # --- Champs d'Authentification ---
    
    # Logique : L'email est choisi comme identifiant unique pour la connexion.
    email = models.EmailField(_("adresse e-mail"), unique=True, null=False, blank=False)
    
    # Logique : Indique à Django que c'est le champ 'email' qui doit être utilisé pour la connexion.
    USERNAME_FIELD = "email"
    # Logique : Liste des champs demandés par la commande 'createsuperuser' en plus de USERNAME_FIELD et password.
    REQUIRED_FIELDS = ["username"] 

    # --- Champs pour le Profil ---
    
    first_name = models.CharField(_("Prénom"), max_length=150, blank=False, null=False)
    last_name = models.CharField(_("Nom"), max_length=150, blank=False, null=False)
    
    # Logique Google Auth : Ce champ est essentiel pour l'intégration sociale. 
    # Il permet à la vue Google Auth (google_auth) de vérifier si un utilisateur existant 
    # (trouvé via l'email) s'est inscrit par email ou par Google.
    registration_method = models.CharField(
        _("Méthode d'enregistrement"),
        max_length=20, 
        choices=REGISTRATION_CHOICES, 
        default='email',
        help_text=_("Méthode utilisée par l'utilisateur pour créer son compte.")
    )
    
    # Nouveau champ pour l'avatar/photo de profil
    avatar = models.ImageField(
        _("Avatar / Photo de profil"), 
        upload_to='avatars/', 
        null=True, 
        blank=True,
        help_text=_("Image de profil de l'utilisateur. Stockée dans le dossier 'avatars/'.")
    )
    
    # Champ de Monétisation
    is_premium_subscriber = models.BooleanField(
        _("abonné premium"),
        default=False,
        help_text=_("Indique si l'utilisateur a un abonnement mensuel actif (pour l'évolution future).")
    )
    
    # --- Champs par défaut (hérités) ---
    # AbstractUser fournit également : password, is_staff, is_active, is_superuser, date_joined, groups, user_permissions.

    class Meta:
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')
        
    def __str__(self):
        # Logique : Retourne l'email pour une identification claire dans l'administration et les logs.
        return self.email