# backend/donations/models.py
from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

class DonationMethod(models.Model):
    """Métodos de doação disponíveis"""
    name = models.CharField(max_length=100, verbose_name="Nome do Método")
    description = models.TextField(blank=True, verbose_name="Descrição")
    account_details = models.JSONField(default=dict, verbose_name="Detalhes da Conta")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Método de Doação"
        verbose_name_plural = "Métodos de Doação"
    
    def __str__(self):
        return self.name

class Donation(models.Model):
    """Doação realizada por um usuário"""
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('submitted', 'Enviada'),
        ('under_review', 'Em Análise'),
        ('approved', 'Aprovada'),
        ('rejected', 'Rejeitada'),
        ('completed', 'Concluída'),
    ]
    
    # Legacy choices - mantido para compatibilidade
    PAYMENT_METHOD_CHOICES = [
        ('bank_transfer', 'Transferência Bancária'),
        ('mpesa', 'M-Pesa'),
        ('emola', 'E-Mola'),
        ('cash', 'Dinheiro'),
        ('other', 'Outro'),
    ]
    
    # Informações básicas
    donor = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Doador")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Valor")
    currency = models.CharField(max_length=3, default='MZN', verbose_name="Moeda")
    
    # Método de pagamento - usando ForeignKey para DonationMethod
    donation_method = models.ForeignKey(
        DonationMethod, 
        on_delete=models.PROTECT, 
        verbose_name="Método de Doação",
        null=True,
        blank=True
    )
    # Campo legacy mantido para compatibilidade
    payment_method = models.CharField(
        max_length=20, 
        choices=PAYMENT_METHOD_CHOICES, 
        verbose_name="Método de Pagamento (Legacy)",
        blank=True,
        null=True
    )
    payment_reference = models.CharField(max_length=100, blank=True, verbose_name="Referência do Pagamento")
    payment_proof = models.FileField(upload_to='donations/proofs/', blank=True, null=True, verbose_name="Comprovante")
    
    # Status e aprovação
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="Status")
    submission_date = models.DateTimeField(auto_now_add=True, verbose_name="Data de Submissão")
    review_date = models.DateTimeField(blank=True, null=True, verbose_name="Data de Análise")
    approval_date = models.DateTimeField(blank=True, null=True, verbose_name="Data de Aprovação")
    
    # Admin que processou
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='reviewed_donations',
        verbose_name="Analisado por"
    )
    
    # Feedback e notas
    admin_notes = models.TextField(blank=True, verbose_name="Notas do Administrador")
    donor_message = models.TextField(blank=True, verbose_name="Mensagem do Doador")
    rejection_reason = models.TextField(blank=True, verbose_name="Motivo da Rejeição")
    
    # Destinação da doação
    purpose = models.CharField(max_length=200, blank=True, verbose_name="Finalidade")
    is_anonymous = models.BooleanField(default=False, verbose_name="Doação Anônima")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Doação"
        verbose_name_plural = "Doações"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.donor.username} - {self.amount} {self.currency} - {self.get_status_display()}"
    
    @property
    def formatted_amount(self):
        return f"{self.amount:,.2f} {self.currency}"

class DonationComment(models.Model):
    """Comentários e comunicação sobre doações"""
    donation = models.ForeignKey(Donation, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(verbose_name="Mensagem")
    is_internal = models.BooleanField(default=False, verbose_name="Nota Interna") # Apenas para admins
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comentário de {self.author.username} em {self.donation}"

class DonationStats(models.Model):
    """Estatísticas consolidadas de doações"""
    date = models.DateField(unique=True, verbose_name="Data")
    total_donations = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_donors = models.IntegerField(default=0)
    pending_count = models.IntegerField(default=0)
    approved_count = models.IntegerField(default=0)
    rejected_count = models.IntegerField(default=0)
    
    class Meta:
        verbose_name = "Estatística de Doação"
        verbose_name_plural = "Estatísticas de Doações"
        ordering = ['-date']
