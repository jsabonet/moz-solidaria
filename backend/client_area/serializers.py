# backend/client_area/serializers.py
from rest_framework import serializers
import logging
from django.db import transaction
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile, Notification, MatchingRequest, DashboardStats, Cause, Skill, UserSkill

# Import dos modelos específicos do core para criar os perfis
from core.models import Donor, Beneficiary, Volunteer, Partner


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'date_joined', 'is_staff', 'is_superuser']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'user_type', 'phone', 'address', 'description',
            'avatar', 'date_of_birth', 'email_notifications', 'sms_notifications',
            'push_notifications', 'profile_public', 'show_activity', 'full_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CauseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cause
        fields = ['id', 'name', 'description', 'icon', 'color', 'is_active']


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category', 'description', 'is_active']


class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = UserSkill
        fields = ['id', 'skill', 'skill_id', 'level', 'years_experience']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'is_read', 'action_url',
            'action_text', 'expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class MatchingRequestSerializer(serializers.ModelSerializer):
    requester = UserProfileSerializer(read_only=True)
    volunteer = UserProfileSerializer(read_only=True)
    cause = CauseSerializer(read_only=True)
    required_skills = SkillSerializer(many=True, read_only=True)
    
    cause_id = serializers.IntegerField(write_only=True)
    required_skill_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = MatchingRequest
        fields = [
            'id', 'requester', 'volunteer', 'title', 'description', 'location',
            'cause', 'cause_id', 'required_skills', 'required_skill_ids',
            'status', 'priority', 'start_date', 'end_date', 'max_volunteers',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'requester', 'created_at', 'updated_at']

    def create(self, validated_data):
        required_skill_ids = validated_data.pop('required_skill_ids', [])
        matching_request = MatchingRequest.objects.create(**validated_data)
        
        if required_skill_ids:
            skills = Skill.objects.filter(id__in=required_skill_ids)
            matching_request.required_skills.set(skills)
        
        return matching_request


class DashboardStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DashboardStats
        fields = [
            'total_donations', 'volunteer_hours', 'help_requests_fulfilled',
            'active_projects', 'monthly_donation_goal', 'monthly_volunteer_goal',
            'current_month_donations', 'current_month_volunteer_hours', 'stats', 'last_updated'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)
    # Accept either `password_confirm` (frontend variants) or `confirm_password`
    password_confirm = serializers.CharField(write_only=True, required=False)
    user_type = serializers.ChoiceField(choices=UserProfile.USER_TYPES)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    description = serializers.CharField(required=False, allow_blank=True)
    full_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'password_confirm',
            'first_name', 'last_name', 'full_name', 'user_type', 'phone', 'address', 'description'
        ]

    def validate(self, attrs):
        # Normalize possible alias from frontend
        if 'confirm_password' not in attrs and 'password_confirm' in attrs:
            attrs['confirm_password'] = attrs.pop('password_confirm')

        password = attrs.get('password')
        confirm = attrs.get('confirm_password')

        if password is None or confirm is None:
            raise serializers.ValidationError("Password e confirmação são obrigatórios")

        if password != confirm:
            raise serializers.ValidationError("As senhas não coincidem")
        
        # Processar full_name se fornecido
        if 'full_name' in attrs:
            full_name = attrs.pop('full_name')
            names = full_name.strip().split()
            if len(names) >= 2:
                attrs['first_name'] = names[0]
                attrs['last_name'] = ' '.join(names[1:])
            elif len(names) == 1:
                attrs['first_name'] = names[0]
                attrs['last_name'] = ''
        
        return attrs

    def create(self, validated_data):
    # Remove campos específicos do perfil
        user_type = validated_data.pop('user_type')
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')
        description = validated_data.pop('description', '')
        # pop confirm_password safely (may be absent if alias used earlier)
        validated_data.pop('confirm_password', None)

        # Criar usuário
        user = User.objects.create_user(**validated_data)

        # Criar perfil do client_area (verificar se não existe)
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'user_type': user_type,
                'phone': phone,
                'address': address,
                'description': description
            }
        )

        # Criar perfil específico baseado no tipo (usando modelos do core)
        # Importar apenas quando necessário para evitar imports circulares
        try:
            if user_type == 'donor':
                from core.models import Donor as CoreDonor, UserProfile as CoreUserProfile

                # Primeiro criar/buscar perfil no core
                core_profile, _ = CoreUserProfile.objects.get_or_create(
                    user=user,
                    defaults={'user_type': user_type, 'phone': phone}
                )

                # Criar perfil específico
                CoreDonor.objects.get_or_create(
                    user_profile=core_profile,
                    defaults={}
                )

            elif user_type == 'beneficiary':
                from core.models import Beneficiary as CoreBeneficiary, UserProfile as CoreUserProfile

                core_profile, _ = CoreUserProfile.objects.get_or_create(
                    user=user,
                    defaults={'user_type': user_type, 'phone': phone}
                )

                CoreBeneficiary.objects.get_or_create(
                    user_profile=core_profile,
                    defaults={
                        'family_size': 1,  # Valor padrão
                        'community': '',   # Será preenchido posteriormente
                        'district': '',
                        'province': 'Cabo Delgado'
                    }
                )

            elif user_type == 'volunteer':
                from core.models import Volunteer as CoreVolunteer, UserProfile as CoreUserProfile

                core_profile, _ = CoreUserProfile.objects.get_or_create(
                    user=user,
                    defaults={'user_type': user_type, 'phone': phone}
                )

                CoreVolunteer.objects.get_or_create(
                    user_profile=core_profile,
                    defaults={}
                )

            elif user_type == 'partner':
                from core.models import Partner as CorePartner, UserProfile as CoreUserProfile

                core_profile, _ = CoreUserProfile.objects.get_or_create(
                    user=user,
                    defaults={'user_type': user_type, 'phone': phone}
                )

                CorePartner.objects.get_or_create(
                    user_profile=core_profile,
                    defaults={
                        'organization_name': '',  # Será preenchido posteriormente
                        'contact_person': f"{user.first_name} {user.last_name}".strip(),
                        'contact_email': user.email,
                        'contact_phone': phone,
                        'organization_type': 'ngo',  # Valor padrão
                        'partnership_level': 'operational'  # Valor padrão
                    }
                )
        except Exception as e:
            # Log the exception but do not raise to avoid returning 500 when user was created
            logging.exception('Erro ao criar perfil específico no core para usuário %s (tipo=%s): %s', user.id, user_type, e)
        
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Credenciais inválidas')
            if not user.is_active:
                raise serializers.ValidationError('Conta desativada')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Username e password são obrigatórios')
