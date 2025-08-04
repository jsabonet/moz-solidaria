from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Notification(models.Model):
    """Sistema de notificações para doadores e administradores"""
    
    TYPE_CHOICES = [
        ('donation_created', 'Doação Criada'),
        ('donation_status_changed', 'Status da Doação Alterado'),
        ('donation_comment_added', 'Novo Comentário na Doação'),
        ('donation_approved', 'Doação Aprovada'),
        ('donation_rejected', 'Doação Rejeitada'),
        ('payment_verified', 'Pagamento Verificado'),
        ('admin_comment', 'Comentário do Administrador'),
        ('donor_comment', 'Comentário do Doador'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('normal', 'Normal'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    recipient = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='notifications',
        verbose_name="Destinatário"
    )
    title = models.CharField(max_length=200, verbose_name="Título")
    message = models.TextField(verbose_name="Mensagem")
    notification_type = models.CharField(
        max_length=30, 
        choices=TYPE_CHOICES,
        verbose_name="Tipo de Notificação"
    )
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='normal',
        verbose_name="Prioridade"
    )
    
    # Metadados opcionais
    related_donation_id = models.IntegerField(null=True, blank=True, verbose_name="ID da Doação")
    related_comment_id = models.IntegerField(null=True, blank=True, verbose_name="ID do Comentário")
    metadata = models.JSONField(default=dict, blank=True, verbose_name="Metadados")
    
    # Estados
    is_read = models.BooleanField(default=False, verbose_name="Lida")
    is_sent = models.BooleanField(default=False, verbose_name="Enviada")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Enviada em")
    read_at = models.DateTimeField(null=True, blank=True, verbose_name="Lida em")
    
    # URLs de ação
    action_url = models.URLField(blank=True, verbose_name="URL de Ação")
    action_text = models.CharField(max_length=100, blank=True, verbose_name="Texto da Ação")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criada em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizada em")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Notificação"
        verbose_name_plural = "Notificações"
        indexes = [
            models.Index(fields=['recipient', '-created_at']),
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"
    
    def mark_as_read(self):
        """Marca a notificação como lida"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()
    
    def mark_as_sent(self):
        """Marca a notificação como enviada"""
        if not self.is_sent:
            self.is_sent = True
            self.sent_at = timezone.now()
            self.save()


class NotificationPreference(models.Model):
    """Preferências de notificação do usuário"""
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='notification_preferences'
    )
    
    # Preferências de doação
    notify_donation_status_change = models.BooleanField(default=True, verbose_name="Mudanças de Status")
    notify_donation_comments = models.BooleanField(default=True, verbose_name="Novos Comentários")
    notify_payment_verification = models.BooleanField(default=True, verbose_name="Verificação de Pagamento")
    
    # Preferências de administrador
    notify_new_donations = models.BooleanField(default=True, verbose_name="Novas Doações")
    notify_donor_comments = models.BooleanField(default=True, verbose_name="Comentários de Doadores")
    
    # Configurações de entrega
    email_notifications = models.BooleanField(default=True, verbose_name="Notificações por Email")
    in_app_notifications = models.BooleanField(default=True, verbose_name="Notificações no App")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Preferência de Notificação"
        verbose_name_plural = "Preferências de Notificação"
    
    def __str__(self):
        return f"Preferências de {self.user.username}"
