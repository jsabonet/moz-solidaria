# backend/reports/serializers.py
from rest_framework import serializers
from .models import Report, AnalyticsDashboard, MetricDefinition, ScheduledReport

class ReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = ['generated_by', 'generated_at', 'version']
    
    def get_file_url(self, obj):
        if obj.file:
            return self.context['request'].build_absolute_uri(obj.file.url)
        return None
    
    def create(self, validated_data):
        validated_data['generated_by'] = self.context['request'].user
        return super().create(validated_data)

class AnalyticsDashboardSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    is_cache_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = AnalyticsDashboard
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class DashboardDataSerializer(serializers.Serializer):
    """Serializer para dados processados do dashboard"""
    dashboard_id = serializers.IntegerField()
    dashboard_name = serializers.CharField()
    dashboard_type = serializers.CharField()
    
    # Dados principais
    data = serializers.JSONField()
    
    # Metadados
    generated_at = serializers.DateTimeField()
    cache_expires_at = serializers.DateTimeField(required=False, allow_null=True)
    is_cached = serializers.BooleanField()
    
    # Filtros aplicados
    filters_applied = serializers.JSONField(required=False)

class MetricDefinitionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    aggregation_display = serializers.CharField(source='get_aggregation_display', read_only=True)
    
    class Meta:
        model = MetricDefinition
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ScheduledReportSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    frequency_display = serializers.CharField(source='get_frequency_display', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    recipients_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduledReport
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'last_run']
    
    def get_recipients_count(self, obj):
        return obj.recipients.count()
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ReportGenerationRequestSerializer(serializers.Serializer):
    """Serializer para solicitação de geração de relatório"""
    report_type = serializers.ChoiceField(choices=Report.REPORT_TYPES)
    title = serializers.CharField(max_length=200, required=False)
    filters = serializers.JSONField(required=False, default=dict)
    
    # Opções de formato
    format = serializers.ChoiceField(
        choices=[('json', 'JSON'), ('pdf', 'PDF'), ('excel', 'Excel')],
        default='json'
    )
    
    # Opções de entrega
    email_recipients = serializers.ListField(
        child=serializers.EmailField(),
        required=False,
        allow_empty=True
    )
    
    def validate_filters(self, value):
        """Valida os filtros fornecidos"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Filtros devem ser um objeto JSON válido")
        
        # Validações específicas para filtros de data
        if 'date_from' in value and 'date_to' in value:
            try:
                from datetime import datetime
                date_from = datetime.fromisoformat(value['date_from'].replace('Z', '+00:00'))
                date_to = datetime.fromisoformat(value['date_to'].replace('Z', '+00:00'))
                
                if date_from > date_to:
                    raise serializers.ValidationError("Data inicial deve ser anterior à data final")
            except ValueError:
                raise serializers.ValidationError("Formato de data inválido. Use ISO 8601")
        
        return value

class ExecutiveDashboardSerializer(serializers.Serializer):
    """Serializer específico para dashboard executivo"""
    
    # KPIs principais
    total_projects = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    total_budget = serializers.DecimalField(max_digits=12, decimal_places=2)
    budget_utilization = serializers.FloatField()
    total_beneficiaries = serializers.IntegerField()
    average_success_rate = serializers.FloatField()
    milestone_completion = serializers.FloatField()
    
    # Alertas e recomendações
    alerts = serializers.ListField()
    recommendations = serializers.ListField()
    trends = serializers.JSONField()
    
    # Top performers
    top_performers = serializers.ListField()
    
    # Timeline
    timeline_data = serializers.JSONField()
    
    # Metadados
    generated_at = serializers.DateTimeField()
    period_description = serializers.CharField()

class ProjectPerformanceSerializer(serializers.Serializer):
    """Serializer para dados de performance de projetos"""
    id = serializers.IntegerField()
    name = serializers.CharField()
    slug = serializers.CharField()
    status = serializers.CharField()
    budget_utilization = serializers.FloatField()
    milestone_completion = serializers.FloatField()
    beneficiaries_reached = serializers.IntegerField()
    success_rate = serializers.FloatField()
    last_updated = serializers.DateTimeField(allow_null=True)

class ImpactReportSerializer(serializers.Serializer):
    """Serializer para relatório de impacto"""
    title = serializers.CharField()
    type = serializers.CharField()
    generated_at = serializers.DateTimeField()
    period = serializers.CharField()
    
    # Dados principais
    summary = serializers.JSONField()
    project_performance = serializers.JSONField()
    timeline = serializers.JSONField()
    impact_highlights = serializers.ListField()

class FinancialReportSerializer(serializers.Serializer):
    """Serializer para relatório financeiro"""
    title = serializers.CharField()
    type = serializers.CharField()
    generated_at = serializers.DateTimeField()
    period = serializers.CharField()
    
    # Dados financeiros
    summary = serializers.JSONField()
    breakdown = serializers.JSONField()
    analysis = serializers.JSONField()
    recommendations = serializers.ListField()

class QuickStatsSerializer(serializers.Serializer):
    """Serializer para estatísticas rápidas"""
    label = serializers.CharField()
    value = serializers.CharField()  # Pode ser número ou texto formatado
    change = serializers.CharField(required=False, allow_null=True)
    trend = serializers.ChoiceField(
        choices=[('up', 'Crescimento'), ('down', 'Queda'), ('stable', 'Estável')],
        required=False,
        allow_null=True
    )

class ActionItemSerializer(serializers.Serializer):
    """Serializer para itens de ação"""
    priority = serializers.ChoiceField(
        choices=[('high', 'Alta'), ('medium', 'Média'), ('low', 'Baixa'), ('info', 'Informação')]
    )
    title = serializers.CharField()
    action = serializers.CharField()
    status = serializers.ChoiceField(
        choices=[('pending', 'Pendente'), ('in_progress', 'Em andamento'), ('completed', 'Completo')],
        default='pending'
    )
    assigned_to = serializers.CharField(required=False, allow_null=True)
    due_date = serializers.DateTimeField(required=False, allow_null=True)
