from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Cause, Skill, Certification, Donor, Beneficiary, 
    Volunteer, VolunteerCertification, Partner, Program, ProjectCategory
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_type_display = serializers.CharField(source='get_user_type_display', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'user_type', 'user_type_display', 'phone', 'address', 
            'date_of_birth', 'profile_picture', 'is_verified', 'is_active', 
            'created_at', 'updated_at', 'last_activity'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CauseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cause
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'is_active']


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 
            'icon', 'color', 'image', 'is_active', 'order',
            'beneficiaries_count', 'communities_reached', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProjectCategorySerializer(serializers.ModelSerializer):
    program = ProgramSerializer(read_only=True)
    
    class Meta:
        model = ProjectCategory
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'color', 
            'program', 'is_active', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'description', 'is_active']


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuer', 'description', 'validity_period', 'is_active']


class DonorSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    preferred_causes = CauseSerializer(many=True, read_only=True)
    preferred_frequency_display = serializers.CharField(source='get_preferred_frequency_display', read_only=True)
    
    class Meta:
        model = Donor
        fields = [
            'id', 'user_profile', 'total_donated', 'first_donation_date', 
            'last_donation_date', 'preferred_frequency', 'preferred_frequency_display',
            'preferred_causes', 'communication_preferences', 'receive_updates', 
            'receive_receipts', 'anonymous_donations', 'public_recognition'
        ]


class BeneficiarySerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    family_status_display = serializers.CharField(source='get_family_status_display', read_only=True)
    verification_status_display = serializers.CharField(source='get_verification_status_display', read_only=True)
    verified_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Beneficiary
        fields = [
            'id', 'user_profile', 'family_size', 'children_count', 'family_status',
            'family_status_display', 'community', 'district', 'province', 
            'needs_assessment', 'verification_status', 'verification_status_display',
            'verified_by', 'verification_date', 'identity_document', 'proof_of_residence'
        ]


class VolunteerCertificationSerializer(serializers.ModelSerializer):
    certification = CertificationSerializer(read_only=True)
    
    class Meta:
        model = VolunteerCertification
        fields = [
            'id', 'certification', 'obtained_date', 'expiry_date', 'certificate_file'
        ]


class VolunteerSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    certifications_details = VolunteerCertificationSerializer(
        source='volunteercertification_set', 
        many=True, 
        read_only=True
    )
    preferred_causes = CauseSerializer(many=True, read_only=True)
    availability_type_display = serializers.CharField(source='get_availability_type_display', read_only=True)
    
    class Meta:
        model = Volunteer
        fields = [
            'id', 'user_profile', 'skills', 'certifications_details', 'availability',
            'availability_type', 'availability_type_display', 'max_hours_per_week',
            'total_hours', 'projects_completed', 'rating', 'preferred_causes',
            'transportation_available', 'remote_work_available'
        ]


class PartnerSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)
    organization_type_display = serializers.CharField(source='get_organization_type_display', read_only=True)
    partnership_level_display = serializers.CharField(source='get_partnership_level_display', read_only=True)
    areas_of_expertise = CauseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Partner
        fields = [
            'id', 'user_profile', 'organization_name', 'organization_type',
            'organization_type_display', 'partnership_level', 'partnership_level_display',
            'tax_id', 'website', 'established_date', 'contact_person', 'contact_email',
            'contact_phone', 'areas_of_expertise', 'resources_available',
            'partnership_start_date', 'partnership_agreement'
        ]


# Serializers para registro de novos usuários
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    user_type = serializers.ChoiceField(choices=UserProfile.USER_TYPES)
    phone = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'user_type', 'phone']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs
    
    def create(self, validated_data):
        # Remove campos que não pertencem ao modelo User
        user_type = validated_data.pop('user_type')
        phone = validated_data.pop('phone', '')
        validated_data.pop('password_confirm')
        
        # Criar usuário
        user = User.objects.create_user(**validated_data)
        
        # Criar perfil
        user_profile = UserProfile.objects.create(
            user=user,
            user_type=user_type,
            phone=phone
        )
        
        # Criar perfil específico baseado no tipo
        if user_type == 'donor':
            Donor.objects.create(user_profile=user_profile)
        elif user_type == 'beneficiary':
            Beneficiary.objects.create(
                user_profile=user_profile,
                family_size=1,  # Valor padrão, será atualizado posteriormente
                community='',  # Será preenchido no formulário completo
                district='',
                province='Cabo Delgado'
            )
        elif user_type == 'volunteer':
            Volunteer.objects.create(user_profile=user_profile)
        elif user_type == 'partner':
            Partner.objects.create(
                user_profile=user_profile,
                organization_name='',  # Será preenchido posteriormente
                contact_person=f"{user.first_name} {user.last_name}",
                contact_email=user.email,
                contact_phone=phone
            )
        
        return user


class DonorRegistrationSerializer(serializers.Serializer):
    """Serializer para completar o registro de doador"""
    preferred_causes = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    preferred_frequency = serializers.ChoiceField(
        choices=Donor.DONATION_FREQUENCY,
        default='one_time'
    )
    communication_preferences = serializers.JSONField(required=False)
    receive_updates = serializers.BooleanField(default=True)
    anonymous_donations = serializers.BooleanField(default=False)


class BeneficiaryRegistrationSerializer(serializers.Serializer):
    """Serializer para completar o registro de beneficiário"""
    family_size = serializers.IntegerField(min_value=1)
    children_count = serializers.IntegerField(min_value=0, default=0)
    family_status = serializers.ChoiceField(choices=Beneficiary.FAMILY_STATUS)
    community = serializers.CharField(max_length=100)
    district = serializers.CharField(max_length=100)
    needs_assessment = serializers.JSONField(required=False)


class VolunteerRegistrationSerializer(serializers.Serializer):
    """Serializer para completar o registro de voluntário"""
    skills = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    availability_type = serializers.ChoiceField(
        choices=Volunteer.AVAILABILITY_TYPE,
        default='flexible'
    )
    max_hours_per_week = serializers.IntegerField(min_value=1, required=False)
    preferred_causes = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    transportation_available = serializers.BooleanField(default=False)
    remote_work_available = serializers.BooleanField(default=True)


class PartnerRegistrationSerializer(serializers.Serializer):
    """Serializer para completar o registro de parceiro"""
    organization_name = serializers.CharField(max_length=200)
    organization_type = serializers.ChoiceField(choices=Partner.ORGANIZATION_TYPE)
    partnership_level = serializers.ChoiceField(choices=Partner.PARTNERSHIP_LEVEL)
    tax_id = serializers.CharField(max_length=50, required=False)
    website = serializers.URLField(required=False)
    areas_of_expertise = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    resources_available = serializers.JSONField(required=False)
