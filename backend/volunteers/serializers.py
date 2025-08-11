# backend/volunteers/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import (
    VolunteerSkill, VolunteerOpportunity, VolunteerProfile, 
    VolunteerParticipation, VolunteerAchievement
)


class VolunteerSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerSkill
        fields = ['id', 'name', 'description', 'category']


class VolunteerOpportunitySerializer(serializers.ModelSerializer):
    required_skills = VolunteerSkillSerializer(many=True, read_only=True)
    required_skill_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    applications_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VolunteerOpportunity
        fields = [
            'id', 'title', 'description', 'required_skills', 'required_skill_ids',
            'location', 'is_remote', 'estimated_hours', 'people_helped_estimate',
            'urgency_level', 'status', 'start_date', 'end_date', 'created_by',
            'created_by_name', 'applications_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_applications_count(self, obj):
        return obj.participations.filter(status__in=['applied', 'accepted']).count()
    
    def create(self, validated_data):
        required_skill_ids = validated_data.pop('required_skill_ids', [])
        validated_data['created_by'] = self.context['request'].user
        opportunity = super().create(validated_data)
        
        if required_skill_ids:
            skills = VolunteerSkill.objects.filter(id__in=required_skill_ids)
            opportunity.required_skills.set(skills)
        
        return opportunity
    
    def update(self, instance, validated_data):
        required_skill_ids = validated_data.pop('required_skill_ids', None)
        opportunity = super().update(instance, validated_data)
        
        if required_skill_ids is not None:
            skills = VolunteerSkill.objects.filter(id__in=required_skill_ids)
            opportunity.required_skills.set(skills)
        
        return opportunity


class UserBasicSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']


class VolunteerProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    skills = VolunteerSkillSerializer(many=True, read_only=True)
    skill_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    total_hours_contributed = serializers.ReadOnlyField()
    total_people_helped = serializers.ReadOnlyField()
    volunteer_level = serializers.ReadOnlyField()
    hours_to_next_level = serializers.ReadOnlyField()
    average_rating = serializers.ReadOnlyField()
    active_participations_count = serializers.SerializerMethodField()
    completed_participations_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VolunteerProfile
        fields = [
            'id', 'user', 'skills', 'skill_ids', 'bio', 'availability',
            'max_hours_per_week', 'phone', 'address', 'emergency_contact',
            'emergency_phone', 'is_active', 'total_hours_contributed',
            'total_people_helped', 'volunteer_level', 'hours_to_next_level',
            'average_rating', 'active_participations_count',
            'completed_participations_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_active_participations_count(self, obj):
        return obj.participations.filter(status__in=['accepted', 'in_progress']).count()
    
    def get_completed_participations_count(self, obj):
        return obj.participations.filter(status='completed').count()
    
    def update(self, instance, validated_data):
        skill_ids = validated_data.pop('skill_ids', None)
        profile = super().update(instance, validated_data)
        
        if skill_ids is not None:
            skills = VolunteerSkill.objects.filter(id__in=skill_ids)
            profile.skills.set(skills)
        
        return profile


class VolunteerParticipationSerializer(serializers.ModelSerializer):
    volunteer = VolunteerProfileSerializer(read_only=True)
    opportunity = VolunteerOpportunitySerializer(read_only=True)
    opportunity_id = serializers.IntegerField(write_only=True)
    volunteer_name = serializers.CharField(source='volunteer.user.get_full_name', read_only=True)
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    
    class Meta:
        model = VolunteerParticipation
        fields = [
            'id', 'volunteer', 'opportunity', 'opportunity_id', 'volunteer_name',
            'opportunity_title', 'status', 'application_message', 'actual_hours',
            'people_helped', 'admin_notes', 'admin_rating', 'volunteer_feedback',
            'start_date', 'completion_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['volunteer', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Get volunteer profile for the current user
        user = self.context['request'].user
        volunteer_profile, created = VolunteerProfile.objects.get_or_create(user=user)
        validated_data['volunteer'] = volunteer_profile
        
        return super().create(validated_data)


class VolunteerAchievementSerializer(serializers.ModelSerializer):
    volunteer_name = serializers.CharField(source='volunteer.user.get_full_name', read_only=True)
    
    class Meta:
        model = VolunteerAchievement
        fields = ['id', 'volunteer', 'volunteer_name', 'title', 'description', 'icon', 'earned_date']
        read_only_fields = ['volunteer', 'earned_date']


class VolunteerStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas do dashboard do voluntário"""
    total_hours_contributed = serializers.IntegerField()
    total_people_helped = serializers.IntegerField()
    volunteer_level = serializers.CharField()
    hours_to_next_level = serializers.IntegerField()
    average_rating = serializers.FloatField()
    active_opportunities = serializers.IntegerField()
    completed_opportunities = serializers.IntegerField()
    available_opportunities = serializers.IntegerField()
    achievements_count = serializers.IntegerField()


class ParticipationUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin to update participation status and details"""
    
    class Meta:
        model = VolunteerParticipation
        fields = [
            'status', 'actual_hours', 'people_helped', 
            'admin_notes', 'admin_rating', 'start_date', 'completion_date'
        ]
    
    def update(self, instance, validated_data):
        # If marking as completed, set completion_date automatically
        if validated_data.get('status') == 'completed' and not instance.completion_date:
            validated_data['completion_date'] = timezone.now()
        
        return super().update(instance, validated_data)


class ManualMetricsAdjustmentSerializer(serializers.Serializer):
    """Serializer para administrador ajustar horas/pessoas/avaliação diretamente no perfil.
    Implementado criando uma participação sintética de ajuste para manter rastreabilidade."""
    added_hours = serializers.IntegerField(required=False, min_value=0, default=0)
    added_people_helped = serializers.IntegerField(required=False, min_value=0, default=0)
    admin_rating = serializers.IntegerField(required=False, min_value=1, max_value=5)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if attrs.get('added_hours', 0) == 0 and attrs.get('added_people_helped', 0) == 0 and not attrs.get('admin_rating'):
            raise serializers.ValidationError('Informe ao menos um campo para ajuste.')
        return attrs
