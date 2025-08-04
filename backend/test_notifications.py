#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from notifications.services import NotificationService
from notifications.models import Notification

def test_notifications():
    print("=== Teste do Sistema de Notificações ===")
    
    # Buscar um usuário para teste
    user = User.objects.first()
    if not user:
        print("❌ Nenhum usuário encontrado. Criando usuário de teste...")
        user = User.objects.create_user(
            username='test_notifications',
            email='test@example.com',
            password='testpass123'
        )
    
    print(f"✅ Usuário de teste: {user.username}")
    
    # Criar notificação de teste
    notification = NotificationService.create_notification(
        recipient=user,
        title='🎉 Notificação de Teste',
        message='Este é um teste do sistema de notificações para doações.',
        notification_type='donation_created',
        priority='normal',
        action_url='/dashboard/donations',
        action_text='Ver Doações'
    )
    
    if notification:
        print(f"✅ Notificação criada com sucesso!")
        print(f"   ID: {notification.id}")
        print(f"   Título: {notification.title}")
        print(f"   Tipo: {notification.notification_type}")
        print(f"   Prioridade: {notification.priority}")
    else:
        print("❌ Falha ao criar notificação")
    
    # Verificar total de notificações
    total = Notification.objects.count()
    unread = Notification.objects.filter(is_read=False).count()
    print(f"📊 Estatísticas:")
    print(f"   Total de notificações: {total}")
    print(f"   Não lidas: {unread}")
    
    # Listar notificações do usuário
    user_notifications = Notification.objects.filter(recipient=user)[:5]
    print(f"📋 Últimas notificações do usuário:")
    for notif in user_notifications:
        status = "📧" if not notif.is_read else "✅"
        print(f"   {status} {notif.title} ({notif.notification_type})")

if __name__ == '__main__':
    test_notifications()
