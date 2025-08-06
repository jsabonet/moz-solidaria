# backend/project_tracking/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import (
    ProjectMetrics, ProjectUpdate, ProjectMilestone,
    ProjectEvidence, ProjectGalleryImage, ProjectMetricsEntry
)

@admin.register(ProjectMetrics)
class ProjectMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'project', 'budget_percentage', 'milestone_percentage', 
        'people_impacted', 'progress_percentage', 'last_updated'
    ]
    list_filter = ['last_updated']
    search_fields = ['project__name', 'project__slug']
    readonly_fields = ['last_updated']
    
    fieldsets = (
        ('Projeto', {
            'fields': ('project',)
        }),
        ('Orçamento', {
            'fields': ('budget_total', 'budget_used'),
            'classes': ('collapse',)
        }),
        ('Impacto', {
            'fields': ('people_impacted', 'progress_percentage'),
        }),
        ('Milestones', {
            'fields': ('total_milestones', 'completed_milestones'),
        }),
        ('Cronograma', {
            'fields': ('start_date', 'end_date', 'actual_end_date', 'last_updated'),
            'classes': ('collapse',)
        }),
    )
    
    def budget_percentage(self, obj):
        if obj.budget_total > 0:
            percentage = (float(obj.budget_used) / float(obj.budget_total)) * 100
            color = 'red' if percentage > 90 else 'orange' if percentage > 75 else 'green'
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                color, percentage
            )
        return '0%'
    budget_percentage.short_description = 'Budget %'
    
    def milestone_percentage(self, obj):
        if obj.total_milestones > 0:
            percentage = (obj.completed_milestones / obj.total_milestones) * 100
            color = 'green' if percentage > 75 else 'orange' if percentage > 50 else 'red'
            return format_html(
                '<span style="color: {};">{:.1f}%</span>',
                color, percentage
            )
        return '0%'
    milestone_percentage.short_description = 'Milestones %'

@admin.register(ProjectUpdate)
class ProjectUpdateAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'type', 'status', 'author', 'created_at']
    list_filter = ['type', 'status', 'created_at', 'project']
    search_fields = ['title', 'description', 'project__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Conteúdo', {
            'fields': ('project', 'title', 'description', 'type', 'status')
        }),
        ('Métricas', {
            'fields': ('people_impacted', 'budget_spent', 'progress_percentage'),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('author', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.author = request.user
        super().save_model(request, obj, form, change)

@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'target_date', 'is_overdue']
    list_filter = ['status', 'target_date', 'project']
    search_fields = ['title', 'description', 'project__name']
    readonly_fields = ['created_at', 'completed_date']
    filter_horizontal = ['dependencies']
    
    fieldsets = (
        ('Milestone', {
            'fields': ('project', 'title', 'description', 'status')
        }),
        ('Cronograma', {
            'fields': ('target_date', 'completed_date')
        }),
        ('Dependências', {
            'fields': ('dependencies',),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def is_overdue(self, obj):
        from django.utils import timezone
        if obj.target_date < timezone.now().date() and obj.status != 'completed':
            return format_html('<span style="color: red;">Atrasado</span>')
        return format_html('<span style="color: green;">No prazo</span>')
    is_overdue.short_description = 'Status Prazo'

@admin.register(ProjectGalleryImage)
class ProjectGalleryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'category', 'featured', 'image_preview']
    list_filter = ['category', 'featured', 'project']
    search_fields = ['title', 'description', 'project__name']
    readonly_fields = ['image_preview']
    
    fieldsets = (
        ('Imagem', {
            'fields': ('project', 'image', 'image_preview')
        }),
        ('Detalhes', {
            'fields': ('title', 'description', 'category', 'featured')
        }),
        ('Metadados', {
            'fields': ('uploaded_by', 'uploaded_at'),
            'classes': ('collapse',)
        }),
    )
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 100px; max-width: 150px;" />',
                obj.image.url
            )
        return 'Nenhuma imagem'
    image_preview.short_description = 'Preview'
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ProjectEvidence)
class ProjectEvidenceAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'type', 'file_link']
    list_filter = ['type', 'project']
    search_fields = ['title', 'description', 'project__name']
    readonly_fields = ['file_link']
    
    fieldsets = (
        ('Evidência', {
            'fields': ('project', 'file', 'file_link')
        }),
        ('Detalhes', {
            'fields': ('title', 'description', 'type')
        }),
        ('Metadados', {
            'fields': ('uploaded_by', 'uploaded_at'),
            'classes': ('collapse',)
        }),
    )
    
    def file_link(self, obj):
        if obj.file:
            return format_html(
                '<a href="{}" target="_blank">Download</a>',
                obj.file.url
            )
        return 'Nenhum arquivo'
    file_link.short_description = 'Arquivo'
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

@admin.register(ProjectMetricsEntry)
class ProjectMetricsEntryAdmin(admin.ModelAdmin):
    list_display = ['project', 'date', 'category', 'people_impacted', 'verified', 'created_at']
    list_filter = ['category', 'verified', 'created_at', 'project']
    search_fields = ['description', 'project__name']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Métrica', {
            'fields': ('project', 'date', 'category', 'people_impacted', 'budget_spent', 'progress_percentage')
        }),
        ('Detalhes', {
            'fields': ('description',)
        }),
        ('Verificação', {
            'fields': ('verified', 'verified_by'),
            'classes': ('collapse',)
        }),
        ('Metadados', {
            'fields': ('author', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.author = request.user
        if obj.verified and not obj.verified_by:
            obj.verified_by = request.user
        super().save_model(request, obj, form, change)
