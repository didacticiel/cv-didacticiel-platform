from django.db import models
from apps.users.models import User

# ====================================================================
# 1. MODÈLE PRINCIPAL : CV
# ====================================================================

class CV(models.Model):
    """Représente le document CV principal, lié à un utilisateur."""
    
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='cvs',
        verbose_name="Propriétaire"
    )
    
    title = models.CharField(max_length=255, default="Mon CV Professionnel")
    summary = models.TextField(blank=True, null=True, verbose_name="Résumé du Profil")
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "CV"
        verbose_name_plural = "CVs"
        unique_together = ('owner', 'title') 

    def __str__(self):
        return f"{self.owner.email} - {self.title}"

# ====================================================================
# 2. MODÈLE DE CONTACT
# ====================================================================

class Contact(models.Model):
    """Contient toutes les informations de contact pour un CV donné."""
    
    cv = models.OneToOneField(
        'CV',
        on_delete=models.CASCADE, 
        related_name='contact'
    )
    
    # Informations de contact
    phone_number = models.CharField(
        max_length=50, 
        blank=True, 
        null=True, 
        verbose_name="Téléphone"
    )
    email = models.EmailField(verbose_name="Email de contact")
    
    # Adresse physique
    country = models.CharField(max_length=100, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    address_detail = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name="Adresse Détaillée"
    )

    # Liens Web / Portfolio / Réseaux sociaux
    website_url = models.URLField(
        max_length=200, 
        blank=True, 
        null=True, 
        verbose_name="Lien Portfolio/Web"
    )
    linkedin_url = models.URLField(max_length=200, blank=True, null=True)
    github_url = models.URLField(max_length=200, blank=True, null=True)

    class Meta:
        verbose_name = "Contact"
        verbose_name_plural = "Contacts"

    def __str__(self):
        return f"Contact de {self.cv.title}"


# ====================================================================
# 3. EXPÉRIENCES PROFESSIONNELLES
# ====================================================================

class Experience(models.Model):
    """Expérience professionnelle liée à un CV."""
    
    cv = models.ForeignKey(
        CV, 
        on_delete=models.CASCADE, 
        related_name='experiences'
    )
    title = models.CharField(max_length=255, verbose_name="Titre du poste")
    company = models.CharField(max_length=255, verbose_name="Entreprise")
    location = models.CharField(max_length=100, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(
        blank=True, 
        null=True, 
        verbose_name="Tâches et Réalisations"
    )
    order = models.IntegerField(default=0, verbose_name="Ordre d'affichage")

    class Meta:
        ordering = ['-start_date', 'order']
        verbose_name = "Expérience"
        verbose_name_plural = "Expériences"

    def __str__(self):
        return f"{self.title} chez {self.company}"


# ====================================================================
# 4. ÉDUCATION / FORMATION
# ====================================================================

class Education(models.Model):
    """Formation ou diplôme lié à un CV."""
    
    cv = models.ForeignKey(
        CV, 
        on_delete=models.CASCADE, 
        related_name='educations'
    )
    degree = models.CharField(max_length=255, verbose_name="Diplôme/Titre")
    institution = models.CharField(max_length=255, verbose_name="Établissement")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-end_date']
        verbose_name = "Formation"
        verbose_name_plural = "Formations"

    def __str__(self):
        return f"{self.degree} - {self.institution}"


# ====================================================================
# 5. COMPÉTENCES TECHNIQUES ET HUMAINES
# ====================================================================

SKILL_TYPE_CHOICES = [
    ('TECH', 'Technique'),
    ('SOFT', 'Savoir-Être/Expertise'),
    ('TOOL', 'Outil/Autre'),
]

class Skill(models.Model):
    """Compétence technique ou humaine liée à un CV."""
    
    cv = models.ForeignKey(
        CV, 
        on_delete=models.CASCADE, 
        related_name='skills'
    )
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=4, 
        choices=SKILL_TYPE_CHOICES, 
        default='TECH'
    )
    level = models.IntegerField(
        default=5, 
        verbose_name="Niveau / 10"
    )

    class Meta:
        unique_together = ('cv', 'name')
        verbose_name = "Compétence"
        verbose_name_plural = "Compétences"

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


# ====================================================================
# 6. LANGUES
# ====================================================================

class Language(models.Model):
    """Langue parlée liée à un CV."""
    
    cv = models.ForeignKey(
        CV, 
        on_delete=models.CASCADE, 
        related_name='languages'
    )
    name = models.CharField(max_length=100)
    level = models.CharField(
        max_length=50, 
        blank=True, 
        null=True
    )

    class Meta:
        verbose_name = "Langue"
        verbose_name_plural = "Langues"

    def __str__(self):
        return f"{self.name} - {self.level or 'Non spécifié'}"


# ====================================================================
# 7. CENTRES D'INTÉRÊT
# ====================================================================

class Interest(models.Model):
    """Centre d'intérêt lié à un CV."""
    
    cv = models.ForeignKey(
        CV, 
        on_delete=models.CASCADE, 
        related_name='interests'
    )
    name = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Centre d'Intérêt"
        verbose_name_plural = "Centres d'Intérêt"

    def __str__(self):
        return self.name