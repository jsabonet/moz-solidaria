# backend/client_area/notifications.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import UserProfile, Notification


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        
        if self.user.is_authenticated:
            # Criar grupo único para o usuário
            self.group_name = f'user_{self.user.id}_notifications'
            
            # Entrar no grupo de notificações do usuário
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name
            )
            
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            # Sair do grupo de notificações
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Receber mensagens do frontend"""
        try:
            data = json.loads(text_data)
            action = data.get('action')
            
            if action == 'mark_read':
                notification_id = data.get('notification_id')
                await self.mark_notification_read(notification_id)
            
            elif action == 'get_unread_count':
                count = await self.get_unread_count()
                await self.send(text_data=json.dumps({
                    'type': 'unread_count',
                    'count': count
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Formato JSON inválido'
            }))

    async def notification_message(self, event):
        """Enviar notificação para o usuário"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))

    async def unread_count_update(self, event):
        """Atualizar contador de não lidas"""
        await self.send(text_data=json.dumps({
            'type': 'unread_count_update',
            'count': event['count']
        }))

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        """Marcar notificação como lida"""
        try:
            profile = self.user.client_profile
            notification = Notification.objects.get(
                id=notification_id, 
                user_profile=profile
            )
            notification.is_read = True
            notification.save()
            return True
        except Notification.DoesNotExist:
            return False

    @database_sync_to_async
    def get_unread_count(self):
        """Obter contagem de notificações não lidas"""
        try:
            profile = self.user.client_profile
            return Notification.objects.filter(
                user_profile=profile, 
                is_read=False
            ).count()
        except:
            return 0


# Função auxiliar para enviar notificações
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def send_notification_to_user(user_profile, notification_data):
    """Enviar notificação em tempo real para um usuário específico"""
    channel_layer = get_channel_layer()
    group_name = f'user_{user_profile.user.id}_notifications'
    
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'notification_message',
            'notification': notification_data
        }
    )

def update_unread_count(user_profile, count):
    """Atualizar contador de não lidas em tempo real"""
    channel_layer = get_channel_layer()
    group_name = f'user_{user_profile.user.id}_notifications'
    
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            'type': 'unread_count_update',
            'count': count
        }
    )
