# backend/client_area/models.py
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    USER_TYPES = [
        ('donor', 'Doador'),
        ('volunteer', 'Voluntário'),
        ('beneficiary', 'Beneficiário'),
        ('partner', 'Parceiro'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPES)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    
    # Preferências de notificação
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    
    # Configurações de privacidade
    profile_public = models.BooleanField(default=False)
    show_activity = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.get_full_name()} ({self.get_user_type_display()})"

    @property
    def full_name(self):
        return self.user.get_full_name() or self.user.username


class Cause(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#dc2626')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class Skill(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class UserSkill(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    level = models.CharField(max_length=20, choices=[
        ('beginner', 'Iniciante'),
        ('intermediate', 'Intermediário'),
        ('advanced', 'Avançado'),
        ('expert', 'Especialista'),
    ], default='intermediate')
    years_experience = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user_profile', 'skill']


class Notification(models.Model):
    TYPES = [
        ('info', 'Informação'),
        ('success', 'Sucesso'),
        ('warning', 'Aviso'),
        ('error', 'Erro'),
        ('matching', 'Matching'),
        ('donation', 'Doação'),
        ('volunteer', 'Voluntariado'),
    ]
    
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPES, default='info')
    is_read = models.BooleanField(default=False)
    action_url = models.URLField(blank=True)
    action_text = models.CharField(max_length=50, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user_profile.full_name}"


class MatchingRequest(models.Model):
    STATUS_CHOICES = [
        ('open', 'Aberto'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    requester = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='requests_made')
    volunteer = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='requests_accepted')
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    location = models.CharField(max_length=200)
    cause = models.ForeignKey(Cause, on_delete=models.CASCADE)
    required_skills = models.ManyToManyField(Skill, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    max_volunteers = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.title} - {self.requester.full_name}"


class DashboardStats(models.Model):
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='dashboard_stats')
    
    # Estatísticas gerais
    total_donations = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    volunteer_hours = models.PositiveIntegerField(default=0)
    help_requests_fulfilled = models.PositiveIntegerField(default=0)
    active_projects = models.PositiveIntegerField(default=0)
    
    # Metas mensais
    monthly_donation_goal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    monthly_volunteer_goal = models.PositiveIntegerField(default=0)
    
    # Estatísticas do mês atual
    current_month_donations = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    current_month_volunteer_hours = models.PositiveIntegerField(default=0)
    
    # Estatísticas específicas por tipo de usuário (JSON field)
    stats = models.JSONField(default=dict, blank=True)
    
    # Última atualização
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Stats - {self.user_profile.full_name}"
