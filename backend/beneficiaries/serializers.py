# backend/beneficiaries/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BeneficiaryProfile, SupportRequest, BeneficiaryCommunication, BeneficiaryDocument


class BeneficiaryProfileSerializer(serializers.ModelSerializer):
    age = serializers.ReadOnlyField()
    vulnerability_score = serializers.ReadOnlyField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = BeneficiaryProfile
        fields = [
            'id', 'user', 'user_email', 'username',
            'full_name', 'date_of_birth', 'age', 'gender', 'phone_number', 'alternative_phone',
            'province', 'district', 'administrative_post', 'locality', 'neighborhood', 'address_details',
            'education_level', 'employment_status', 'monthly_income', 'family_status',
            'family_members_count', 'children_count', 'elderly_count', 'disabled_count',
            'is_displaced', 'displacement_reason', 'has_chronic_illness', 'chronic_illness_details',
            'priority_needs', 'additional_information', 'vulnerability_score',
            'created_at', 'updated_at', 'is_verified', 'verification_date'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_verified', 'verification_date']


class SupportRequestSerializer(serializers.ModelSerializer):
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    beneficiary_location = serializers.SerializerMethodField()
    is_overdue = serializers.ReadOnlyField()
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)
    days_since_request = serializers.SerializerMethodField()
    communications_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportRequest
        fields = [
            'id', 'beneficiary', 'beneficiary_name', 'beneficiary_location',
            'request_type', 'title', 'description', 'urgency', 'status',
            'estimated_beneficiaries', 'estimated_cost', 'requested_date', 'needed_by_date',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'admin_notes',
            'assigned_to', 'assigned_to_name', 'started_at', 'completed_at',
            'actual_cost', 'actual_beneficiaries', 'is_overdue', 'days_since_request',
            'communications_count'
        ]
        read_only_fields = ['requested_date', 'beneficiary_name', 'beneficiary_location']

    def get_beneficiary_location(self, obj):
        return f"{obj.beneficiary.district}, {obj.beneficiary.province}"

    def get_days_since_request(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.requested_date
        return delta.days

    def get_communications_count(self, obj):
        return obj.communications.count()


class BeneficiaryCommunicationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_type = serializers.SerializerMethodField()

    class Meta:
        model = BeneficiaryCommunication
        fields = [
            'id', 'support_request', 'sender', 'sender_name', 'sender_type',
            'message_type', 'subject', 'message', 'attachment',
            'created_at', 'is_read', 'read_at'
        ]
        read_only_fields = ['created_at']

    def get_sender_type(self, obj):
        # Determinar se é beneficiário ou administrador
        if hasattr(obj.sender, 'beneficiary_profile'):
            return 'beneficiary'
        return 'admin'


class BeneficiaryDocumentSerializer(serializers.ModelSerializer):
    verified_by_name = serializers.CharField(source='verified_by.username', read_only=True)

    class Meta:
        model = BeneficiaryDocument
        fields = [
            'id', 'beneficiary', 'document_type', 'title', 'description', 'file',
            'uploaded_at', 'verified', 'verified_by', 'verified_by_name', 'verified_at'
        ]
        read_only_fields = ['uploaded_at', 'verified', 'verified_by', 'verified_at']


class BeneficiaryRegistrationSerializer(serializers.Serializer):
    # Dados do usuário
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    # Dados do perfil (campos obrigatórios apenas)
    full_name = serializers.CharField(max_length=200)
    date_of_birth = serializers.DateField()
    gender = serializers.ChoiceField(choices=BeneficiaryProfile.GENDER_CHOICES)
    phone_number = serializers.CharField(max_length=20)
    district = serializers.CharField(max_length=100)
    administrative_post = serializers.CharField(max_length=100)
    locality = serializers.CharField(max_length=100)
    education_level = serializers.ChoiceField(choices=BeneficiaryProfile.EDUCATION_CHOICES)
    employment_status = serializers.ChoiceField(choices=BeneficiaryProfile.EMPLOYMENT_CHOICES)
    family_status = serializers.ChoiceField(choices=BeneficiaryProfile.FAMILY_STATUS_CHOICES)
    priority_needs = serializers.CharField()

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return data

    def create(self, validated_data):
        # Remover campos de confirmação
        validated_data.pop('password_confirm')
        
        # Separar dados do usuário e do perfil
        user_data = {
            'username': validated_data['email'],
            'email': validated_data['email'],
            'password': validated_data.pop('password')
        }
        
        # Criar usuário
        user = User.objects.create_user(**user_data)
        
        # Criar perfil de beneficiário
        profile_data = validated_data
        profile_data['user'] = user
        
        beneficiary_profile = BeneficiaryProfile.objects.create(**profile_data)
        
        return beneficiary_profile


class BeneficiaryProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer completo para criar perfil de beneficiário com todos os dados do formulário multi-página"""
    
    class Meta:
        model = BeneficiaryProfile
        fields = [
            # Dados pessoais básicos (Página 1)
            'full_name', 'date_of_birth', 'gender', 'phone_number', 'alternative_phone',
            
            # Localização (Página 2)
            'province', 'district', 'administrative_post', 'locality', 'neighborhood', 'address_details',
            
            # Família (Página 3)
            'family_status', 'family_members_count', 'children_count', 'elderly_count', 'disabled_count',
            
            # Educação e trabalho (Página 4)
            'education_level', 'employment_status', 'monthly_income',
            
            # Vulnerabilidades e necessidades (Página 5)
            'is_displaced', 'displacement_reason', 'has_chronic_illness', 'chronic_illness_details',
            'priority_needs', 'additional_information'
        ]

    def create(self, validated_data):
        # Associar automaticamente ao usuário logado
        request = self.context['request']
        validated_data['user'] = request.user
        
        # Não definir valores padrão - usar os valores enviados do formulário
        # Apenas garantir que campos obrigatórios tenham valores se não enviados
        validated_data.setdefault('province', 'Cabo Delgado')
        validated_data.setdefault('family_members_count', 1)
        validated_data.setdefault('children_count', 0)
        validated_data.setdefault('elderly_count', 0)
        validated_data.setdefault('disabled_count', 0)
        validated_data.setdefault('monthly_income', None)
        validated_data.setdefault('is_displaced', False)
        validated_data.setdefault('has_chronic_illness', False)
        
        return super().create(validated_data)


class SupportRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportRequest
        fields = [
            'request_type', 'title', 'description', 'urgency',
            'estimated_beneficiaries', 'estimated_cost', 'needed_by_date'
        ]

    def create(self, validated_data):
        # Associar automaticamente ao beneficiário logado
        request = self.context['request']
        validated_data['beneficiary'] = request.user.beneficiary_profile
        return super().create(validated_data)


# Serializer para dados completos do usuário
class UserCompleteSerializer(serializers.ModelSerializer):
    """Serializer para dados completos do usuário Django"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'date_joined',
            'last_login'
        ]
        read_only_fields = ['date_joined', 'last_login']


