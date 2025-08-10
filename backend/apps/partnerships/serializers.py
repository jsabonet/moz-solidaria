# backend/apps/partnerships/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PartnerMessage, PartnerProjectAssignment


class PartnerMessageSerializer(serializers.ModelSerializer):
    attachment_url = serializers.ReadOnlyField()
    sender_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PartnerMessage
        fields = [
            'id', 'content', 'sender_type', 'sender_user', 'partner_user',
            'attachment', 'attachment_url', 'read', 'read_at', 
            'created_at', 'updated_at', 'sender_name'
        ]
        read_only_fields = ['sender_user', 'read_at', 'created_at', 'updated_at']
    
    def get_sender_name(self, obj):
        return obj.sender_user.get_full_name() or obj.sender_user.username
    
    def create(self, validated_data):
        # Determinar sender_type baseado no usuário
        user = self.context['request'].user
        
        if user.is_staff:
            validated_data['sender_type'] = 'admin'
            # Para admin, partner_user deve ser especificado ou inferido
            if 'partner_user' not in validated_data:
                # Pegar do contexto da requisição se disponível
                partner_id = self.context['request'].data.get('partner_user_id')
                if partner_id:
                    validated_data['partner_user'] = User.objects.get(id=partner_id)
        else:
            validated_data['sender_type'] = 'partner'
            validated_data['partner_user'] = user
        
        validated_data['sender_user'] = user
        return super().create(validated_data)


class PartnerProjectAssignmentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)
    project_slug = serializers.CharField(source='project.slug', read_only=True)
    project_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = PartnerProjectAssignment
        fields = [
            'id', 'partner_user', 'project', 'project_name', 'project_slug', 
            'role', 'assigned_at', 'is_active', 'project_progress'
        ]
    
    def get_project_progress(self, obj):
        # Integrar com o sistema de tracking existente
        project = obj.project
        if hasattr(project, 'metrics'):
            return getattr(project.metrics, 'progressPercentage', 0)
        return getattr(project, 'progress_percentage', 0)


class BulkReadMessagesSerializer(serializers.Serializer):
    message_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False
    )
