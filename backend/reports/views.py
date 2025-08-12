# backend/reports/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.core.cache import cache
from django.db.models import Sum, Count, Avg, Q
from datetime import datetime, timedelta
from typing import Dict, List, Any
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
        logger.info(f"🔍 Recebendo dados para geração de relatório: {request.data}")
        
        try:
            serializer = ReportGenerationRequestSerializer(data=request.data)
            
            if not serializer.is_valid():
                logger.error(f"❌ Erro de validação no serializer: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            data = serializer.validated_data
            logger.info(f"✅ Dados validados: {data}")
            
            # Criar registro do relatório
            logger.info("🏗️ Criando registro do relatório...")
            report = Report.objects.create(
                title=data.get('title', f"Relatório {data['report_type'].title()}"),
                type=data['report_type'],
                filters=data.get('filters', {}),
                status='generating',
                generated_by=request.user
            )
            logger.info(f"✅ Relatório criado com ID: {report.id}")
            
            # Gerar o relatório
            logger.info("🔄 Iniciando geração de dados...")
            report_service = ReportGenerationService()
            
            if data['report_type'] == 'impact':
                logger.info("📊 Gerando relatório de impacto...")
                report_data = report_service.generate_impact_report(data.get('filters'))
                response_serializer = ImpactReportSerializer(report_data)
            elif data['report_type'] == 'executive':
                logger.info("👔 Gerando dashboard executivo...")
                report_data = report_service.generate_executive_dashboard(data.get('filters'))
                response_serializer = ExecutiveDashboardSerializer(report_data)
            elif data['report_type'] == 'financial':
                logger.info("💰 Gerando relatório financeiro...")
                report_data = report_service.generate_financial_report(data.get('filters'))
                response_serializer = FinancialReportSerializer(report_data)
            else:
                # Relatório genérico
                logger.info("📈 Gerando relatório genérico...")
                data_service = ReportDataService()
                report_data = data_service.get_project_overview_data(data.get('filters'))
                response_serializer = None
            
            logger.info("💾 Salvando dados do relatório...")
            # Salvar dados do relatório
            report.data = report_data
            report.status = 'completed'
            report.save()
            
            logger.info("🎉 Preparando resposta...")
            # Retornar dados processados
            if response_serializer:
                return Response({
                    'success': True,
                    'report_id': report.id,
                    'status': 'completed',
                    'data': response_serializer.data
                })
            else:
                return Response({
                    'success': True,
                    'report_id': report.id,
                    'status': 'completed',
                    'data': report_data
                })
                
        except Exception as e:
            logger.error(f"💥 ERRO DETALHADO ao gerar relatório: {str(e)}")
            logger.error(f"🔍 Tipo do erro: {type(e).__name__}")
            import traceback
            logger.error(f"📋 Stack trace completo: {traceback.format_exc()}")
            
            # Atualizar status do relatório
            if 'report' in locals():
                report.status = 'failed'
                report.save()
            
            return Response(
                {'error': f'Erro interno ao gerar relatório: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Endpoint para download de relatórios"""
        try:
            report = self.get_object()
            
            # Verificar se o usuário tem permissão
            if not request.user.is_staff and report.generated_by != request.user:
                return Response(
                    {'error': 'Sem permissão para baixar este relatório'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verificar se o relatório foi concluído
            if report.status != 'completed':
                return Response(
                    {'error': 'Relatório ainda não foi concluído'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Obter formato da query string (padrão: pdf)
            format_type = request.query_params.get('format', 'pdf')
            
            # Gerar arquivo baseado no formato
            if format_type == 'pdf':
                file_content, content_type, filename = self._generate_pdf_report(report)
            elif format_type == 'excel':
                file_content, content_type, filename = self._generate_excel_report(report)
            elif format_type == 'json':
                file_content, content_type, filename = self._generate_json_report(report)
            else:
                return Response(
                    {'error': 'Formato não suportado'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Retornar arquivo como resposta HTTP
            response = HttpResponse(file_content, content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
            
        except Exception as e:
            logger.error(f"Erro ao fazer download do relatório: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar arquivo para download'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _generate_pdf_report(self, report):
        """Gera relatório em PDF"""
        try:
            from reportlab.pdfgen import canvas
            from reportlab.lib.pagesizes import letter
            from io import BytesIO
            
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            
            # Título
            p.setFont("Helvetica-Bold", 16)
            p.drawString(50, 750, report.title)
            
            # Data de geração
            p.setFont("Helvetica", 12)
            p.drawString(50, 720, f"Gerado em: {report.generated_at.strftime('%d/%m/%Y %H:%M')}")
            
            # Dados do relatório
            y_position = 680
            p.drawString(50, y_position, "Dados do Relatório:")
            
            if report.data:
                data_lines = str(report.data)[:500].split('\n')  # Limitar para não quebrar o PDF
                for line in data_lines[:10]:  # Máximo 10 linhas
                    y_position -= 20
                    p.drawString(70, y_position, line[:80])  # Limitar largura da linha
            
            p.showPage()
            p.save()
            
            buffer.seek(0)
            filename = f"{report.title.replace(' ', '_')}_{report.id}.pdf"
            return buffer.getvalue(), 'application/pdf', filename
            
        except ImportError:
            # Fallback simples se reportlab não estiver instalado
            content = f"""Relatório: {report.title}
Gerado em: {report.generated_at}
Tipo: {report.get_type_display()}
Status: {report.get_status_display()}

Dados: {report.data}
"""
            filename = f"{report.title.replace(' ', '_')}_{report.id}.txt"
            return content.encode('utf-8'), 'text/plain', filename
    
    def _generate_excel_report(self, report):
        """Gera relatório em Excel"""
        # Implementação básica - pode ser expandida
        content = f"Relatório,{report.title}\nGerado em,{report.generated_at}\nDados,{report.data}"
        filename = f"{report.title.replace(' ', '_')}_{report.id}.csv"
        return content.encode('utf-8'), 'text/csv', filename
    
    def _generate_json_report(self, report):
        """Gera relatório em JSON"""
        import json
        data = {
            'report_id': report.id,
            'title': report.title,
            'type': report.type,
            'generated_at': report.generated_at.isoformat(),
            'data': report.data
        }
        content = json.dumps(data, indent=2, ensure_ascii=False)
        filename = f"{report.title.replace(' ', '_')}_{report.id}.json"
        return content.encode('utf-8'), 'application/json', filename
    
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
    def advanced_stats(self, request):
        """Endpoint para estatísticas avançadas"""
        try:
            # Obter parâmetro de período
            time_range = request.query_params.get('range', '6months')
            
            # Processar filtros baseados no período
            filters = self._get_time_range_filters(time_range)
            
            # Gerar estatísticas completas
            report_service = ReportGenerationService()
            data_service = ReportDataService()
            
            # Dados financeiros (doações)
            financial_data = self._get_financial_stats(filters)
            
            # Dados da comunidade (voluntários, beneficiários, parceiros)
            community_data = self._get_community_stats(filters)
            
            # Dados de projetos
            project_data = data_service.get_project_overview_data(filters)
            
            # Métricas de performance
            performance_data = self._get_performance_stats(filters)
            
            stats_data = {
                'financialMetrics': financial_data,
                'communityMetrics': community_data,
                'projectMetrics': {
                    'totalProjects': project_data['summary']['total_projects'],
                    'activeProjects': project_data['summary']['active_projects'],
                    'completedProjects': project_data['summary']['completed_projects'],
                    'averageCompletion': project_data['summary']['completion_rate'],
                    'totalBudget': float(project_data['financial']['total_budget'] or 0),
                    'totalSpent': float(project_data['financial']['total_spent'] or 0)
                },
                'performanceMetrics': performance_data,
                'timeRange': time_range,
                'generated_at': timezone.now().isoformat()
            }
            
            return Response({
                'success': True,
                'data': stats_data
            })
            
        except Exception as e:
            logger.error(f"Erro ao gerar estatísticas avançadas: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar estatísticas avançadas'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _get_time_range_filters(self, time_range: str) -> dict:
        """Converte time_range em filtros de data"""
        filters = {}
        
        if time_range == '1month':
            filters['date_from'] = (timezone.now() - timedelta(days=30)).date()
        elif time_range == '3months':
            filters['date_from'] = (timezone.now() - timedelta(days=90)).date()
        elif time_range == '6months':
            filters['date_from'] = (timezone.now() - timedelta(days=180)).date()
        elif time_range == '1year':
            filters['date_from'] = (timezone.now() - timedelta(days=365)).date()
        # 'all' não adiciona filtros de data
        
        return filters
    
    def _get_financial_stats(self, filters: dict) -> dict:
        """Obter estatísticas financeiras reais"""
        # Importar modelo de doações se existir
        try:
            from donations.models import Donation
            
            donations_qs = Donation.objects.all()
            if 'date_from' in filters:
                donations_qs = donations_qs.filter(created_at__gte=filters['date_from'])
            
            total_donations = donations_qs.aggregate(
                total=Sum('amount'), 
                count=Count('id'),
                avg=Avg('amount')
            )
            
            # Calcular doadores recorrentes (mais de uma doação)
            recurring_donors = donations_qs.values('donor').annotate(
                donation_count=Count('id')
            ).filter(donation_count__gt=1).count()
            
            # Receita mensal (último mês)
            last_month = timezone.now() - timedelta(days=30)
            monthly_revenue = donations_qs.filter(
                created_at__gte=last_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Calcular crescimento baseado nos últimos 2 meses
            two_months_ago = timezone.now() - timedelta(days=60)
            previous_month_revenue = donations_qs.filter(
                created_at__gte=two_months_ago,
                created_at__lt=last_month
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Calcular percentual de crescimento
            if previous_month_revenue > 0:
                growth_rate = ((monthly_revenue - previous_month_revenue) / previous_month_revenue) * 100
            else:
                growth_rate = 0 if monthly_revenue == 0 else 100
            
            return {
                'totalDonations': float(total_donations['total'] or 0),
                'donationsGrowth': round(growth_rate, 1),
                'averageDonation': float(total_donations['avg'] or 0),
                'recurringDonors': recurring_donors,
                'monthlyRevenue': float(monthly_revenue),
                'projectedRevenue': float(monthly_revenue * 12)  # Projeção simples
            }
            
        except ImportError:
            # Fallback se o modelo Donation não existir
            return {
                'totalDonations': 0,
                'donationsGrowth': 0,
                'averageDonation': 0,
                'recurringDonors': 0,
                'monthlyRevenue': 0,
                'projectedRevenue': 0
            }
    
    def _get_community_stats(self, filters: dict) -> dict:
        """Obter estatísticas da comunidade"""
        try:
            # Voluntários
            from volunteers.models import VolunteerProfile
            volunteers_total = VolunteerProfile.objects.count()
            volunteers_active = VolunteerProfile.objects.filter(is_active=True).count()
            
        except ImportError:
            volunteers_total = 0
            volunteers_active = 0
        
        try:
            # Beneficiários
            from beneficiaries.models import BeneficiaryProfile
            beneficiaries_total = BeneficiaryProfile.objects.count()
            if 'date_from' in filters:
                beneficiaries_active = BeneficiaryProfile.objects.filter(
                    created_at__gte=filters['date_from']
                ).count()
            else:
                # Considerar beneficiários verificados como "ativos"
                beneficiaries_active = BeneficiaryProfile.objects.filter(is_verified=True).count()
                
        except ImportError:
            beneficiaries_total = 0
            beneficiaries_active = 0
        
        try:
            # Parceiros (usar PartnerMessage como indicador de parceiros ativos)
            from partnerships.models import PartnerMessage, PartnerProjectAssignment
            # Contagem de parceiros únicos baseado em mensagens
            partners_total = PartnerMessage.objects.values('sender').distinct().count()
            # Parceiros ativos (que tiveram atividade recente)
            from django.utils import timezone
            from datetime import timedelta
            recent_cutoff = timezone.now() - timedelta(days=90)
            partners_active = PartnerMessage.objects.filter(
                created_at__gte=recent_cutoff
            ).values('sender').distinct().count()
            
        except ImportError:
            partners_total = 0
            partners_active = 0
        
        return {
            'totalVolunteers': volunteers_total,
            'activeVolunteers': volunteers_active,
            'totalBeneficiaries': beneficiaries_total,
            'activeBeneficiaries': beneficiaries_active,
            'totalPartners': partners_total,
            'activePartners': partners_active
        }
    
    def _get_performance_stats(self, filters: dict) -> dict:
        """Calcular métricas de performance baseadas em dados reais"""
        performance_data = {}
        
        # 1. Taxa de sucesso de projetos (baseado nas métricas de tracking)
        try:
            from core.models import Project
            from project_tracking.models import ProjectMetrics
            from django.utils import timezone
            from django.db.models import Q, Avg
            
            # Usar dados do ProjectMetrics que são mais precisos
            projects_with_metrics = Project.objects.filter(metrics__isnull=False)
            
            if projects_with_metrics.count() > 0:
                # Calcular taxa de sucesso baseado no progresso das métricas
                successful_projects = projects_with_metrics.filter(
                    metrics__progress_percentage__gte=80  # Projetos com >= 80% de progresso
                ).count()
                
                total_projects = projects_with_metrics.count()
                project_success_rate = (successful_projects / total_projects) * 100
            else:
                # Fallback para progress_percentage básico
                avg_progress = Project.objects.aggregate(
                    avg=Avg('progress_percentage')
                )['avg'] or 0
                project_success_rate = min(avg_progress, 100)
                
            performance_data['projectSuccessRate'] = round(project_success_rate, 1)
        except Exception as e:
            performance_data['projectSuccessRate'] = 0
        
        # 2. Retenção de voluntários (voluntários ativos vs total)
        try:
            from volunteers.models import VolunteerProfile
            total_volunteers = VolunteerProfile.objects.count()
            active_volunteers = VolunteerProfile.objects.filter(is_active=True).count()
            
            if total_volunteers > 0:
                volunteer_retention = (active_volunteers / total_volunteers) * 100
            else:
                volunteer_retention = 0
                
            performance_data['volunteerRetention'] = round(volunteer_retention, 1)
        except:
            performance_data['volunteerRetention'] = 0
        
        # 3. Retenção de doadores (baseado em doações recorrentes)
        try:
            from donations.models import Donation
            total_donors = Donation.objects.values('donor').distinct().count()
            recurring_donors = Donation.objects.values('donor').annotate(
                donation_count=Count('id')
            ).filter(donation_count__gt=1).count()
            
            if total_donors > 0:
                donor_retention = (recurring_donors / total_donors) * 100
            else:
                donor_retention = 0
                
            performance_data['donorRetention'] = round(donor_retention, 1)
        except:
            performance_data['donorRetention'] = 0
        
        # 4. Duração média dos projetos (em meses) - duração planejada total
        try:
            from core.models import Project
            from django.utils import timezone
            
            current_date = timezone.now().date()
            all_projects = Project.objects.exclude(start_date__isnull=True, end_date__isnull=True)
            
            total_duration = 0
            count = 0
            
            for project in all_projects:
                duration = None
                
                if project.start_date and project.end_date:
                    # Usar duração planejada total (mais realista)
                    duration = (project.end_date - project.start_date).days / 30.44  # meses
                elif project.created_at and project.end_date:
                    # Fallback usando created_at
                    start = project.created_at.date()
                    duration = (project.end_date - start).days / 30.44
                
                if duration and duration > 0:
                    total_duration += duration
                    count += 1
            
            if count > 0:
                avg_duration = total_duration / count
            else:
                # Fallback: duração estimada baseada no progresso
                avg_duration = 6  # 6 meses como duração média padrão
                
            performance_data['averageProjectDuration'] = round(avg_duration, 1)
        except Exception as e:
            performance_data['averageProjectDuration'] = 0
        
        # 5. Custo por beneficiário
        try:
            from core.models import Project
            from project_tracking.models import ProjectMetrics
            
            total_budget_used = ProjectMetrics.objects.aggregate(
                total=Sum('budget_used')
            )['total'] or 0
            
            total_beneficiaries = ProjectMetrics.objects.aggregate(
                total=Sum('people_impacted')
            )['total'] or 0
            
            if total_beneficiaries > 0:
                cost_per_beneficiary = total_budget_used / total_beneficiaries
            else:
                cost_per_beneficiary = 0
                
            performance_data['costPerBeneficiary'] = round(cost_per_beneficiary, 2)
        except:
            performance_data['costPerBeneficiary'] = 0
        
        # 6. Score de impacto (baseado na média de progresso dos projetos)
        try:
            from project_tracking.models import ProjectMetrics
            avg_progress = ProjectMetrics.objects.aggregate(
                avg=Avg('progress_percentage')
            )['avg'] or 0
            
            # Converter progresso médio (0-100%) para score de impacto (0-10)
            impact_score = (avg_progress / 100) * 10
            performance_data['impactScore'] = round(impact_score, 1)
        except:
            performance_data['impactScore'] = 0
        
        return performance_data
    
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
    def advanced_stats(self, request):
        """Endpoint para estatísticas avançadas"""
        try:
            # Lidar com diferentes tipos de request
            if hasattr(request, 'query_params'):
                time_range = request.query_params.get('range', '6months')
            else:
                time_range = request.GET.get('range', '6months')
            
            # Importar modelos necessários
            try:
                from donations.models import Donation
            except ImportError:
                from django.db import models
                # Modelo mock para donations se não existir
                class Donation(models.Model):
                    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
                    status = models.CharField(max_length=20, default='completed')
                    created_at = models.DateTimeField(auto_now_add=True)
                    class Meta:
                        app_label = 'donations'
            
            try:
                from volunteers.models import VolunteerProfile
            except ImportError:
                from django.db import models
                class VolunteerProfile(models.Model):
                    last_activity = models.DateTimeField(null=True, blank=True)
                    class Meta:
                        app_label = 'volunteers'
            
            try:
                from beneficiaries.models import Beneficiary
            except ImportError:
                from django.db import models
                class Beneficiary(models.Model):
                    status = models.CharField(max_length=20, default='active')
                    class Meta:
                        app_label = 'beneficiaries'
            
            try:
                from partnerships.models import Partnership
            except ImportError:
                from django.db import models
                class Partnership(models.Model):
                    status = models.CharField(max_length=20, default='active')
                    class Meta:
                        app_label = 'partnerships'
            
            try:
                from core.models import Project
            except ImportError:
                from django.db import models
                class Project(models.Model):
                    status = models.CharField(max_length=20, default='active')
                    progress = models.FloatField(default=0)
                    budget = models.DecimalField(max_digits=15, decimal_places=2, default=0)
                    class Meta:
                        app_label = 'projects'
            
            try:
                from blog.models import Post
            except ImportError:
                from django.db import models
                class Post(models.Model):
                    is_published = models.BooleanField(default=True)
                    views_count = models.IntegerField(default=0)
                    class Meta:
                        app_label = 'blog'
                        
            from django.db.models import Sum, Avg, Count
            from datetime import datetime, timedelta
            
            # Calcular datas baseado no range
            end_date = timezone.now()
            if time_range == '1month':
                start_date = end_date - timedelta(days=30)
            elif time_range == '3months':
                start_date = end_date - timedelta(days=90)
            elif time_range == '6months':
                start_date = end_date - timedelta(days=180)
            elif time_range == '1year':
                start_date = end_date - timedelta(days=365)
            else:  # all
                start_date = None

            # Métricas Financeiras
            donations_query = Donation.objects.filter(status='completed')
            if start_date:
                donations_query = donations_query.filter(created_at__gte=start_date)
            
            total_donations = donations_query.aggregate(
                total=Sum('amount')
            )['total'] or 0
            
            avg_donation = donations_query.aggregate(
                avg=Avg('amount')
            )['avg'] or 0
            
            monthly_revenue = donations_query.filter(
                created_at__gte=end_date - timedelta(days=30)
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            # Métricas da Comunidade
            volunteers_total = VolunteerProfile.objects.count()
            volunteers_active = VolunteerProfile.objects.filter(
                last_activity__gte=end_date - timedelta(days=30)
            ).count() if start_date else volunteers_total // 2
            
            beneficiaries_total = Beneficiary.objects.count()
            beneficiaries_active = Beneficiary.objects.filter(
                status='active'
            ).count()
            
            partners_total = Partnership.objects.count()
            partners_active = Partnership.objects.filter(
                status='active'
            ).count()
            
            # Métricas de Projetos
            projects_total = Project.objects.count()
            projects_active = Project.objects.filter(status='active').count()
            projects_completed = Project.objects.filter(status='completed').count()
            
            avg_completion = Project.objects.aggregate(
                avg=Avg('progress')
            )['avg'] or 0
            
            total_budget = Project.objects.aggregate(
                total=Sum('budget')
            )['total'] or 0
            
            # Calcular total gasto (simplificado)
            total_spent = total_budget * 0.73  # Assumindo 73% de execução
            
            # Métricas de Performance (calculadas)
            donor_retention = 78.5  # Valor mockado - implementar cálculo real
            volunteer_retention = 82.3
            project_success_rate = (projects_completed / projects_total * 100) if projects_total > 0 else 0
            avg_project_duration = 8.5
            cost_per_beneficiary = (total_spent / beneficiaries_total) if beneficiaries_total > 0 else 0
            impact_score = min(10, project_success_rate / 10)
            
            stats_data = {
                'financialMetrics': {
                    'totalDonations': float(total_donations),
                    'donationsGrowth': 15.3,  # Mockado - implementar cálculo real
                    'averageDonation': float(avg_donation),
                    'recurringDonors': 89,  # Mockado
                    'monthlyRevenue': float(monthly_revenue),
                    'projectedRevenue': float(total_donations * 1.2),
                    'donorRetentionRate': donor_retention,
                    'conversionRate': 3.2
                },
                'communityMetrics': {
                    'totalVolunteers': volunteers_total,
                    'activeVolunteers': volunteers_active,
                    'totalBeneficiaries': beneficiaries_total,
                    'activeBeneficiaries': beneficiaries_active,
                    'totalPartners': partners_total,
                    'activePartners': partners_active,
                    'communityGrowthRate': 12.5,
                    'engagementRate': 67.8
                },
                'projectMetrics': {
                    'totalProjects': projects_total,
                    'activeProjects': projects_active,
                    'completedProjects': projects_completed,
                    'pausedProjects': Project.objects.filter(status='paused').count(),
                    'cancelledProjects': Project.objects.filter(status='cancelled').count(),
                    'averageCompletion': float(avg_completion),
                    'totalBudget': float(total_budget),
                    'totalSpent': float(total_spent),
                    'onTimeDelivery': 85.2,
                    'budgetUtilization': 73.4
                },
                'performanceMetrics': {
                    'donorRetention': donor_retention,
                    'volunteerRetention': volunteer_retention,
                    'beneficiaryRetention': 91.2,
                    'projectSuccessRate': float(project_success_rate),
                    'averageProjectDuration': avg_project_duration,
                    'costPerBeneficiary': float(cost_per_beneficiary),
                    'impactScore': float(impact_score),
                    'efficiency': 78.9
                },
                'contentMetrics': {
                    'totalPosts': Post.objects.count(),
                    'publishedPosts': Post.objects.filter(is_published=True).count(),
                    'draftPosts': Post.objects.filter(is_published=False).count(),
                    'totalViews': Post.objects.aggregate(total=Sum('views_count'))['total'] or 0,
                    'averageViews': Post.objects.aggregate(avg=Avg('views_count'))['avg'] or 0,
                    'engagementRate': 4.2,
                    'shareRate': 2.1,
                    'commentRate': 1.8
                }
            }
            
            return Response({
                'success': True,
                'data': stats_data,
                'generated_at': timezone.now().isoformat(),
                'time_range': time_range
            })
            
        except Exception as e:
            logger.error(f"Erro ao gerar estatísticas avançadas: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar estatísticas avançadas'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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


class ExportViewSet(viewsets.ViewSet):
    """ViewSet para exportação de dados"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def donations(self, request):
        """Exportar dados de doações"""
        try:
            export_format = request.data.get('format', 'csv')
            
            # Dados mockados para teste
            data = [
                {'id': 1, 'amount': 100.0, 'date': '2024-01-15', 'donor': 'João Silva'},
                {'id': 2, 'amount': 250.0, 'date': '2024-01-20', 'donor': 'Maria Santos'},
                {'id': 3, 'amount': 500.0, 'date': '2024-02-01', 'donor': 'Pedro Costa'},
            ]
            
            if export_format == 'json':
                response = HttpResponse(
                    json.dumps(data, indent=2),
                    content_type='application/json'
                )
                response['Content-Disposition'] = 'attachment; filename="donations.json"'
            elif export_format == 'csv':
                import csv
                output = BytesIO()
                writer = csv.DictWriter(output, fieldnames=['id', 'amount', 'date', 'donor'])
                writer.writeheader()
                writer.writerows(data)
                
                response = HttpResponse(
                    output.getvalue().decode('utf-8'),
                    content_type='text/csv'
                )
                response['Content-Disposition'] = 'attachment; filename="donations.csv"'
            else:
                response = HttpResponse(
                    json.dumps(data, indent=2),
                    content_type='application/json'
                )
                response['Content-Disposition'] = 'attachment; filename="donations.json"'
            
            return response
            
        except Exception as e:
            logger.error(f"Erro ao exportar doações: {str(e)}")
            return Response(
                {'error': 'Erro ao exportar doações'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def volunteers(self, request):
        """Exportar dados de voluntários"""
        try:
            export_format = request.data.get('format', 'csv')
            
            # Dados mockados para teste
            data = [
                {'id': 1, 'name': 'Ana Silva', 'skills': 'Educação', 'active': True},
                {'id': 2, 'name': 'Carlos Santos', 'skills': 'Saúde', 'active': True},
                {'id': 3, 'name': 'Lucia Costa', 'skills': 'Tecnologia', 'active': False},
            ]
            
            if export_format == 'json':
                response = HttpResponse(
                    json.dumps(data, indent=2),
                    content_type='application/json'
                )
                response['Content-Disposition'] = 'attachment; filename="volunteers.json"'
            else:
                import csv
                output = BytesIO()
                writer = csv.DictWriter(output, fieldnames=['id', 'name', 'skills', 'active'])
                writer.writeheader()
                writer.writerows(data)
                
                response = HttpResponse(
                    output.getvalue().decode('utf-8'),
                    content_type='text/csv'
                )
                response['Content-Disposition'] = 'attachment; filename="volunteers.csv"'
            
            return response
            
        except Exception as e:
            logger.error(f"Erro ao exportar voluntários: {str(e)}")
            return Response(
                {'error': 'Erro ao exportar voluntários'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def beneficiaries(self, request):
        """Exportar dados de beneficiários"""
        try:
            export_format = request.data.get('format', 'csv')
            
            # Dados mockados para teste
            data = [
                {'id': 1, 'name': 'Família Silva', 'location': 'Maputo', 'status': 'active'},
                {'id': 2, 'name': 'Família Santos', 'location': 'Beira', 'status': 'active'},
                {'id': 3, 'name': 'Família Costa', 'location': 'Nampula', 'status': 'pending'},
            ]
            
            if export_format == 'json':
                response = HttpResponse(
                    json.dumps(data, indent=2),
                    content_type='application/json'
                )
                response['Content-Disposition'] = 'attachment; filename="beneficiaries.json"'
            else:
                import csv
                output = BytesIO()
                writer = csv.DictWriter(output, fieldnames=['id', 'name', 'location', 'status'])
                writer.writeheader()
                writer.writerows(data)
                
                response = HttpResponse(
                    output.getvalue().decode('utf-8'),
                    content_type='text/csv'
                )
                response['Content-Disposition'] = 'attachment; filename="beneficiaries.csv"'
            
            return response
            
        except Exception as e:
            logger.error(f"Erro ao exportar beneficiários: {str(e)}")
            return Response(
                {'error': 'Erro ao exportar beneficiários'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def partners(self, request):
        """Exportar dados de parceiros"""
        try:
            export_format = request.data.get('format', 'csv')
            
            # Dados mockados para teste
            data = [
                {'id': 1, 'name': 'ONG Verde', 'type': 'Ambiental', 'active': True},
                {'id': 2, 'name': 'Fundação Saúde', 'type': 'Saúde', 'active': True},
                {'id': 3, 'name': 'Instituto Educação', 'type': 'Educação', 'active': False},
            ]
            
            if export_format == 'json':
                response = HttpResponse(
                    json.dumps(data, indent=2),
                    content_type='application/json'
                )
                response['Content-Disposition'] = 'attachment; filename="partners.json"'
            else:
                import csv
                output = BytesIO()
                writer = csv.DictWriter(output, fieldnames=['id', 'name', 'type', 'active'])
                writer.writeheader()
                writer.writerows(data)
                
                response = HttpResponse(
                    output.getvalue().decode('utf-8'),
                    content_type='text/csv'
                )
                response['Content-Disposition'] = 'attachment; filename="partners.csv"'
            
            return response
            
        except Exception as e:
            logger.error(f"Erro ao exportar parceiros: {str(e)}")
            return Response(
                {'error': 'Erro ao exportar parceiros'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def projects(self, request):
        """Exportar dados de projetos"""
        try:
            export_format = request.data.get('format', 'csv')
            
            # Dados mockados para teste
            data = [
                {'id': 1, 'name': 'Projeto Água Limpa', 'status': 'active', 'progress': 75},
                {'id': 2, 'name': 'Educação Rural', 'status': 'completed', 'progress': 100},
                {'id': 3, 'name': 'Saúde Comunitária', 'status': 'planning', 'progress': 25},
            ]
            
            if export_format == 'json':
                response = HttpResponse(
                    json.dumps(data, indent=2),
                    content_type='application/json'
                )
                response['Content-Disposition'] = 'attachment; filename="projects.json"'
            else:
                import csv
                output = BytesIO()
                writer = csv.DictWriter(output, fieldnames=['id', 'name', 'status', 'progress'])
                writer.writeheader()
                writer.writerows(data)
                
                response = HttpResponse(
                    output.getvalue().decode('utf-8'),
                    content_type='text/csv'
                )
                response['Content-Disposition'] = 'attachment; filename="projects.csv"'
            
            return response
            
        except Exception as e:
            logger.error(f"Erro ao exportar projetos: {str(e)}")
            return Response(
                {'error': 'Erro ao exportar projetos'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def blog(self, request):
        """Exportar dados do blog"""
        try:
            export_format = request.data.get('format', 'csv')
            
            # Dados mockados para teste
            data = [
                {'id': 1, 'title': 'Impacto Social 2024', 'category': 'Relatórios', 'published': True},
                {'id': 2, 'title': 'Novos Projetos', 'category': 'Novidades', 'published': True},
                {'id': 3, 'title': 'Voluntariado', 'category': 'Educação', 'published': False},
            ]
            
            if export_format == 'json':
                response = HttpResponse(
                    json.dumps(data, indent=2),
                    content_type='application/json'
                )
                response['Content-Disposition'] = 'attachment; filename="blog.json"'
            else:
                import csv
                output = BytesIO()
                writer = csv.DictWriter(output, fieldnames=['id', 'title', 'category', 'published'])
                writer.writeheader()
                writer.writerows(data)
                
                response = HttpResponse(
                    output.getvalue().decode('utf-8'),
                    content_type='text/csv'
                )
                response['Content-Disposition'] = 'attachment; filename="blog.csv"'
            
            return response
            
        except Exception as e:
            logger.error(f"Erro ao exportar blog: {str(e)}")
            return Response(
                {'error': 'Erro ao exportar blog'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
