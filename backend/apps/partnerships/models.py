# backend/apps/partnerships/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator


class PartnerMessage(models.Model):
    SENDER_CHOICES = [
        ('admin', 'Administrador'),
        ('partner', 'Parceiro'),
    ]
    
    content = models.TextField()
    sender_type = models.CharField(max_length=10, choices=SENDER_CHOICES)
    sender_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='partner_messages')
    partner_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='received_partner_messages',
        help_text="Usuário parceiro relacionado à conversa"
    )
    
    # Arquivo anexo opcional
    attachment = models.FileField(
        upload_to='partner_messages/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(
            allowed_extensions=['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'txt']
        )]
    )
    
    # Status de leitura
    read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['partner_user', 'created_at']),
            models.Index(fields=['read', 'sender_type']),
        ]
    
    def __str__(self):
        return f"{self.sender_type} -> {self.partner_user.username}: {self.content[:50]}"
    
    @property
    def attachment_url(self):
        return self.attachment.url if self.attachment else None


class PartnerProjectAssignment(models.Model):
    """Relaciona usuários parceiros a projetos específicos"""
    partner_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_projects')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='partner_assignments')
    role = models.CharField(
        max_length=50, 
        default='collaborator',
        choices=[
            ('lead', 'Líder'),
            ('collaborator', 'Colaborador'),
            ('consultant', 'Consultor'),
            ('sponsor', 'Patrocinador'),
        ]
    )
    assigned_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['partner_user', 'project']
    
    def __str__(self):
        return f"{self.partner_user.username} -> {self.project.name} ({self.role})"
