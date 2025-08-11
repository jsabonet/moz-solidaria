# backend/volunteers/models.py
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class VolunteerSkill(models.Model):
    """Habilidades que um voluntário pode ter"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, choices=[
        ('technical', 'Técnica'),
        ('healthcare', 'Saúde'),
        ('education', 'Educação'),
        ('construction', 'Construção'),
        ('administrative', 'Administrativa'),
        ('social', 'Social'),
        ('other', 'Outra')
    ], default='other')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Habilidade de Voluntário"
        verbose_name_plural = "Habilidades de Voluntários"


class VolunteerOpportunity(models.Model):
    """Oportunidades de voluntariado criadas pelo administrador"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    required_skills = models.ManyToManyField(VolunteerSkill, blank=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    is_remote = models.BooleanField(default=False)
    estimated_hours = models.PositiveIntegerField(help_text="Horas estimadas para completar")
    people_helped_estimate = models.PositiveIntegerField(
        default=1, 
        help_text="Número estimado de pessoas que serão ajudadas"
    )
    urgency_level = models.CharField(max_length=20, choices=[
        ('low', 'Baixa'),
        ('medium', 'Média'),
        ('high', 'Alta'),
        ('critical', 'Crítica')
    ], default='medium')
    status = models.CharField(max_length=20, choices=[
        ('open', 'Aberta'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluída'),
        ('cancelled', 'Cancelada')
    ], default='open')
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_opportunities')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Oportunidade de Voluntariado"
        verbose_name_plural = "Oportunidades de Voluntariado"
        ordering = ['-created_at']


class VolunteerProfile(models.Model):
    """Perfil estendido do voluntário"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='volunteer_profile')
    skills = models.ManyToManyField(VolunteerSkill, blank=True)
    bio = models.TextField(blank=True, help_text="Descrição sobre o voluntário")
    availability = models.CharField(max_length=50, choices=[
        ('weekdays', 'Dias da semana'),
        ('weekends', 'Fins de semana'),
        ('evenings', 'Noites'),
        ('flexible', 'Flexível')
    ], default='flexible')
    max_hours_per_week = models.PositiveIntegerField(default=10)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Perfil de {self.user.get_full_name() or self.user.username}"
    
    @property
    def total_hours_contributed(self):
        """Total de horas contribuídas pelo voluntário"""
        return sum(
            participation.actual_hours or participation.opportunity.estimated_hours 
            for participation in self.participations.filter(status='completed')
        )
    
    @property
    def total_people_helped(self):
        """Total de pessoas ajudadas pelo voluntário"""
        return sum(
            participation.people_helped or participation.opportunity.people_helped_estimate
            for participation in self.participations.filter(status='completed')
        )
    
    @property
    def volunteer_level(self):
        """Nível do voluntário baseado nas horas contribuídas"""
        hours = self.total_hours_contributed
        if hours >= 500:
            return "Especialista"
        elif hours >= 200:
            return "Avançado"
        elif hours >= 50:
            return "Intermediário"
        elif hours >= 10:
            return "Iniciante"
        else:
            return "Novato"
    
    @property
    def hours_to_next_level(self):
        """Horas necessárias para o próximo nível"""
        hours = self.total_hours_contributed
        if hours < 10:
            return 10 - hours
        elif hours < 50:
            return 50 - hours
        elif hours < 200:
            return 200 - hours
        elif hours < 500:
            return 500 - hours
        else:
            return 0
    
    @property
    def average_rating(self):
        """Avaliação média do voluntário"""
        ratings = self.participations.filter(
            status='completed',
            admin_rating__isnull=False
        ).values_list('admin_rating', flat=True)
        return sum(ratings) / len(ratings) if ratings else 0
    
    class Meta:
        verbose_name = "Perfil de Voluntário"
        verbose_name_plural = "Perfis de Voluntários"


class VolunteerParticipation(models.Model):
    """Participação de um voluntário em uma oportunidade"""
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE, related_name='participations')
    opportunity = models.ForeignKey(VolunteerOpportunity, on_delete=models.CASCADE, related_name='participations')
    status = models.CharField(max_length=20, choices=[
        ('applied', 'Candidatou-se'),
        ('accepted', 'Aceito'),
        ('in_progress', 'Em Andamento'),
        ('completed', 'Concluído'),
        ('cancelled', 'Cancelado'),
        ('rejected', 'Rejeitado')
    ], default='applied')
    application_message = models.TextField(blank=True, help_text="Mensagem do voluntário ao se candidatar")
    actual_hours = models.PositiveIntegerField(null=True, blank=True, help_text="Horas reais trabalhadas")
    people_helped = models.PositiveIntegerField(null=True, blank=True, help_text="Pessoas realmente ajudadas")
    admin_notes = models.TextField(blank=True, help_text="Notas do administrador")
    admin_rating = models.PositiveIntegerField(
        null=True, blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text="Avaliação do administrador (1-5)"
    )
    volunteer_feedback = models.TextField(blank=True, help_text="Feedback do voluntário")
    start_date = models.DateTimeField(null=True, blank=True)
    completion_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.volunteer.user.get_full_name()} - {self.opportunity.title}"
    
    def complete_participation(self, hours=None, people_helped=None, admin_notes="", rating=None):
        """Marca a participação como concluída"""
        self.status = 'completed'
        self.completion_date = timezone.now()
        if hours:
            self.actual_hours = hours
        if people_helped:
            self.people_helped = people_helped
        if admin_notes:
            self.admin_notes = admin_notes
        if rating:
            self.admin_rating = rating
        self.save()
    
    class Meta:
        verbose_name = "Participação em Voluntariado"
        verbose_name_plural = "Participações em Voluntariado"
        unique_together = ['volunteer', 'opportunity']
        ordering = ['-created_at']


class VolunteerAchievement(models.Model):
    """Conquistas do voluntário"""
    volunteer = models.ForeignKey(VolunteerProfile, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='award')
    earned_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.volunteer.user.get_full_name()} - {self.title}"
    
    class Meta:
        verbose_name = "Conquista de Voluntário"
        verbose_name_plural = "Conquistas de Voluntários"
        ordering = ['-earned_date']
