# backend/donations/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Donation, DonationComment, DonationMethod, DonationStats

class DonorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'is_staff']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

class DonationMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationMethod
        fields = ['id', 'name', 'description', 'account_details', 'is_active']

class DonationCommentSerializer(serializers.ModelSerializer):
    author = DonorSerializer(read_only=True)
    user = DonorSerializer(source='author', read_only=True)  # Alias for frontend compatibility
    author_name = serializers.SerializerMethodField()
    content = serializers.CharField(source='message', read_only=True)  # Alias for frontend compatibility
    
    class Meta:
        model = DonationComment
        fields = ['id', 'message', 'content', 'is_internal', 'created_at', 'author', 'user', 'author_name']
    
    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username

class DonationSerializer(serializers.ModelSerializer):
    donor = DonorSerializer(read_only=True)
    reviewed_by = DonorSerializer(read_only=True)
    comments = DonationCommentSerializer(many=True, read_only=True)
    donation_method = DonationMethodSerializer(read_only=True)
    formatted_amount = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    days_since_submission = serializers.SerializerMethodField()
    
    class Meta:
        model = Donation
        fields = [
            'id', 'amount', 'currency', 'formatted_amount',
            'donation_method', 'payment_method', 'payment_method_display', 'payment_reference', 'payment_proof',
            'status', 'status_display', 'purpose', 'is_anonymous',
            'submission_date', 'review_date', 'approval_date',
            'donor', 'reviewed_by', 'admin_notes', 'donor_message', 'rejection_reason',
            'comments', 'days_since_submission',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'submission_date', 'review_date', 'approval_date', 'reviewed_by']
    
    def get_days_since_submission(self, obj):
        from django.utils import timezone
        delta = timezone.now() - obj.submission_date
        return delta.days

class DonationCreateSerializer(serializers.ModelSerializer):
    """Serializer para criação de doações pelo doador"""
    
    # Accept both donation_method (new) and payment_method (legacy)
    donation_method = serializers.PrimaryKeyRelatedField(
        queryset=DonationMethod.objects.filter(is_active=True),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Donation
        fields = [
            'amount', 'donation_method', 'payment_method', 'payment_reference', 
            'payment_proof', 'purpose', 'donor_message', 'is_anonymous'
        ]
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("O valor da doação deve ser maior que zero.")
        return value
    
    def validate_payment_proof(self, value):
        if value:
            # Validar tamanho do arquivo (máx 10MB)
            if value.size > 10 * 1024 * 1024:
                raise serializers.ValidationError("O arquivo deve ter no máximo 10MB.")
            
            # Validar tipo de arquivo
            allowed_types = [
                'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]
            
            if hasattr(value, 'content_type') and value.content_type not in allowed_types:
                raise serializers.ValidationError(
                    "Tipo de arquivo não permitido. Use imagens, PDF ou documentos Word."
                )
        
        return value
    
    def validate(self, data):
        # Ensure at least one payment method is provided
        if not data.get('donation_method') and not data.get('payment_method'):
            raise serializers.ValidationError(
                "Um método de doação deve ser especificado."
            )
        return data

class DonationUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualização de doações pelo admin"""
    admin_comment = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Donation
        fields = ['status', 'admin_comment', 'rejection_reason']
    
    def validate(self, data):
        # rejection_reason é opcional - admin pode rejeitar sem justificativa
        return data
    
    def update(self, instance, validated_data):
        # Map admin_comment to admin_notes field in the model
        if 'admin_comment' in validated_data:
            validated_data['admin_notes'] = validated_data.pop('admin_comment')
        return super().update(instance, validated_data)

class DonationStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationStats
        fields = '__all__'
