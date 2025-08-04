# backend/client_area/admin.py
from django.contrib import admin
from .models import UserProfile, Notification, MatchingRequest, DashboardStats, Cause, Skill, UserSkill


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'user_type', 'user__email', 'created_at']
    list_filter = ['user_type', 'created_at', 'email_notifications']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = [
        ('Informações do Usuário', {
            'fields': ['user', 'user_type', 'phone', 'address', 'description', 'avatar', 'date_of_birth']
        }),
        ('Preferências', {
            'fields': ['email_notifications', 'sms_notifications', 'push_notifications']
        }),
        ('Privacidade', {
            'fields': ['profile_public', 'show_activity']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        })
    ]


@admin.register(Cause)
class CauseAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'category', 'description']


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'skill', 'level', 'years_experience']
    list_filter = ['level', 'skill__category']
    search_fields = ['user_profile__user__username', 'skill__name']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['title', 'user_profile', 'type', 'is_read', 'created_at']
    list_filter = ['type', 'is_read', 'created_at']
    search_fields = ['title', 'message', 'user_profile__user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Marcar como lida"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
    mark_as_unread.short_description = "Marcar como não lida"


@admin.register(MatchingRequest)
class MatchingRequestAdmin(admin.ModelAdmin):
    list_display = ['title', 'requester', 'volunteer', 'status', 'priority', 'start_date']
    list_filter = ['status', 'priority', 'cause', 'created_at']
    search_fields = ['title', 'description', 'location', 'requester__user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = [
        ('Informações Básicas', {
            'fields': ['title', 'description', 'location', 'cause']
        }),
        ('Participantes', {
            'fields': ['requester', 'volunteer', 'max_volunteers']
        }),
        ('Status e Prioridade', {
            'fields': ['status', 'priority']
        }),
        ('Datas', {
            'fields': ['start_date', 'end_date']
        }),
        ('Habilidades', {
            'fields': ['required_skills']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        })
    ]


@admin.register(DashboardStats)
class DashboardStatsAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'total_donations', 'volunteer_hours', 'last_updated']
    list_filter = ['last_updated']
    search_fields = ['user_profile__user__username']
    readonly_fields = ['last_updated']
