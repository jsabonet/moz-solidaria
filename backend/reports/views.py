# backend/reports/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.core.cache import cache
import json
from io import BytesIO
import logging

from .models import Report, AnalyticsDashboard, MetricDefinition, ScheduledReport
from .serializers import (
    ReportSerializer, AnalyticsDashboardSerializer, DashboardDataSerializer,
    MetricDefinitionSerializer, ScheduledReportSerializer, 
    ReportGenerationRequestSerializer, ExecutiveDashboardSerializer,
    ImpactReportSerializer, FinancialReportSerializer
)
from .services import ReportDataService, ReportGenerationService

logger = logging.getLogger(__name__)

class ReportViewSet(viewsets.ModelViewSet):
    """ViewSet para gestão de relatórios"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Report.objects.all()
        
        # Filtros
        report_type = self.request.query_params.get('type', None)
        if report_type:
            queryset = queryset.filter(type=report_type)
            
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filtrar por usuário se não for admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(generated_by=self.request.user)
            
        return queryset.order_by('-generated_at')
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Endpoint para gerar novos relatórios"""
        serializer = ReportGenerationRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        try:
            # Criar registro do relatório
            report = Report.objects.create(
                title=data.get('title', f"Relatório {data['report_type'].title()}"),
                type=data['report_type'],
                filters=data.get('filters', {}),
                status='generating',
                generated_by=request.user
            )
            
            # Gerar o relatório
            report_service = ReportGenerationService()
            
            if data['report_type'] == 'impact':
                report_data = report_service.generate_impact_report(data.get('filters'))
                response_serializer = ImpactReportSerializer(report_data)
            elif data['report_type'] == 'executive':
                report_data = report_service.generate_executive_dashboard(data.get('filters'))
                response_serializer = ExecutiveDashboardSerializer(report_data)
            elif data['report_type'] == 'financial':
                report_data = report_service.generate_financial_report(data.get('filters'))
                response_serializer = FinancialReportSerializer(report_data)
            else:
                # Relatório genérico
                data_service = ReportDataService()
                report_data = data_service.get_project_overview_data(data.get('filters'))
                response_serializer = None
            
            # Salvar dados do relatório
            report.data = report_data
            report.status = 'completed'
            report.save()
            
            # Retornar dados processados
            if response_serializer:
                return Response({
                    'report_id': report.id,
                    'status': 'completed',
                    'data': response_serializer.data
                })
            else:
                return Response({
                    'report_id': report.id,
                    'status': 'completed',
                    'data': report_data
                })
                
        except Exception as e:
            logger.error(f"Erro ao gerar relatório: {str(e)}")
            
            # Atualizar status do relatório
            if 'report' in locals():
                report.status = 'failed'
                report.save()
            
            return Response(
                {'error': 'Erro interno ao gerar relatório'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def executive_dashboard(self, request):
        """Endpoint específico para dashboard executivo"""
        # Verificar cache
        cache_key = f"executive_dashboard_{request.user.id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return Response(cached_data)
        
        try:
            # Processar filtros da query string
            filters = {}
            if request.query_params.get('date_from'):
                filters['date_from'] = request.query_params.get('date_from')
            if request.query_params.get('date_to'):
                filters['date_to'] = request.query_params.get('date_to')
            if request.query_params.get('status'):
                filters['status'] = request.query_params.get('status')
            
            # Gerar dashboard
            report_service = ReportGenerationService()
            dashboard_data = report_service.generate_executive_dashboard(filters)
            
            # Serializar resposta
            serializer = ExecutiveDashboardSerializer(dashboard_data)
            response_data = serializer.data
            
            # Cache por 15 minutos
            cache.set(cache_key, response_data, 15 * 60)
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Erro ao gerar dashboard executivo: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar dashboard executivo'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def quick_stats(self, request):
        """Endpoint para estatísticas rápidas"""
        try:
            data_service = ReportDataService()
            overview = data_service.get_project_overview_data()
            
            quick_stats = [
                {
                    'label': 'Projetos Ativos',
                    'value': str(overview['summary']['active_projects']),
                    'trend': 'up',
                    'change': '+5%'
                },
                {
                    'label': 'Taxa de Conclusão',
                    'value': f"{overview['summary']['completion_rate']:.1f}%",
                    'trend': 'up',
                    'change': '+2.3%'
                },
                {
                    'label': 'Beneficiários',
                    'value': f"{overview['impact']['total_beneficiaries']:,}",
                    'trend': 'up',
                    'change': '+12%'
                },
                {
                    'label': 'Orçamento Utilizado',
                    'value': f"{overview['financial']['budget_utilization_percentage']:.1f}%",
                    'trend': 'stable',
                    'change': '+1.5%'
                }
            ]
            
            return Response(quick_stats)
            
        except Exception as e:
            logger.error(f"Erro ao gerar estatísticas rápidas: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar estatísticas'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnalyticsDashboardViewSet(viewsets.ModelViewSet):
    """ViewSet para dashboards de analytics"""
    queryset = AnalyticsDashboard.objects.all()
    serializer_class = AnalyticsDashboardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = AnalyticsDashboard.objects.all()
        
        # Filtrar por tipo
        dashboard_type = self.request.query_params.get('type', None)
        if dashboard_type:
            queryset = queryset.filter(type=dashboard_type)
        
        # Dashboards públicos + dashboards do usuário + dashboards permitidos
        if not self.request.user.is_staff:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(is_public=True) |
                Q(created_by=self.request.user) |
                Q(allowed_users=self.request.user)
            ).distinct()
            
        return queryset
    
    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        """Retorna dados processados do dashboard"""
        dashboard = self.get_object()
        
        try:
            # Verificar cache
            if dashboard.is_cache_valid():
                logger.info(f"Retornando dados em cache para dashboard {dashboard.id}")
                return Response({
                    'dashboard_id': dashboard.id,
                    'dashboard_name': dashboard.name,
                    'dashboard_type': dashboard.type,
                    'data': dashboard.cached_data,
                    'generated_at': timezone.now(),
                    'cache_expires_at': dashboard.cache_expires_at,
                    'is_cached': True
                })
            
            # Gerar novos dados
            logger.info(f"Gerando novos dados para dashboard {dashboard.id}")
            
            data_service = ReportDataService()
            
            if dashboard.type == 'executive':
                data = data_service.get_executive_summary()
            elif dashboard.type == 'projects':
                data = data_service.get_project_overview_data()
            elif dashboard.type == 'impact':
                data = data_service.get_project_overview_data()
                performance = data_service.get_project_performance_data()
                data['performance'] = performance
            else:
                data = data_service.get_project_overview_data()
            
            # Atualizar cache
            dashboard.update_cache(data, cache_duration_hours=1)
            
            return Response({
                'dashboard_id': dashboard.id,
                'dashboard_name': dashboard.name,
                'dashboard_type': dashboard.type,
                'data': data,
                'generated_at': timezone.now(),
                'cache_expires_at': dashboard.cache_expires_at,
                'is_cached': False
            })
            
        except Exception as e:
            logger.error(f"Erro ao gerar dados do dashboard {dashboard.id}: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar dados do dashboard'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def refresh_cache(self, request, pk=None):
        """Força atualização do cache do dashboard"""
        dashboard = self.get_object()
        
        try:
            data_service = ReportDataService()
            
            if dashboard.type == 'executive':
                data = data_service.get_executive_summary()
            else:
                data = data_service.get_project_overview_data()
            
            dashboard.update_cache(data, cache_duration_hours=1)
            
            return Response({
                'message': 'Cache atualizado com sucesso',
                'cache_expires_at': dashboard.cache_expires_at
            })
            
        except Exception as e:
            logger.error(f"Erro ao atualizar cache do dashboard {dashboard.id}: {str(e)}")
            return Response(
                {'error': 'Erro ao atualizar cache'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MetricDefinitionViewSet(viewsets.ModelViewSet):
    """ViewSet para definições de métricas"""
    queryset = MetricDefinition.objects.all()
    serializer_class = MetricDefinitionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MetricDefinition.objects.filter(is_active=True)
        
        metric_type = self.request.query_params.get('type', None)
        if metric_type:
            queryset = queryset.filter(type=metric_type)
            
        return queryset.order_by('display_name')

class ScheduledReportViewSet(viewsets.ModelViewSet):
    """ViewSet para relatórios agendados"""
    queryset = ScheduledReport.objects.all()
    serializer_class = ScheduledReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = ScheduledReport.objects.all()
        
        # Filtrar por usuário se não for admin
        if not self.request.user.is_staff:
            queryset = queryset.filter(created_by=self.request.user)
            
        return queryset.order_by('name')
    
    @action(detail=True, methods=['post'])
    def run_now(self, request, pk=None):
        """Executa relatório agendado imediatamente"""
        scheduled_report = self.get_object()
        
        try:
            # Gerar relatório
            report_service = ReportGenerationService()
            
            if scheduled_report.report_type == 'impact':
                report_data = report_service.generate_impact_report(scheduled_report.config)
            elif scheduled_report.report_type == 'executive':
                report_data = report_service.generate_executive_dashboard(scheduled_report.config)
            elif scheduled_report.report_type == 'financial':
                report_data = report_service.generate_financial_report(scheduled_report.config)
            else:
                data_service = ReportDataService()
                report_data = data_service.get_project_overview_data(scheduled_report.config)
            
            # Criar registro do relatório
            report = Report.objects.create(
                title=f"{scheduled_report.name} - {timezone.now().strftime('%Y-%m-%d %H:%M')}",
                type=scheduled_report.report_type,
                filters=scheduled_report.config,
                data=report_data,
                status='completed',
                generated_by=request.user
            )
            
            # Atualizar último run
            scheduled_report.last_run = timezone.now()
            scheduled_report.save()
            
            return Response({
                'message': 'Relatório executado com sucesso',
                'report_id': report.id
            })
            
        except Exception as e:
            logger.error(f"Erro ao executar relatório agendado {scheduled_report.id}: {str(e)}")
            return Response(
                {'error': 'Erro ao executar relatório'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AnalyticsAPIView(viewsets.ViewSet):
    """ViewSet para endpoints específicos de analytics"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def project_timeline(self, request):
        """Timeline de atividade dos projetos"""
        try:
            period = request.query_params.get('period', 'monthly')
            filters = {}
            
            if request.query_params.get('date_from'):
                filters['date_from'] = request.query_params.get('date_from')
            if request.query_params.get('date_to'):
                filters['date_to'] = request.query_params.get('date_to')
            
            data_service = ReportDataService()
            timeline_data = data_service.get_timeline_data(period, filters)
            
            return Response(timeline_data)
            
        except Exception as e:
            logger.error(f"Erro ao gerar timeline: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar timeline'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def project_performance(self, request):
        """Performance detalhada dos projetos"""
        try:
            filters = {}
            if request.query_params.get('status'):
                filters['status'] = request.query_params.get('status')
            
            data_service = ReportDataService()
            performance_data = data_service.get_project_performance_data(filters)
            
            return Response(performance_data)
            
        except Exception as e:
            logger.error(f"Erro ao gerar dados de performance: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar dados de performance'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
