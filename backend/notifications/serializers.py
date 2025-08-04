from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer para notificações"""
    
    recipient_name = serializers.SerializerMethodField()
    time_ago = serializers.SerializerMethodField()
    type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'type_display',
            'priority', 'priority_display', 'related_donation_id', 
            'related_comment_id', 'metadata', 'is_read', 'is_sent',
            'sent_at', 'read_at', 'action_url', 'action_text',
            'created_at', 'updated_at', 'recipient_name', 'time_ago'
        ]
        read_only_fields = ['recipient', 'created_at', 'updated_at']
    
    def get_recipient_name(self, obj):
        return obj.recipient.get_full_name() or obj.recipient.username
    
    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at)


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    """Serializer para preferências de notificação"""
    
    class Meta:
        model = NotificationPreference
        fields = [
            'notify_donation_status_change', 'notify_donation_comments',
            'notify_payment_verification', 'notify_new_donations',
            'notify_donor_comments', 'email_notifications',
            'in_app_notifications', 'updated_at'
        ]


class NotificationBulkActionSerializer(serializers.Serializer):
    """Serializer para ações em massa em notificações"""
    
    notification_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=True
    )
    action = serializers.ChoiceField(
        choices=['mark_read', 'mark_unread', 'delete'],
        required=True
    )
