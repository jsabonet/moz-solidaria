# backend/client_area/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile, DashboardStats, Notification


# @receiver(post_save, sender=User)
# def create_user_profile(sender, instance, created, **kwargs):
#     """Criar perfil automático quando usuário é criado"""
#     if created:
#         UserProfile.objects.get_or_create(
#             user=instance,
#             defaults={'user_type': 'donor'}
#         )
# SIGNAL DESATIVADO - O perfil é criado no serializer com o tipo correto


@receiver(post_save, sender=UserProfile)
def create_dashboard_stats(sender, instance, created, **kwargs):
    """Criar estatísticas automáticas quando perfil é criado"""
    if created:
        DashboardStats.objects.get_or_create(user_profile=instance)
        
        # Criar notificação de boas-vindas
        Notification.objects.create(
            user_profile=instance,
            title='Bem-vindo ao Portal de Comunidade!',
            message=f'Olá {instance.full_name}, seja bem-vindo ao Portal de Comunidade da Moz Solidária. Explore as funcionalidades e conecte-se com nossa comunidade.',
            type='info',
            action_url='/client-area',
            action_text='Explorar Portal'
        )
