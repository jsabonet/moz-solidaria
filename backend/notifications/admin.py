from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'recipient', 'notification_type', 'priority', 
        'is_read', 'is_sent', 'created_at'
    ]
    list_filter = [
        'notification_type', 'priority', 'is_read', 'is_sent', 
        'created_at'
    ]
    search_fields = ['title', 'message', 'recipient__username', 'recipient__email']
    readonly_fields = ['created_at', 'updated_at', 'sent_at', 'read_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('recipient', 'title', 'message', 'notification_type', 'priority')
        }),
        ('Referências', {
            'fields': ('related_donation_id', 'related_comment_id', 'metadata')
        }),
        ('Ações', {
            'fields': ('action_url', 'action_text')
        }),
        ('Status', {
            'fields': ('is_read', 'is_sent', 'read_at', 'sent_at')
        }),
        ('Datas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_unread', 'mark_as_sent']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f'{queryset.count()} notificações marcadas como lidas.')
    mark_as_read.short_description = "Marcar como lidas"
    
    def mark_as_unread(self, request, queryset):
        queryset.update(is_read=False)
        self.message_user(request, f'{queryset.count()} notificações marcadas como não lidas.')
    mark_as_unread.short_description = "Marcar como não lidas"
    
    def mark_as_sent(self, request, queryset):
        queryset.update(is_sent=True)
        self.message_user(request, f'{queryset.count()} notificações marcadas como enviadas.')
    mark_as_sent.short_description = "Marcar como enviadas"


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'notify_donation_status_change', 'notify_donation_comments',
        'email_notifications', 'in_app_notifications', 'updated_at'
    ]
    list_filter = [
        'notify_donation_status_change', 'notify_donation_comments',
        'notify_payment_verification', 'email_notifications',
        'in_app_notifications'
    ]
    search_fields = ['user__username', 'user__email']
    ordering = ['user__username']
