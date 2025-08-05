from django.contrib.auth.models import User
from .models import Notification, NotificationPreference


class NotificationService:
    """Serviço para criar e gerenciar notificações"""
    
    @staticmethod
    def create_notification(
        recipient,
        title,
        message,
        notification_type,
        priority='normal',
        related_donation_id=None,
        related_comment_id=None,
        action_url=None,
        action_text=None,
        metadata=None
    ):
        """Cria uma nova notificação"""
        
        # Verificar preferências do usuário
        try:
            preferences = NotificationPreference.objects.get(user=recipient)
        except NotificationPreference.DoesNotExist:
            # Criar preferências padrão se não existirem
            preferences = NotificationPreference.objects.create(user=recipient)
        
        # Verificar se o usuário quer receber este tipo de notificação
        should_notify = True
        
        if notification_type in ['donation_status_changed', 'donation_approved', 'donation_rejected']:
            should_notify = preferences.notify_donation_status_change
        elif notification_type in ['donation_comment_added', 'admin_comment', 'donor_comment']:
            should_notify = preferences.notify_donation_comments
        elif notification_type == 'payment_verified':
            should_notify = preferences.notify_payment_verification
        elif notification_type == 'donation_created' and recipient.is_staff:
            should_notify = preferences.notify_new_donations
        
        if not should_notify:
            return None
        
        notification = Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            notification_type=notification_type,
            priority=priority,
            related_donation_id=related_donation_id,
            related_comment_id=related_comment_id,
            action_url=action_url,
            action_text=action_text,
            metadata=metadata or {}
        )
        
        return notification
    
    @staticmethod
    def notify_donation_created(donation):
        """Notifica sobre nova doação criada"""
        
        # Notificar doador
        NotificationService.create_notification(
            recipient=donation.donor,
            title="Doação Criada com Sucesso",
            message=f"Sua doação de {donation.formatted_amount} foi criada e está sendo processada.",
            notification_type='donation_created',
            priority='normal',
            related_donation_id=donation.id,
            action_url=f"/dashboard/donations/{donation.id}",
            action_text="Ver Doação"
        )
        
        # Notificar administradores
        admin_users = User.objects.filter(is_staff=True)
        for admin in admin_users:
            NotificationService.create_notification(
                recipient=admin,
                title="Nova Doação Recebida",
                message=f"Nova doação de {donation.formatted_amount} de {donation.donor.get_full_name() or donation.donor.username}.",
                notification_type='donation_created',
                priority='high',
                related_donation_id=donation.id,
                action_url=f"/admin/donations/{donation.id}",
                action_text="Revisar Doação"
            )
    
    @staticmethod
    def notify_guest_donation_created(donation):
        """Notifica sobre nova doação criada por convidado"""
        
        # Notificar apenas administradores para doações de convidados
        admin_users = User.objects.filter(is_staff=True)
        for admin in admin_users:
            NotificationService.create_notification(
                recipient=admin,
                title="Nova Doação de Convidado",
                message=f"Doação de {donation.formatted_amount} recebida de convidado (ID: {donation.id}). Verificar dados pessoais nas notas administrativas.",
                notification_type='guest_donation_created',
                priority='high',
                related_donation_id=donation.id,
                action_url=f"/admin/donations/{donation.id}",
                action_text="Revisar Doação de Convidado"
            )
    
    @staticmethod
    def notify_donation_status_changed(donation, old_status, new_status, changed_by=None):
        """Notifica sobre mudança de status da doação"""
        
        status_messages = {
            'submitted': 'foi submetida para análise',
            'under_review': 'está em análise',
            'approved': 'foi aprovada',
            'rejected': 'foi rejeitada',
            'completed': 'foi completada'
        }
        
        status_message = status_messages.get(new_status, f'teve o status alterado para {new_status}')
        
        # Determinar prioridade baseada no status
        priority = 'high' if new_status in ['approved', 'rejected'] else 'normal'
        
        # Notificar doador
        NotificationService.create_notification(
            recipient=donation.donor,
            title="Status da Doação Atualizado",
            message=f"Sua doação de {donation.formatted_amount} {status_message}.",
            notification_type='donation_status_changed',
            priority=priority,
            related_donation_id=donation.id,
            action_url=f"/dashboard/donations/{donation.id}",
            action_text="Ver Detalhes",
            metadata={
                'old_status': old_status,
                'new_status': new_status,
                'changed_by': changed_by.username if changed_by else None
            }
        )
        
        # Se aprovada ou rejeitada, notificar com tipo específico
        if new_status == 'approved':
            NotificationService.create_notification(
                recipient=donation.donor,
                title="🎉 Doação Aprovada!",
                message=f"Parabéns! Sua doação de {donation.formatted_amount} foi aprovada. Obrigado pela sua generosidade!",
                notification_type='donation_approved',
                priority='high',
                related_donation_id=donation.id,
                action_url=f"/dashboard/donations/{donation.id}",
                action_text="Ver Certificado"
            )
        elif new_status == 'rejected':
            NotificationService.create_notification(
                recipient=donation.donor,
                title="Doação Necessita Revisão",
                message=f"Sua doação de {donation.formatted_amount} necessita de alguns ajustes. Verifique os comentários.",
                notification_type='donation_rejected',
                priority='high',
                related_donation_id=donation.id,
                action_url=f"/dashboard/donations/{donation.id}",
                action_text="Ver Motivo"
            )
    
    @staticmethod
    def notify_comment_added(comment):
        """Notifica sobre novo comentário na doação"""
        
        donation = comment.donation
        
        # Se o comentário foi feito por um admin
        if comment.author.is_staff:
            # Notificar o doador
            NotificationService.create_notification(
                recipient=donation.donor,
                title="Novo Comentário do Administrador",
                message=f"Há um novo comentário na sua doação de {donation.formatted_amount}.",
                notification_type='admin_comment',
                priority='normal',
                related_donation_id=donation.id,
                related_comment_id=comment.id,
                action_url=f"/dashboard/donations/{donation.id}#comments",
                action_text="Ver Comentário"
            )
        else:
            # Comentário do doador - notificar administradores
            admin_users = User.objects.filter(is_staff=True)
            for admin in admin_users:
                NotificationService.create_notification(
                    recipient=admin,
                    title="Novo Comentário do Doador",
                    message=f"{donation.donor.get_full_name() or donation.donor.username} comentou na doação de {donation.formatted_amount}.",
                    notification_type='donor_comment',
                    priority='normal',
                    related_donation_id=donation.id,
                    related_comment_id=comment.id,
                    action_url=f"/admin/donations/{donation.id}#comments",
                    action_text="Ver Comentário"
                )
    
    @staticmethod
    def notify_payment_verified(donation):
        """Notifica sobre verificação de pagamento"""
        
        NotificationService.create_notification(
            recipient=donation.donor,
            title="Pagamento Verificado",
            message=f"O pagamento da sua doação de {donation.formatted_amount} foi verificado com sucesso.",
            notification_type='payment_verified',
            priority='normal',
            related_donation_id=donation.id,
            action_url=f"/dashboard/donations/{donation.id}",
            action_text="Ver Doação"
        )
