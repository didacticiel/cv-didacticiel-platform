# apps/users/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from apps.users.models import User 
from django.utils.translation import gettext_lazy as _

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Personnalisation de l'administration pour le modèle User.
    Hérite de BaseUserAdmin pour conserver les fonctionnalités d'authentification.
    """
    
    # 💡 ESSENTIEL POUR L'AUTOCOMPLETION : Définir des champs de recherche.
    search_fields = ('email', 'first_name', 'last_name')
    
    # Ajout des champs personnalisés aux listes de l'admin
    list_display = (
        'email', 
        'first_name', 
        'last_name', 
        'is_staff', 
        'is_premium_subscriber'
    )
    list_filter = BaseUserAdmin.list_filter + ('is_premium_subscriber',)
    
    # Organisation des champs dans le formulaire d'édition
    fieldsets = (
        (None, {'fields': ('email', 'password')}), 
        (_('Informations Personnelles'), {'fields': ('first_name', 'last_name', 'username')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Statuts'), {'fields': ('is_premium_subscriber',)}), 
        (_('Dates Importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    # L'ordre d'affichage dans la liste
    ordering = ('email',)
    
    # apps/cv_app/admin.py

from django.contrib import admin
from .models import (
    CV,
    Contact,
    Experience,
    Education,
    Skill,
    Language,
    Interest
)

# --- 1. ADMIN INLINE (Sections imbriquées dans le CV) ---

class ContactInline(admin.StackedInline):
    """Affiche la section Contact (OneToOne) dans la vue d'édition du CV."""
    model = Contact
    can_delete = False
    verbose_name_plural = 'Contact'
    fieldsets = (
        ('Informations Clés', {
            'fields': ('phone_number', 'email', 'city', 'country'),
        }),
        ('Liens Web et Adresse', {
            'fields': ('website_url', 'linkedin_url', 'github_url', 'address_detail'),
            'classes': ('collapse',), # Masque par défaut pour une vue plus nette
        }),
    )

class ExperienceInline(admin.TabularInline):
    """Affiche les Expériences (ForeignKey) en format tableau."""
    model = Experience
    extra = 0 # Plus propre de ne pas avoir de lignes vides par défaut
    fields = ('title', 'company', 'location', 'start_date', 'end_date')

class EducationInline(admin.TabularInline):
    """Affiche les Formations (ForeignKey) en format tableau."""
    model = Education
    extra = 0
    fields = ('degree', 'institution', 'start_date', 'end_date')

class SkillInline(admin.TabularInline):
    """Affiche les Compétences (ForeignKey) en format tableau."""
    model = Skill
    extra = 0
    fields = ('name', 'category', 'level')

class LanguageInline(admin.TabularInline):
    """Affiche les Langues (ForeignKey) en format tableau."""
    model = Language
    extra = 0
    fields = ('name', 'level')

class InterestInline(admin.TabularInline):
    """Affiche les Centres d'Intérêt (ForeignKey) en format tableau."""
    model = Interest
    extra = 0
    fields = ('name',)

# --- 2. ADMIN POUR LE MODÈLE PRINCIPAL (CV) ---

@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    """Personnalisation du modèle CV."""
    list_display = ('title', 'owner', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    
    # 💡 ESSENTIEL : Utilise les champs de recherche définis dans UserAdmin
    search_fields = ('title', 'summary', 'owner__email', 'owner__first_name')
    autocomplete_fields = ['owner']
    
    fieldsets = (
        ('Informations Générales', {
            'fields': ('owner', 'title', 'summary'),
        }),
    )
    
    # Ajout de toutes les sections imbriquées
    inlines = [
        ContactInline,
        ExperienceInline,
        EducationInline,
        SkillInline,
        LanguageInline,
        InterestInline,
    ]

# --- 3. ADMINS POUR LES SECTIONS (Accès direct si nécessaire) ---

@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'cv', 'start_date', 'end_date')
    list_filter = ('company', 'location')
    search_fields = ('title', 'company', 'description', 'cv__title')
    raw_id_fields = ('cv',)

@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree', 'institution', 'cv', 'end_date')
    list_filter = ('institution',)
    search_fields = ('degree', 'institution', 'description', 'cv__title')
    raw_id_fields = ('cv',)

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'level', 'cv')
    list_filter = ('category',)
    search_fields = ('name', 'cv__title')
    raw_id_fields = ('cv',)

# Enregistrement simple des autres modèles
admin.site.register(Language)
admin.site.register(Interest)