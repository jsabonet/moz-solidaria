# backend/project_tracking/models.py
from django.db import models
from django.contrib.auth.models import User
from core.models import Project
from django.utils import timezone

class ProjectMetrics(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='metrics')
    people_impacted = models.PositiveIntegerField(default=0)
    budget_used = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    budget_total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    progress_percentage = models.PositiveIntegerField(default=0)
    completed_milestones = models.PositiveIntegerField(default=0)
    total_milestones = models.PositiveIntegerField(default=0)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Métrica do Projeto"
        verbose_name_plural = "Métricas dos Projetos"
    
    def __str__(self):
        return f"Métricas - {self.project.name}"

class ProjectUpdate(models.Model):
    UPDATE_TYPES = [
        ('milestone', 'Marco/Objetivo'),
        ('progress', 'Progresso'),
        ('issue', 'Problema'),
        ('achievement', 'Conquista'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('published', 'Publicado'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tracking_updates')
    title = models.CharField(max_length=200)
    description = models.TextField()
    type = models.CharField(max_length=20, choices=UPDATE_TYPES, default='progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Métricas específicas desta atualização
    people_impacted = models.PositiveIntegerField(null=True, blank=True)
    budget_spent = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    progress_percentage = models.PositiveIntegerField(null=True, blank=True)
    
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_tracking_updates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Atualização do Projeto"
        verbose_name_plural = "Atualizações dos Projetos"
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"

class ProjectMilestone(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendente'),
        ('in-progress', 'Em Progresso'),
        ('completed', 'Concluído'),
        ('delayed', 'Atrasado'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tracking_milestones')
    title = models.CharField(max_length=200)
    description = models.TextField()
    target_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.PositiveIntegerField(default=0)
    order = models.PositiveIntegerField(default=0)
    
    dependencies = models.ManyToManyField('self', blank=True, symmetrical=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'target_date']
        verbose_name = "Marco do Projeto"
        verbose_name_plural = "Marcos dos Projetos"
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"

class ProjectEvidence(models.Model):
    EVIDENCE_TYPES = [
        ('image', 'Imagem'),
        ('photo', 'Foto'),
        ('video', 'Vídeo'),
        ('document', 'Documento'),
        ('report', 'Relatório'),
        ('certificate', 'Certificado'),
        ('other', 'Outro'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tracking_evidence')
    update = models.ForeignKey(ProjectUpdate, on_delete=models.CASCADE, null=True, blank=True, related_name='evidence')
    
    type = models.CharField(max_length=20, choices=EVIDENCE_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    file = models.FileField(upload_to='project_evidence/%Y/%m/')
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list, blank=True)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-upload_date']
        verbose_name = "Evidência do Projeto"
        verbose_name_plural = "Evidências dos Projetos"
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"

class ProjectGalleryImage(models.Model):
    CATEGORY_CHOICES = [
        ('before', 'Antes'),
        ('progress', 'Progresso'),
        ('after', 'Depois'),
        ('team', 'Equipe'),
        ('community', 'Comunidade'),
        ('infrastructure', 'Infraestrutura'),
        ('events', 'Eventos'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tracking_gallery_images')
    image = models.ImageField(upload_to='project_gallery/%Y/%m/')
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    tags = models.JSONField(default=list, blank=True)
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    upload_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', '-upload_date']
        verbose_name = "Imagem da Galeria"
        verbose_name_plural = "Imagens da Galeria"
    
    def __str__(self):
        return f"{self.project.name} - {self.title}"

class ProjectMetricsEntry(models.Model):
    CATEGORY_CHOICES = [
        ('planning', 'Planejamento'),
        ('execution', 'Execução'),
        ('monitoring', 'Monitoramento'),
        ('completion', 'Finalização'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tracking_metrics_entries')
    date = models.DateField()
    people_impacted = models.PositiveIntegerField(default=0)
    budget_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    progress_percentage = models.PositiveIntegerField(default=0)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    verified = models.BooleanField(default=False)
    
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date']
        verbose_name = "Registro de Métrica"
        verbose_name_plural = "Registros de Métricas"
    
    def __str__(self):
        return f"{self.project.name} - {self.date}"
