# backend/reports/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import json

class Report(models.Model):
    REPORT_TYPES = [
        ('impact', 'Relatório de Impacto'),
        ('financial', 'Relatório Financeiro'),
        ('progress', 'Relatório de Progresso'),
        ('executive', 'Dashboard Executivo'),
        ('quarterly', 'Relatório Trimestral'),
        ('annual', 'Relatório Anual'),
        ('custom', 'Relatório Personalizado'),
    ]
    
    STATUSES = [
        ('generating', 'Gerando'),
        ('completed', 'Completo'),
        ('failed', 'Falhou'),
        ('scheduled', 'Agendado'),
    ]
    
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=REPORT_TYPES)
    status = models.CharField(max_length=20, choices=STATUSES, default='generating')
    
    # Filtros aplicados
    filters = models.JSONField(default=dict, help_text="Filtros aplicados na geração do relatório")
    
    # Dados do relatório
    data = models.JSONField(default=dict, help_text="Dados processados do relatório")
    
    # Arquivo gerado (PDF, Excel, etc.)
    file = models.FileField(upload_to='reports/', null=True, blank=True)
    
    # Metadados
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    generated_at = models.DateTimeField(default=timezone.now)
    
    # Agendamento
    scheduled_for = models.DateTimeField(null=True, blank=True)
    recurring = models.BooleanField(default=False)
    recurring_frequency = models.CharField(
        max_length=20, 
        choices=[
            ('daily', 'Diário'),
            ('weekly', 'Semanal'),
            ('monthly', 'Mensal'),
            ('quarterly', 'Trimestral'),
        ],
        null=True, blank=True
    )
    
    # Controle de versão
    version = models.PositiveIntegerField(default=1)
    is_latest = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-generated_at']
        verbose_name = 'Relatório'
        verbose_name_plural = 'Relatórios'
    
    def __str__(self):
        return f"{self.title} - {self.get_type_display()}"

class AnalyticsDashboard(models.Model):
    DASHBOARD_TYPES = [
        ('executive', 'Dashboard Executivo'),
        ('projects', 'Dashboard de Projetos'),
        ('donations', 'Dashboard de Doações'),
        ('users', 'Dashboard de Usuários'),
        ('financial', 'Dashboard Financeiro'),
        ('impact', 'Dashboard de Impacto'),
    ]
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=DASHBOARD_TYPES)
    description = models.TextField(blank=True)
    
    # Configuração do dashboard
    config = models.JSONField(default=dict, help_text="Configuração dos widgets e layout")
    
    # Dados em cache
    cached_data = models.JSONField(default=dict, help_text="Dados em cache para performance")
    cache_expires_at = models.DateTimeField(null=True, blank=True)
    
    # Controle de acesso
    is_public = models.BooleanField(default=False)
    allowed_users = models.ManyToManyField(User, blank=True, related_name='accessible_dashboards')
    
    # Metadados
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_dashboards')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Dashboard Analytics'
        verbose_name_plural = 'Dashboards Analytics'
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    def is_cache_valid(self):
        if not self.cache_expires_at:
            return False
        return timezone.now() < self.cache_expires_at
    
    def update_cache(self, data, cache_duration_hours=1):
        self.cached_data = data
        self.cache_expires_at = timezone.now() + timezone.timedelta(hours=cache_duration_hours)
        self.save()

class MetricDefinition(models.Model):
    METRIC_TYPES = [
        ('count', 'Contador'),
        ('sum', 'Soma'),
        ('average', 'Média'),
        ('percentage', 'Percentual'),
        ('ratio', 'Razão'),
        ('currency', 'Moeda'),
        ('custom', 'Personalizada'),
    ]
    
    AGGREGATION_TYPES = [
        ('sum', 'Soma'),
        ('avg', 'Média'),
        ('count', 'Contagem'),
        ('max', 'Máximo'),
        ('min', 'Mínimo'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # Tipo e configuração da métrica
    type = models.CharField(max_length=20, choices=METRIC_TYPES)
    aggregation = models.CharField(max_length=20, choices=AGGREGATION_TYPES, default='sum')
    
    # Configuração da consulta
    query_config = models.JSONField(default=dict, help_text="Configuração da consulta SQL/ORM")
    
    # Formatação
    unit = models.CharField(max_length=20, blank=True, help_text="Unidade de medida (€, %, pessoas, etc.)")
    decimal_places = models.PositiveIntegerField(default=0)
    
    # Metadados
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_name']
        verbose_name = 'Definição de Métrica'
        verbose_name_plural = 'Definições de Métricas'
    
    def __str__(self):
        return self.display_name

class ScheduledReport(models.Model):
    FREQUENCIES = [
        ('daily', 'Diário'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensal'),
        ('quarterly', 'Trimestral'),
        ('annually', 'Anual'),
    ]
    
    name = models.CharField(max_length=100)
    report_type = models.CharField(max_length=20, choices=Report.REPORT_TYPES)
    frequency = models.CharField(max_length=20, choices=FREQUENCIES)
    
    # Configuração do agendamento
    config = models.JSONField(default=dict, help_text="Configuração e filtros do relatório")
    
    # Destinatários
    recipients = models.ManyToManyField(User, related_name='scheduled_reports')
    email_recipients = models.TextField(blank=True, help_text="Emails adicionais separados por vírgula")
    
    # Controle
    is_active = models.BooleanField(default=True)
    next_run = models.DateTimeField()
    last_run = models.DateTimeField(null=True, blank=True)
    
    # Metadados
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_scheduled_reports')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = 'Relatório Agendado'
        verbose_name_plural = 'Relatórios Agendados'
    
    def __str__(self):
        return f"{self.name} ({self.get_frequency_display()})"
