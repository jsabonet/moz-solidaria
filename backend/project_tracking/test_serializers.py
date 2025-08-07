# project_tracking/test_serializers.py
from rest_framework import serializers
from core.models import Project
from .serializers import (
    ProjectMetricsSerializer, ProjectUpdateSerializer, ProjectMilestoneSerializer,
    ProjectEvidenceSerializer, ProjectGalleryImageSerializer, 
    ProjectMetricsEntrySerializer
)

class NewProjectTrackingDataSerializer(serializers.ModelSerializer):
    """Novo serializer para testar"""
    metrics = ProjectMetricsSerializer(read_only=True)
    updates = ProjectUpdateSerializer(many=True, read_only=True, source='tracking_updates')
    milestones = ProjectMilestoneSerializer(many=True, read_only=True, source='tracking_milestones')
    gallery_images = ProjectGalleryImageSerializer(many=True, read_only=True, source='tracking_gallery_images')
    evidence = ProjectEvidenceSerializer(many=True, read_only=True, source='tracking_evidence')
    metrics_entries = ProjectMetricsEntrySerializer(many=True, read_only=True, source='tracking_metrics_entries')
    
    # Campos de relacionamento
    program = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    
    # Campos com display
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    # Estatísticas calculadas
    total_updates = serializers.SerializerMethodField()
    total_images = serializers.SerializerMethodField()
    featured_images = serializers.SerializerMethodField()
    recent_updates = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'start_date', 'end_date', 'created_at', 'updated_at',
            'status', 'status_display', 'priority', 'priority_display',
            'program', 'category', 'location', 'target_beneficiaries',
            'current_beneficiaries', 'progress_percentage',
            'metrics', 'updates', 'milestones', 'gallery_images', 
            'evidence', 'metrics_entries', 'total_updates', 'total_images',
            'featured_images', 'recent_updates'
        ]
    
    def get_program(self, obj):
        if obj.program:
            return {
                'id': obj.program.id,
                'name': obj.program.name,
                'color': obj.program.color
            }
        return None
    
    def get_category(self, obj):
        if obj.category:
            return {
                'id': obj.category.id,
                'name': obj.category.name,
                'color': obj.category.color
            }
        return None
    
    def get_total_updates(self, obj):
        return obj.tracking_updates.filter(status='published').count()
    
    def get_total_images(self, obj):
        return obj.tracking_gallery_images.count()
    
    def get_featured_images(self, obj):
        featured = obj.tracking_gallery_images.filter(featured=True)[:8]
        return ProjectGalleryImageSerializer(featured, many=True, context=self.context).data
    
    def get_recent_updates(self, obj):
        recent = obj.tracking_updates.filter(status='published').order_by('-created_at')[:5]
        return ProjectUpdateSerializer(recent, many=True, context=self.context).data
