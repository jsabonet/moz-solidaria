# backend/apps/partnerships/admin.py
from django.contrib import admin
from .models import PartnerMessage, PartnerProjectAssignment


@admin.register(PartnerMessage)
class PartnerMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender_type', 'sender_user', 'partner_user', 'content_preview', 'read', 'created_at']
    list_filter = ['sender_type', 'read', 'created_at']
    search_fields = ['content', 'sender_user__username', 'partner_user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + "..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Conteúdo'


@admin.register(PartnerProjectAssignment)
class PartnerProjectAssignmentAdmin(admin.ModelAdmin):
    list_display = ['partner_user', 'project', 'role', 'is_active', 'assigned_at']
    list_filter = ['role', 'is_active', 'assigned_at']
    search_fields = ['partner_user__username', 'project__name']
    readonly_fields = ['assigned_at']
