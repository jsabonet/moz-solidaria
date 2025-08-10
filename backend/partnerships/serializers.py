from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PartnerMessage, PartnerProjectAssignment
from core.models import Project


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for message display"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ProjectBasicSerializer(serializers.ModelSerializer):
    """Basic project serializer for message display.
    Campo 'title' ajustado para 'name' conforme modelo core.Project."""
    class Meta:
        model = Project
        fields = ['id', 'name', 'slug', 'status']


class PartnerMessageSerializer(serializers.ModelSerializer):
    """Serializer for partner messages"""
    sender_details = UserBasicSerializer(source='sender', read_only=True)
    recipient_details = UserBasicSerializer(source='recipient', read_only=True)
    project_details = ProjectBasicSerializer(source='related_project', read_only=True)
    attachment_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PartnerMessage
        fields = [
            'id', 'subject', 'content', 'sender_type', 'sender', 'recipient',
            'sender_details', 'recipient_details', 'attachment', 'attachment_url',
            'status', 'is_read', 'read_at', 'related_project', 'project_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['sender', 'sender_type', 'status', 'is_read', 'read_at', 'created_at', 'updated_at']
    
    def get_attachment_url(self, obj):
        """Get the attachment URL if it exists"""
        if obj.attachment:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.attachment.url)
            return obj.attachment.url
        return None
    
    def create(self, validated_data):
        """Create a new partner message"""
        # Set sender from request user
        request = self.context.get('request')
        if request and request.user:
            validated_data['sender'] = request.user
            # Determine sender type based on user permissions
            if request.user.is_staff or request.user.is_superuser:
                validated_data['sender_type'] = 'admin'
            else:
                validated_data['sender_type'] = 'partner'
        
        return super().create(validated_data)


class PartnerMessageCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating messages with sensible defaults"""
    subject = serializers.CharField(required=False, allow_blank=True)
    recipient = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = PartnerMessage
        fields = ['subject', 'content', 'recipient', 'attachment', 'related_project']

    def validate(self, attrs):
        if not attrs.get('content') and not attrs.get('attachment'):
            raise serializers.ValidationError('Mensagem requer conteúdo ou anexo.')
        return attrs

    def create(self, validated_data):
        """Create a new partner message with auto subject and default recipient resolution."""
        request = self.context.get('request')
        if request and request.user:
            validated_data['sender'] = request.user
            if request.user.is_staff or request.user.is_superuser:
                validated_data['sender_type'] = 'admin'
            else:
                validated_data['sender_type'] = 'partner'
                # Auto-pick an admin recipient if none provided
                if not validated_data.get('recipient'):
                    admin = User.objects.filter(is_staff=True).first()
                    if admin:
                        validated_data['recipient'] = admin
        # Default subject
        if not validated_data.get('subject'):
            validated_data['subject'] = (validated_data.get('content') or '')[:60] or 'Mensagem'
        return super().create(validated_data)


class PartnerProjectAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for partner project assignments"""
    partner_details = UserBasicSerializer(source='partner', read_only=True)
    project_details = ProjectBasicSerializer(source='project', read_only=True)
    assigned_by_details = UserBasicSerializer(source='assigned_by', read_only=True)
    
    class Meta:
        model = PartnerProjectAssignment
        fields = [
            'id', 'partner', 'project', 'assigned_by', 'partner_details',
            'project_details', 'assigned_by_details', 'role', 'status',
            'assignment_notes', 'terms_and_conditions', 'start_date',
            'expected_end_date', 'actual_end_date', 'response_date',
            'response_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['assigned_by', 'response_date', 'actual_end_date', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Create a new project assignment"""
        request = self.context.get('request')
        if request and request.user:
            validated_data['assigned_by'] = request.user
        
        return super().create(validated_data)


class BulkMarkAsReadSerializer(serializers.Serializer):
    """Serializer for bulk marking messages as read"""
    message_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="List of message IDs to mark as read"
    )
    
    def validate_message_ids(self, value):
        """Validate that all message IDs exist and belong to the user"""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("Authentication required")
        
        # Check if all messages exist and user has access
        existing_messages = PartnerMessage.objects.filter(
            id__in=value,
            recipient=request.user
        ).values_list('id', flat=True)
        
        invalid_ids = set(value) - set(existing_messages)
        if invalid_ids:
            raise serializers.ValidationError(
                f"Invalid or inaccessible message IDs: {list(invalid_ids)}"
            )
        
        return value


class PartnerAssignmentResponseSerializer(serializers.Serializer):
    """Serializer for responding to project assignments"""
    RESPONSE_CHOICES = [
        ('accept', 'Accept'),
        ('reject', 'Reject'),
    ]
    
    response = serializers.ChoiceField(choices=RESPONSE_CHOICES)
    response_notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate assignment response"""
        assignment_id = self.context.get('assignment_id')
        request = self.context.get('request')
        
        if not assignment_id:
            raise serializers.ValidationError("Assignment ID is required")
        
        try:
            assignment = PartnerProjectAssignment.objects.get(
                id=assignment_id,
                partner=request.user
            )
            
            if assignment.status != 'pending':
                raise serializers.ValidationError(
                    f"Cannot respond to assignment with status: {assignment.status}"
                )
            
        except PartnerProjectAssignment.DoesNotExist:
            raise serializers.ValidationError("Assignment not found or access denied")
        
        return data
