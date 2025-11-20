# cv_app/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, PermissionDenied

from .models import CV, Contact, Experience, Education, Skill, Language, Interest
from .serializers import (
    CVSerializer, 
    ContactSerializer, 
    ExperienceSerializer, 
    EducationSerializer, 
    SkillSerializer, 
    LanguageSerializer, 
    InterestSerializer
)

import logging

logger = logging.getLogger(__name__)

# ====================================================================
# 1. CV VIEWSET (Gestion du document CV principal)
# ====================================================================

class CVViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des documents CV (Création/Mise à jour du titre/résumé).
    Gère la logique de création initiale du CV et de son Contact associé.
    """
    serializer_class = CVSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Optimisation anti N+1 : utilise prefetch_related pour charger toutes 
        les sections du CV en un nombre minimal de requêtes.
        """
        return CV.objects.filter(owner=self.request.user).prefetch_related(
            'experiences', 
            'educations', 
            'skills', 
            'languages', 
            'interests'
        ).select_related(
            'contact' 
        ).order_by('-updated_at')
    
    def perform_create(self, serializer):
        """Associe le CV créé à l'utilisateur connecté."""
        serializer.save(owner=self.request.user)


# ====================================================================
# 2. VUES ABSTRAITES ET SECTIONS VIEWSETS (Expérience, Éducation, etc.)
# ====================================================================

class BaseSectionViewSet(viewsets.ModelViewSet):
    """
    Classe de base pour tous les ViewSets de sections (ForeignKey to CV).
    Implémente la sécurité et l'accès aux ressources.
    
    IMPORTANT: Cette classe NE force PAS le CV dans perform_create()
    car le frontend envoie déjà le champ 'cv' dans les données.
    """
    permission_classes = [permissions.IsAuthenticated]
    cv_relation_name = None

    def get_queryset(self):
        """
        Récupère les objets de la section liés aux CVs de l'utilisateur.
        Permet l'accès à toutes les ressources des CVs de l'utilisateur.
        """
        # Récupère tous les IDs de CVs appartenant à l'utilisateur
        user_cv_ids = CV.objects.filter(owner=self.request.user).values_list('id', flat=True)
        
        # Retourne les objets de la section liés à ces CVs
        return self.queryset.filter(cv_id__in=user_cv_ids).order_by('-id')

    def create(self, request, *args, **kwargs):
        """
        Surcharge de create() pour valider que le CV appartient à l'utilisateur
        AVANT la création, sans modifier les données envoyées.
        """
        logger.info(f"=== CRÉATION {self.__class__.__name__} ===")
        logger.info(f"User: {request.user.email}")
        logger.info(f"Data reçue: {request.data}")
        
        # Vérifier que le CV est fourni
        cv_id = request.data.get('cv')
        if not cv_id:
            logger.error("Champ 'cv' manquant dans les données")
            return Response(
                {'cv': ['Ce champ est obligatoire.']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Vérifier que le CV existe et appartient à l'utilisateur
        try:
            cv = CV.objects.get(id=cv_id)
            if cv.owner != request.user:
                logger.error(f"CV {cv_id} n'appartient pas à {request.user.email}")
                return Response(
                    {'error': 'Ce CV ne vous appartient pas.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            logger.info(f"CV validé: {cv.title} (ID: {cv.id})")
        except CV.DoesNotExist:
            logger.error(f"CV {cv_id} introuvable")
            return Response(
                {'cv': ['CV introuvable.']}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Appel de la méthode create() parente (qui appelle perform_create())
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            logger.error(f"Erreurs de validation: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        logger.info(f"Objet créé avec succès: {serializer.data}")
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """
        Sauvegarde l'objet SANS modifier le CV.
        Le CV est déjà présent dans validated_data grâce au serializer.
        """
        # On ne force PAS le cv ici, il vient des données validées
        serializer.save()

    def update(self, request, *args, **kwargs):
        """
        Surcharge de update() pour s'assurer que l'utilisateur ne peut modifier
        que ses propres ressources.
        """
        instance = self.get_object()
        
        # Vérifier que le CV de la ressource appartient à l'utilisateur
        if instance.cv.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez pas modifier cette ressource.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Surcharge de destroy() pour s'assurer que l'utilisateur ne peut supprimer
        que ses propres ressources.
        """
        instance = self.get_object()
        
        # Vérifier que le CV de la ressource appartient à l'utilisateur
        if instance.cv.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez pas supprimer cette ressource.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)


# --- Définitions des ViewSets spécifiques ---

class ExperienceViewSet(BaseSectionViewSet):
    """ViewSet pour gérer les expériences professionnelles."""
    serializer_class = ExperienceSerializer
    queryset = Experience.objects.all()
    cv_relation_name = 'experiences'


class EducationViewSet(BaseSectionViewSet):
    """ViewSet pour gérer les formations."""
    serializer_class = EducationSerializer
    queryset = Education.objects.all()
    cv_relation_name = 'educations'


class SkillViewSet(BaseSectionViewSet):
    """ViewSet pour gérer les compétences."""
    serializer_class = SkillSerializer
    queryset = Skill.objects.all()
    cv_relation_name = 'skills'


class LanguageViewSet(BaseSectionViewSet):
    """ViewSet pour gérer les langues."""
    serializer_class = LanguageSerializer
    queryset = Language.objects.all()
    cv_relation_name = 'languages'


class InterestViewSet(BaseSectionViewSet):
    """ViewSet pour gérer les centres d'intérêt."""
    serializer_class = InterestSerializer
    queryset = Interest.objects.all()
    cv_relation_name = 'interests'


# ====================================================================
# 3. CONTACT VIEWSET (Singleton par CV)
# ====================================================================

class ContactViewSet(viewsets.ModelViewSet):
    """
    Gère la section Contact (relation OneToOne).
    Permet de créer le contact (POST) ou de le modifier (PUT/PATCH) une fois.
    """
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Contact.objects.all()

    def get_queryset(self):
        """Retourne les objets Contact liés aux CVs de l'utilisateur."""
        user_cv_ids = CV.objects.filter(owner=self.request.user).values_list('id', flat=True)
        return Contact.objects.filter(cv_id__in=user_cv_ids)

    def create(self, request, *args, **kwargs):
        """Validation avant création du contact."""
        cv_id = request.data.get('cv')
        
        if not cv_id:
            return Response(
                {'cv': ['Ce champ est obligatoire.']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            cv = CV.objects.get(id=cv_id)
            if cv.owner != request.user:
                return Response(
                    {'error': 'Ce CV ne vous appartient pas.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Vérifier si un contact existe déjà pour ce CV
            if Contact.objects.filter(cv=cv).exists():
                return Response(
                    {'error': 'Un contact existe déjà pour ce CV. Utilisez PUT/PATCH pour modifier.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        except CV.DoesNotExist:
            return Response(
                {'cv': ['CV introuvable.']}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Validation avant mise à jour du contact."""
        instance = self.get_object()
        
        if instance.cv.owner != request.user:
            return Response(
                {'error': 'Vous ne pouvez pas modifier ce contact.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        """Récupère l'unique ressource Contact de l'utilisateur."""
        instance = self.get_queryset().first()
        if not instance:
            return Response(
                {"detail": "Informations de contact non trouvées."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(instance)
        return Response(serializer.data)