# Serializer para perfil de cliente (client_area)
class ClientProfileSerializer(serializers.ModelSerializer):
    """Serializer para perfil do client_area se existir"""
    
    class Meta:
        from client_area.models import UserProfile as ClientProfile
        model = ClientProfile
        fields = [
            'id', 'user_type', 'phone', 'address', 'description', 'avatar',
            'date_of_birth', 'email_notifications', 'sms_notifications',
            'push_notifications', 'profile_public', 'show_activity',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


# Serializer completo do beneficiário com todos os dados do usuário
class BeneficiaryProfileCompleteSerializer(serializers.ModelSerializer):
    """Serializer completo incluindo todos os dados do usuário e perfis relacionados"""
    
    # Dados completos do usuário Django
    user_complete = UserCompleteSerializer(source='user', read_only=True)
    
    # Dados do perfil client_area se existir
    client_profile = serializers.SerializerMethodField()
    
    # Campos calculados
    age = serializers.ReadOnlyField()
    vulnerability_score = serializers.ReadOnlyField()
    
    # Campos do usuário para facilitar acesso
    user_email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    user_full_name = serializers.SerializerMethodField()
    user_date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    user_last_login = serializers.DateTimeField(source='user.last_login', read_only=True)
    user_is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = BeneficiaryProfile
        fields = [
            # Identificação básica
            'id', 'user', 'user_complete', 'client_profile',
            
            # Dados do usuário (acesso direto)
            'user_email', 'username', 'user_first_name', 'user_last_name', 
            'user_full_name', 'user_date_joined', 'user_last_login', 'user_is_active',
            
            # Dados pessoais do beneficiário
            'full_name', 'date_of_birth', 'age', 'gender', 'phone_number', 'alternative_phone',
            
            # Localização
            'province', 'district', 'administrative_post', 'locality', 'neighborhood', 'address_details',
            
            # Educação e trabalho
            'education_level', 'employment_status', 'monthly_income',
            
            # Família
            'family_status', 'family_members_count', 'children_count', 'elderly_count', 'disabled_count',
            
            # Situação especial
            'is_displaced', 'displacement_reason', 'has_chronic_illness', 'chronic_illness_details',
            
            # Necessidades e observações
            'priority_needs', 'additional_information',
            
            # Campos do sistema
            'vulnerability_score', 'created_at', 'updated_at', 'is_verified', 'verification_date'
        ]
        read_only_fields = ['created_at', 'updated_at', 'is_verified', 'verification_date']

    def get_client_profile(self, obj):
        """Retorna dados do perfil client_area se existir"""
        try:
            from client_area.models import UserProfile as ClientProfile
            client_profile = ClientProfile.objects.get(user=obj.user)
            return ClientProfileSerializer(client_profile).data
        except:
            return None

    def get_user_full_name(self, obj):
        """Retorna nome completo do usuário ou username se não tiver nome"""
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username


# Serializer para solicitações com dados completos do beneficiário
class SupportRequestCompleteSerializer(serializers.ModelSerializer):
    """Serializer de solicitação com dados completos do beneficiário"""
    
    # Dados completos do beneficiário
    beneficiary_complete = BeneficiaryProfileCompleteSerializer(source='beneficiary', read_only=True)
    
    # Dados básicos para compatibilidade
    beneficiary_name = serializers.CharField(source='beneficiary.full_name', read_only=True)
    beneficiary_location = serializers.SerializerMethodField()
    
    # Campos calculados
    is_overdue = serializers.ReadOnlyField()
    days_since_request = serializers.SerializerMethodField()
    communications_count = serializers.SerializerMethodField()
    
    # Dados do revisor se existir
    reviewed_by_complete = UserCompleteSerializer(source='reviewed_by', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    # Dados do responsável se existir
    assigned_to_complete = UserCompleteSerializer(source='assigned_to', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = SupportRequest
        fields = [
            # Identificação
            'id', 'beneficiary', 'beneficiary_complete', 'beneficiary_name', 'beneficiary_location',
            
            # Dados da solicitação
            'request_type', 'title', 'description', 'urgency', 'status',
            'estimated_beneficiaries', 'estimated_cost', 'requested_date', 'needed_by_date',
            
            # Revisão e aprovação
            'reviewed_by', 'reviewed_by_complete', 'reviewed_by_name', 'reviewed_at', 'admin_notes',
            
            # Execução
            'assigned_to', 'assigned_to_complete', 'assigned_to_name', 'started_at', 'completed_at',
            'actual_cost', 'actual_beneficiaries',
            
            # Campos calculados
            'is_overdue', 'days_since_request', 'communications_count'
        ]
        read_only_fields = ['requested_date', 'beneficiary_name', 'beneficiary_location']

    def get_beneficiary_location(self, obj):
        return f"{obj.beneficiary.district}, {obj.beneficiary.province}"

    def get_days_since_request(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.requested_date
        return delta.days

    def get_communications_count(self, obj):
        return obj.communications.count()
