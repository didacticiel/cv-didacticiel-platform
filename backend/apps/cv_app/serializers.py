# serializers.py

from rest_framework import serializers
from .models import (
    CV, 
    Contact, 
    Experience, 
    Education, 
    Skill, 
    Language, 
    Interest
)

# ====================================================================
# SÉRIALISEURS ENFANTS (Pour les sections)
# ====================================================================

# 1. Contact
class ContactSerializer(serializers.ModelSerializer):
    """Sérialiseur pour la section Contact (OneToOneField)."""
    cv = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('id',)

# 2. Expérience
class ExperienceSerializer(serializers.ModelSerializer):
    """Sérialiseur pour une Expérience professionnelle."""
    
    cv = serializers.PrimaryKeyRelatedField(queryset=CV.objects.all()) 
    
    # CORRECTION : Accepte les formats YYYY-MM et YYYY-MM-DD
    start_date = serializers.DateField(
        required=True, 
        input_formats=['%Y-%m-%d', '%Y-%m']
    )
    end_date = serializers.DateField(
        required=False, 
        allow_null=True,
        input_formats=['%Y-%m-%d', '%Y-%m']
    )
    
    # Champ helper pour la logique métier
    is_current = serializers.BooleanField(write_only=True, required=False, default=False) 
    
    class Meta:
        model = Experience
        fields = '__all__'
        read_only_fields = ('id',)

    def validate(self, data):
        """Validation personnalisée des données."""
        is_current = data.get('is_current', False)
        end_date = data.get('end_date')
        start_date = data.get('start_date')
        
        if is_current and end_date:
            raise serializers.ValidationError({
                'end_date': 'La date de fin doit être vide pour un poste actuel.'
            })
        
        if not is_current and end_date and start_date:
            if end_date < start_date:
                raise serializers.ValidationError({
                    'end_date': 'La date de fin ne peut pas être antérieure à la date de début.'
                })
        
        return data

    def create(self, validated_data):
        """Crée une expérience en gérant la logique du champ `is_current`."""
        is_current = validated_data.pop('is_current', False)
        if is_current:
            validated_data['end_date'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Met à jour une expérience en gérant la logique du champ `is_current`."""
        is_current = validated_data.pop('is_current', False)
        if is_current:
            validated_data['end_date'] = None
        return super().update(instance, validated_data)


# 3. Éducation
class EducationSerializer(serializers.ModelSerializer):
    """Sérialiseur pour une Formation/Éducation (ForeignKey)."""
    
    cv = serializers.PrimaryKeyRelatedField(queryset=CV.objects.all())

    # CORRECTION : Accepte les formats YYYY-MM et YYYY-MM-DD
    start_date = serializers.DateField(
        required=True, 
        input_formats=['%Y-%m-%d', '%Y-%m']
    )
    end_date = serializers.DateField(
        required=False, 
        allow_null=True,
        input_formats=['%Y-%m-%d', '%Y-%m']
    )
    
    # Champ helper pour la logique métier
    is_current = serializers.BooleanField(write_only=True, required=False, default=False) 
    
    class Meta:
        model = Education
        fields = '__all__'
        read_only_fields = ('id',)

    def validate(self, data):
        """Validation personnalisée des données."""
        is_current = data.get('is_current', False)
        end_date = data.get('end_date')
        start_date = data.get('start_date')
        
        if is_current and end_date:
            raise serializers.ValidationError({
                'end_date': 'La date de fin doit être vide pour une formation en cours.'
            })
        
        if not is_current and end_date and start_date:
            if end_date < start_date:
                raise serializers.ValidationError({
                    'end_date': 'La date de fin ne peut pas être antérieure à la date de début.'
                })
        
        return data

    def create(self, validated_data):
        """Crée une formation en gérant la logique du champ `is_current`."""
        is_current = validated_data.pop('is_current', False)
        if is_current:
            validated_data['end_date'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Met à jour une formation en gérant la logique du champ `is_current`."""
        is_current = validated_data.pop('is_current', False)
        if is_current:
            validated_data['end_date'] = None
        return super().update(instance, validated_data)

# 4. Compétence
class SkillSerializer(serializers.ModelSerializer):
    """Sérialiseur pour une Compétence (ForeignKey)."""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    cv = serializers.PrimaryKeyRelatedField(queryset=CV.objects.all())
    
    class Meta:
        model = Skill
        fields = '__all__'
        read_only_fields = ('id',)

# 5. Langue
class LanguageSerializer(serializers.ModelSerializer):
    """Sérialiseur pour une Langue (ForeignKey)."""
    cv = serializers.PrimaryKeyRelatedField(queryset=CV.objects.all())
    
    class Meta:
        model = Language
        fields = '__all__'
        read_only_fields = ('id',)

# 6. Centre d'Intérêt
class InterestSerializer(serializers.ModelSerializer):
    """Sérialiseur pour un Centre d'Intérêt (ForeignKey)."""
    cv = serializers.PrimaryKeyRelatedField(queryset=CV.objects.all())

    class Meta:
        model = Interest
        fields = '__all__'
        read_only_fields = ('id',)

# ====================================================================
# SÉRIALISEUR PARENT : CVSerializer
# ====================================================================

class CVSerializer(serializers.ModelSerializer):
    """Sérialiseur principal pour le document CV."""
    
    contact = ContactSerializer(required=False)
    experiences = ExperienceSerializer(many=True, read_only=True)
    educations = EducationSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    languages = LanguageSerializer(many=True, read_only=True)
    interests = InterestSerializer(many=True, read_only=True)

    owner_email = serializers.ReadOnlyField(source='owner.email')
    
    class Meta:
        model = CV
        fields = [
            'id', 'owner', 'owner_email', 'title', 'summary', 'contact',  
            'experiences', 'educations', 'skills', 'languages', 'interests',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'owner', 'owner_email', 'created_at', 'updated_at')

    def create(self, validated_data):
        contact_data = validated_data.pop('contact', None)
        cv = CV.objects.create(**validated_data)
        if contact_data:
            Contact.objects.create(cv=cv, **contact_data)
        return cv

    def update(self, instance, validated_data):
        contact_data = validated_data.pop('contact', None)
        
        instance.title = validated_data.get('title', instance.title)
        instance.summary = validated_data.get('summary', instance.summary)
        instance.save()

        if contact_data:
            contact_instance, created = Contact.objects.get_or_create(cv=instance)
            for attr, value in contact_data.items():
                setattr(contact_instance, attr, value)
            contact_instance.save()

        return instance