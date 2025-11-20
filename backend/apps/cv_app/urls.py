# backend/apps/cv_app/urls.py

from rest_framework.routers import DefaultRouter
from .views import (
    CVViewSet, 
    ContactViewSet, 
    ExperienceViewSet, 
    EducationViewSet, 
    SkillViewSet, 
    LanguageViewSet, 
    InterestViewSet
    
    
)

# Définition du namespace pour les reverses (recommandé pour Django)
app_name = 'cv_app' 


# Initialisation du routeur. C'est lui qui va générer les chemins RESTful (GET, POST, PUT, DELETE).
router = DefaultRouter()

# 1. Vue principale du document CV
# Endpoints générés : /cvs/ (LIST & CREATE) et /cvs/{pk}/ (RETRIEVE, UPDATE, DESTROY)
router.register(r'cvs', CVViewSet, basename='cv')

# 2. Vues des sections (chacune a son propre endpoint CRUD indépendant)
# Ces chemins sont préférables aux chemins imbriqués (ex: cvs/1/experiences/) pour la simplicité.
# Le lien logique au CV est géré dans les ViewSets (BaseSectionViewSet).
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'experiences', ExperienceViewSet, basename='experience')
router.register(r'educations', EducationViewSet, basename='education')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'languages', LanguageViewSet, basename='language')
router.register(r'interests', InterestViewSet, basename='interest')


# Le router.urls contient la liste complète des chemins générés
urlpatterns = router.urls