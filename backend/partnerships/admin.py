from django.contrib import admin
from .models import PartnerMessage, PartnerProjectAssignment


@admin.register(PartnerMessage)
class PartnerMessageAdmin(admin.ModelAdmin):
    """
    Admin interface for Partner Messages
    """
    list_display = [
        'subject', 'sender', 'recipient', 'sender_type', 
        'status', 'is_read', 'created_at'
    ]
    list_filter = [
        'sender_type', 'status', 'is_read', 'created_at', 
        'related_project'
    ]
    search_fields = [
        'subject', 'content', 'sender__username', 
        'recipient__username', 'sender__email', 'recipient__email'
    ]
    readonly_fields = ['created_at', 'updated_at', 'read_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Message Details', {
            'fields': ('subject', 'content', 'attachment')
        }),
        ('Participants', {
            'fields': ('sender', 'sender_type', 'recipient')
        }),
        ('Project Association', {
            'fields': ('related_project',),
            'classes': ('collapse',)
        }),
        ('Status & Tracking', {
            'fields': ('status', 'is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queries with select_related"""
        return super().get_queryset(request).select_related(
            'sender', 'recipient', 'related_project'
        )
    
    def has_change_permission(self, request, obj=None):
        """Allow admins to modify messages"""
        return request.user.is_superuser or request.user.is_staff
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete messages"""
        return request.user.is_superuser


@admin.register(PartnerProjectAssignment)
class PartnerProjectAssignmentAdmin(admin.ModelAdmin):
    """
    Admin interface for Partner Project Assignments
    """
    list_display = [
        'partner', 'project', 'role', 'status', 
        'assigned_by', 'start_date', 'created_at'
    ]
    list_filter = [
        'role', 'status', 'start_date', 'created_at',
        'project__category', 'project__status'
    ]
    search_fields = [
        'partner__username', 'partner__email', 'project__title',
        'assignment_notes', 'response_notes'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'response_date', 'actual_end_date'
    ]
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Assignment Details', {
            'fields': ('partner', 'project', 'assigned_by', 'role')
        }),
        ('Status & Timeline', {
            'fields': ('status', 'start_date', 'expected_end_date', 'actual_end_date')
        }),
        ('Notes & Terms', {
            'fields': ('assignment_notes', 'terms_and_conditions'),
            'classes': ('collapse',)
        }),
        ('Partner Response', {
            'fields': ('response_date', 'response_notes'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queries with select_related"""
        return super().get_queryset(request).select_related(
            'partner', 'project', 'assigned_by'
        )
    
    def has_change_permission(self, request, obj=None):
        """Allow admins to modify assignments"""
        return request.user.is_superuser or request.user.is_staff
    
    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete assignments"""
        return request.user.is_superuser
    
    actions = ['mark_as_completed', 'mark_as_cancelled']
    
    def mark_as_completed(self, request, queryset):
        """Admin action to mark assignments as completed"""
        updated = queryset.filter(status='accepted').update(status='completed')
        self.message_user(
            request, 
            f'{updated} assignments marked as completed.'
        )
    mark_as_completed.short_description = "Mark selected assignments as completed"
    
    def mark_as_cancelled(self, request, queryset):
        """Admin action to cancel assignments"""
        updated = queryset.exclude(status__in=['completed', 'cancelled']).update(status='cancelled')
        self.message_user(
            request, 
            f'{updated} assignments cancelled.'
        )
    mark_as_cancelled.short_description = "Cancel selected assignments"
