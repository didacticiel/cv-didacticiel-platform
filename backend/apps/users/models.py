from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

# =========================================================================
# 1. Modèle Utilisateur Personnalisé (Hérite d'AbstractUser)
# =========================================================================

class User(AbstractUser):
    """
    Modèle Utilisateur personnalisé pour la plateforme Cv Didacticiel.
    Utilise 'email' comme champ d'identification unique pour la connexion.
    """
    
    # --- Champs d'Authentification ---
    
    # L'email est obligatoire, unique, et sert de clé de connexion
    email = models.EmailField(_("adresse e-mail"), unique=True, null=False, blank=False)
    
    # Remplacer le nom d'utilisateur par l'email pour l'authentification
    USERNAME_FIELD = "email"
    # Conserver 'username' dans les champs requis pour l'admin Django 
    REQUIRED_FIELDS = ["username"] 

    # --- Champs pour le Profil ---
    
    first_name = models.CharField(_("Prénom"), max_length=150, blank=False, null=False)
    last_name = models.CharField(_("Nom"), max_length=150, blank=False, null=False)
    
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

    class Meta:
        verbose_name = _('Utilisateur')
        verbose_name_plural = _('Utilisateurs')
        
    def __str__(self):
        # Affichage professionnel
        return self.email