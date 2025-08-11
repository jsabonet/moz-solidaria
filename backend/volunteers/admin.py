# backend/volunteers/admin.py
from django.contrib import admin
from .models import (
    VolunteerSkill, VolunteerOpportunity, VolunteerProfile, 
    VolunteerParticipation, VolunteerAchievement
)


@admin.register(VolunteerSkill)
class VolunteerSkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['category', 'name']


@admin.register(VolunteerOpportunity)
class VolunteerOpportunityAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'urgency_level', 'estimated_hours', 'created_by', 'created_at']
    list_filter = ['status', 'urgency_level', 'is_remote', 'created_at']
    search_fields = ['title', 'description', 'location']
    filter_horizontal = ['required_skills']
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'description', 'status')
        }),
        ('Localização', {
            'fields': ('location', 'is_remote')
        }),
        ('Detalhes', {
            'fields': ('estimated_hours', 'people_helped_estimate', 'urgency_level', 'required_skills')
        }),
        ('Datas', {
            'fields': ('start_date', 'end_date')
        }),
        ('Metadados', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Se é novo objeto
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(VolunteerProfile)
class VolunteerProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'volunteer_level', 'total_hours_contributed', 'total_people_helped', 'is_active']
    list_filter = ['is_active', 'availability', 'created_at']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    filter_horizontal = ['skills']
    readonly_fields = ['total_hours_contributed', 'total_people_helped', 'volunteer_level', 'hours_to_next_level', 'average_rating']
    
    fieldsets = (
        ('Usuário', {
            'fields': ('user', 'is_active')
        }),
        ('Perfil', {
            'fields': ('bio', 'skills')
        }),
        ('Disponibilidade', {
            'fields': ('availability', 'max_hours_per_week')
        }),
        ('Contato', {
            'fields': ('phone', 'address', 'emergency_contact', 'emergency_phone')
        }),
        ('Estatísticas', {
            'fields': ('total_hours_contributed', 'total_people_helped', 'volunteer_level', 'hours_to_next_level', 'average_rating'),
            'classes': ('collapse',)
        })
    )


@admin.register(VolunteerParticipation)
class VolunteerParticipationAdmin(admin.ModelAdmin):
    list_display = ['volunteer', 'opportunity', 'status', 'actual_hours', 'people_helped', 'admin_rating', 'created_at']
    list_filter = ['status', 'admin_rating', 'created_at', 'completion_date']
    search_fields = ['volunteer__user__username', 'opportunity__title']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Participação', {
            'fields': ('volunteer', 'opportunity', 'status')
        }),
        ('Candidatura', {
            'fields': ('application_message',)
        }),
        ('Resultados', {
            'fields': ('actual_hours', 'people_helped', 'admin_notes', 'admin_rating')
        }),
        ('Feedback', {
            'fields': ('volunteer_feedback',)
        }),
        ('Datas', {
            'fields': ('start_date', 'completion_date', 'created_at', 'updated_at')
        })
    )
    
    actions = ['mark_as_completed', 'mark_as_accepted']
    
    def mark_as_completed(self, request, queryset):
        updated = queryset.filter(status__in=['accepted', 'in_progress']).update(status='completed')
        self.message_user(request, f'{updated} participações marcadas como concluídas.')
    mark_as_completed.short_description = 'Marcar como concluído'
    
    def mark_as_accepted(self, request, queryset):
        updated = queryset.filter(status='applied').update(status='accepted')
        self.message_user(request, f'{updated} candidaturas aceitas.')
    mark_as_accepted.short_description = 'Aceitar candidaturas'


@admin.register(VolunteerAchievement)
class VolunteerAchievementAdmin(admin.ModelAdmin):
    list_display = ['volunteer', 'title', 'earned_date']
    list_filter = ['earned_date']
    search_fields = ['volunteer__user__username', 'title', 'description']
    readonly_fields = ['earned_date']
