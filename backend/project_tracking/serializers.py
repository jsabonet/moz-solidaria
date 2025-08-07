# backend/project_tracking/serializers.py
from rest_framework import serializers
from .models import (
    ProjectMetrics, ProjectUpdate, ProjectMilestone, 
    ProjectEvidence, ProjectGalleryImage, ProjectMetricsEntry
)
from core.models import Project

class ProjectMetricsSerializer(serializers.ModelSerializer):
    budget_percentage = serializers.SerializerMethodField()
    milestone_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectMetrics
        fields = '__all__'
    
    def get_budget_percentage(self, obj):
        if obj.budget_total > 0:
            return round((float(obj.budget_used) / float(obj.budget_total)) * 100, 2)
        return 0
    
    def get_milestone_percentage(self, obj):
        if obj.total_milestones > 0:
            return round((obj.completed_milestones / obj.total_milestones) * 100, 2)
        return 0

class ProjectUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = ProjectUpdate
        fields = '__all__'
        read_only_fields = ('author', 'project')

class ProjectMilestoneSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_overdue = serializers.SerializerMethodField()
    dependencies_data = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectMilestone
        fields = '__all__'
        read_only_fields = ('project',)
    
    def get_is_overdue(self, obj):
        from django.utils import timezone
        return obj.target_date < timezone.now().date() and obj.status != 'completed'
    
    def get_dependencies_data(self, obj):
        return ProjectMilestoneSerializer(obj.dependencies.all(), many=True).data

class ProjectEvidenceSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectEvidence
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'project')
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                try:
                    return request.build_absolute_uri(obj.file.url)
                except:
                    # Fallback para URL relativa se build_absolute_uri falhar
                    return obj.file.url
            return obj.file.url
        return None

class ProjectGalleryImageSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectGalleryImage
        fields = '__all__'
        read_only_fields = ('uploaded_by',)
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                try:
                    return request.build_absolute_uri(obj.image.url)
                except:
                    # Fallback para URL relativa se build_absolute_uri falhar
                    return obj.image.url
            return obj.image.url
        return None

class ProjectMetricsEntrySerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = ProjectMetricsEntry
        fields = '__all__'
        read_only_fields = ('author',)

class ProjectTrackingDataSerializer(serializers.ModelSerializer):
    """Serializer consolidado para todos os dados de tracking de um projeto"""
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
