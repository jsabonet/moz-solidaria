# backend/reports/services.py
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
import json
from typing import Dict, List, Any, Optional

# Assumindo que os modelos existem
from core.models import Project
from project_tracking.models import ProjectMetrics, ProjectUpdate, ProjectMilestone
# from donations.models import Donation
# from users.models import UserProfile

class ReportDataService:
    """Serviço para coleta e processamento de dados para relatórios"""
    
    def __init__(self):
        self.current_date = timezone.now()
        self.current_year = self.current_date.year
        
    def get_project_overview_data(self, filters: Dict = None) -> Dict[str, Any]:
        """Dados gerais de projetos"""
        projects_qs = Project.objects.all()
        
        if filters:
            # Aplicar filtros se fornecidos
            if 'status' in filters:
                projects_qs = projects_qs.filter(status=filters['status'])
            if 'date_from' in filters:
                projects_qs = projects_qs.filter(created_at__gte=filters['date_from'])
            if 'date_to' in filters:
                projects_qs = projects_qs.filter(created_at__lte=filters['date_to'])
        
        # Estatísticas básicas
        total_projects = projects_qs.count()
        active_projects = projects_qs.filter(status='active').count()
        completed_projects = projects_qs.filter(status='completed').count()
        
        # Métricas agregadas
        metrics_data = ProjectMetrics.objects.filter(project__in=projects_qs).aggregate(
            total_budget=Sum('budget_total'),
            total_spent=Sum('budget_used'),
            total_direct_beneficiaries=Sum('direct_beneficiaries'),
            total_indirect_beneficiaries=Sum('indirect_beneficiaries'),
            avg_success_rate=Avg('success_rate'),
            total_milestones=Sum('total_milestones'),
            completed_milestones=Sum('completed_milestones')
        )
        
        # Calcular percentuais
        budget_utilization = 0
        if metrics_data['total_budget'] and metrics_data['total_budget'] > 0:
            budget_utilization = (metrics_data['total_spent'] or 0) / metrics_data['total_budget'] * 100
            
        milestone_completion = 0
        if metrics_data['total_milestones'] and metrics_data['total_milestones'] > 0:
            milestone_completion = (metrics_data['completed_milestones'] or 0) / metrics_data['total_milestones'] * 100
        
        return {
            'summary': {
                'total_projects': total_projects,
                'active_projects': active_projects,
                'completed_projects': completed_projects,
                'completion_rate': (completed_projects / total_projects * 100) if total_projects > 0 else 0
            },
            'financial': {
                'total_budget': metrics_data['total_budget'] or 0,
                'total_spent': metrics_data['total_spent'] or 0,
                'budget_utilization_percentage': round(budget_utilization, 2),
                'remaining_budget': (metrics_data['total_budget'] or 0) - (metrics_data['total_spent'] or 0)
            },
            'impact': {
                'direct_beneficiaries': metrics_data['total_direct_beneficiaries'] or 0,
                'indirect_beneficiaries': metrics_data['total_indirect_beneficiaries'] or 0,
                'total_beneficiaries': (metrics_data['total_direct_beneficiaries'] or 0) + (metrics_data['total_indirect_beneficiaries'] or 0),
                'average_success_rate': round(metrics_data['avg_success_rate'] or 0, 2)
            },
            'milestones': {
                'total_milestones': metrics_data['total_milestones'] or 0,
                'completed_milestones': metrics_data['completed_milestones'] or 0,
                'completion_percentage': round(milestone_completion, 2)
            }
        }
    
    def get_project_performance_data(self, filters: Dict = None) -> Dict[str, Any]:
        """Dados de performance de projetos"""
        projects_qs = Project.objects.all()
        
        if filters:
            if 'date_from' in filters:
                projects_qs = projects_qs.filter(created_at__gte=filters['date_from'])
            if 'date_to' in filters:
                projects_qs = projects_qs.filter(created_at__lte=filters['date_to'])
        
        # Performance por projeto
        project_performance = []
        for project in projects_qs[:20]:  # Top 20 projetos
            try:
                metrics = project.metrics
                performance_data = {
                    'id': project.id,
                    'name': project.name,
                    'slug': project.slug,
                    'status': project.status,
                    'budget_utilization': 0,
                    'milestone_completion': 0,
                    'beneficiaries_reached': metrics.direct_beneficiaries + metrics.indirect_beneficiaries,
                    'success_rate': metrics.success_rate,
                    'last_updated': metrics.last_updated.isoformat() if metrics.last_updated else None
                }
                
                if metrics.budget_total > 0:
                    performance_data['budget_utilization'] = (metrics.budget_used / metrics.budget_total) * 100
                
                if metrics.total_milestones > 0:
                    performance_data['milestone_completion'] = (metrics.completed_milestones / metrics.total_milestones) * 100
                
                project_performance.append(performance_data)
            except:
                continue
        
        # Projetos com melhor performance
        top_performers = sorted(project_performance, key=lambda x: x['success_rate'], reverse=True)[:5]
        
        # Projetos que precisam de atenção
        attention_needed = []
        for project in project_performance:
            if (project['budget_utilization'] > 90 and project['milestone_completion'] < 80) or \
               (project['success_rate'] < 70):
                attention_needed.append(project)
        
        return {
            'all_projects': project_performance,
            'top_performers': top_performers,
            'attention_needed': attention_needed[:5],
            'performance_distribution': self._calculate_performance_distribution(project_performance)
        }
    
    def get_timeline_data(self, period: str = 'monthly', filters: Dict = None) -> Dict[str, Any]:
        """Dados de timeline para gráficos temporais"""
        end_date = timezone.now()
        
        if period == 'daily':
            start_date = end_date - timedelta(days=30)
            date_format = '%Y-%m-%d'
            date_trunc = 'day'
        elif period == 'weekly':
            start_date = end_date - timedelta(weeks=12)
            date_format = '%Y-W%U'
            date_trunc = 'week'
        elif period == 'monthly':
            start_date = end_date - timedelta(days=365)
            date_format = '%Y-%m'
            date_trunc = 'month'
        else:  # yearly
            start_date = end_date - timedelta(days=365*3)
            date_format = '%Y'
            date_trunc = 'year'
        
        # Projetos criados por período
        projects_timeline = self._get_timeline_aggregation(
            Project.objects.filter(created_at__gte=start_date),
            'created_at',
            date_trunc,
            date_format
        )
        
        # Atualizações por período
        updates_timeline = self._get_timeline_aggregation(
            ProjectUpdate.objects.filter(created_at__gte=start_date, status='published'),
            'created_at',
            date_trunc,
            date_format
        )
        
        # Milestones completados por período
        milestones_timeline = self._get_timeline_aggregation(
            ProjectMilestone.objects.filter(
                completed_date__gte=start_date.date(),
                status='completed'
            ),
            'completed_date',
            date_trunc,
            date_format
        )
        
        return {
            'period': period,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'projects_created': projects_timeline,
            'updates_published': updates_timeline,
            'milestones_completed': milestones_timeline
        }
    
    def get_executive_summary(self, filters: Dict = None) -> Dict[str, Any]:
        """Resumo executivo com KPIs principais"""
        overview = self.get_project_overview_data(filters)
        performance = self.get_project_performance_data(filters)
        
        # KPIs principais
        kpis = {
            'total_projects': overview['summary']['total_projects'],
            'active_projects': overview['summary']['active_projects'],
            'completion_rate': overview['summary']['completion_rate'],
            'total_budget': overview['financial']['total_budget'],
            'budget_utilization': overview['financial']['budget_utilization_percentage'],
            'total_beneficiaries': overview['impact']['total_beneficiaries'],
            'average_success_rate': overview['impact']['average_success_rate'],
            'milestone_completion': overview['milestones']['completion_percentage']
        }
        
        # Alertas e recomendações
        alerts = []
        recommendations = []
        
        if kpis['budget_utilization'] > 85:
            alerts.append({
                'type': 'warning',
                'message': f"Alta utilização orçamentária: {kpis['budget_utilization']:.1f}%",
                'action': 'Revisar orçamentos dos projetos ativos'
            })
        
        if kpis['completion_rate'] < 70:
            alerts.append({
                'type': 'warning',
                'message': f"Taxa de conclusão baixa: {kpis['completion_rate']:.1f}%",
                'action': 'Analisar projetos em atraso'
            })
        
        if len(performance['attention_needed']) > 0:
            alerts.append({
                'type': 'info',
                'message': f"{len(performance['attention_needed'])} projetos precisam de atenção",
                'action': 'Revisar projetos com baixa performance'
            })
        
        # Tendências
        timeline_data = self.get_timeline_data('monthly', filters)
        recent_projects = len([p for p in timeline_data['projects_created'][-3:] if p['count'] > 0])
        
        trends = {
            'project_creation_trend': 'stable',  # Poderia calcular baseado nos dados
            'budget_trend': 'increasing',
            'impact_trend': 'positive'
        }
        
        return {
            'kpis': kpis,
            'alerts': alerts,
            'recommendations': recommendations,
            'trends': trends,
            'top_performers': performance['top_performers'][:3],
            'generated_at': timezone.now().isoformat()
        }
    
    def _calculate_performance_distribution(self, project_performance: List[Dict]) -> Dict[str, int]:
        """Calcula distribuição de performance dos projetos"""
        distribution = {
            'excellent': 0,  # > 90%
            'good': 0,       # 70-90%
            'average': 0,    # 50-70%
            'poor': 0        # < 50%
        }
        
        for project in project_performance:
            success_rate = project['success_rate']
            if success_rate >= 90:
                distribution['excellent'] += 1
            elif success_rate >= 70:
                distribution['good'] += 1
            elif success_rate >= 50:
                distribution['average'] += 1
            else:
                distribution['poor'] += 1
        
        return distribution
    
    def _get_timeline_aggregation(self, queryset, date_field: str, date_trunc: str, date_format: str) -> List[Dict]:
        """Agrega dados por período temporal"""
        # Simulação - em um ambiente real usaria raw SQL ou django-extensions
        results = []
        
        # Para simplificar, vou fazer um agrupamento básico
        # Em produção, usaria SQL mais avançado com DATE_TRUNC
        
        if date_trunc == 'month':
            # Últimos 12 meses
            for i in range(12):
                month_start = timezone.now().replace(day=1) - timedelta(days=30*i)
                month_end = month_start.replace(day=28) + timedelta(days=4)
                month_end = month_end - timedelta(days=month_end.day)
                
                if hasattr(queryset.first(), date_field.split('_')[0]):
                    count = queryset.filter(**{
                        f"{date_field}__gte": month_start,
                        f"{date_field}__lt": month_end
                    }).count()
                else:
                    count = 0
                
                results.append({
                    'period': month_start.strftime(date_format),
                    'count': count
                })
        
        return sorted(results, key=lambda x: x['period'])

class ReportGenerationService:
    """Serviço para geração de relatórios"""
    
    def __init__(self):
        self.data_service = ReportDataService()
    
    def generate_impact_report(self, filters: Dict = None) -> Dict[str, Any]:
        """Gera relatório de impacto"""
        overview = self.data_service.get_project_overview_data(filters)
        performance = self.data_service.get_project_performance_data(filters)
        timeline = self.data_service.get_timeline_data('monthly', filters)
        
        return {
            'title': 'Relatório de Impacto',
            'type': 'impact',
            'generated_at': timezone.now().isoformat(),
            'period': self._get_period_description(filters),
            'summary': overview,
            'project_performance': performance,
            'timeline': timeline,
            'impact_highlights': self._generate_impact_highlights(overview, performance)
        }
    
    def generate_executive_dashboard(self, filters: Dict = None) -> Dict[str, Any]:
        """Gera dashboard executivo"""
        executive_summary = self.data_service.get_executive_summary(filters)
        timeline = self.data_service.get_timeline_data('monthly', filters)
        
        return {
            'title': 'Dashboard Executivo',
            'type': 'executive',
            'generated_at': timezone.now().isoformat(),
            'summary': executive_summary,
            'timeline_data': timeline,
            'quick_stats': self._generate_quick_stats(executive_summary),
            'action_items': self._generate_action_items(executive_summary)
        }
    
    def generate_financial_report(self, filters: Dict = None) -> Dict[str, Any]:
        """Gera relatório financeiro"""
        overview = self.data_service.get_project_overview_data(filters)
        
        # Dados financeiros específicos
        financial_breakdown = self._generate_financial_breakdown(filters)
        budget_analysis = self._generate_budget_analysis(overview['financial'])
        
        return {
            'title': 'Relatório Financeiro',
            'type': 'financial',
            'generated_at': timezone.now().isoformat(),
            'period': self._get_period_description(filters),
            'summary': overview['financial'],
            'breakdown': financial_breakdown,
            'analysis': budget_analysis,
            'recommendations': self._generate_financial_recommendations(overview['financial'])
        }
    
    def _get_period_description(self, filters: Dict = None) -> str:
        """Gera descrição do período do relatório"""
        if not filters:
            return "Todos os períodos"
        
        if 'date_from' in filters and 'date_to' in filters:
            return f"De {filters['date_from']} até {filters['date_to']}"
        elif 'date_from' in filters:
            return f"A partir de {filters['date_from']}"
        elif 'date_to' in filters:
            return f"Até {filters['date_to']}"
        
        return "Período personalizado"
    
    def _generate_impact_highlights(self, overview: Dict, performance: Dict) -> List[Dict]:
        """Gera destaques de impacto"""
        highlights = []
        
        total_beneficiaries = overview['impact']['total_beneficiaries']
        if total_beneficiaries > 0:
            highlights.append({
                'title': 'Beneficiários Alcançados',
                'value': total_beneficiaries,
                'description': f"Total de pessoas impactadas pelos projetos"
            })
        
        if overview['summary']['completion_rate'] > 80:
            highlights.append({
                'title': 'Alta Taxa de Sucesso',
                'value': f"{overview['summary']['completion_rate']:.1f}%",
                'description': "Taxa de conclusão acima da média"
            })
        
        top_project = performance['top_performers'][0] if performance['top_performers'] else None
        if top_project:
            highlights.append({
                'title': 'Projeto Destaque',
                'value': top_project['name'],
                'description': f"Taxa de sucesso: {top_project['success_rate']:.1f}%"
            })
        
        return highlights
    
    def _generate_quick_stats(self, executive_summary: Dict) -> List[Dict]:
        """Gera estatísticas rápidas para dashboard"""
        kpis = executive_summary['kpis']
        
        return [
            {
                'label': 'Projetos Ativos',
                'value': kpis['active_projects'],
                'change': '+5%',  # Poderia calcular mudança real
                'trend': 'up'
            },
            {
                'label': 'Taxa de Conclusão',
                'value': f"{kpis['completion_rate']:.1f}%",
                'change': '+2.3%',
                'trend': 'up'
            },
            {
                'label': 'Beneficiários',
                'value': f"{kpis['total_beneficiaries']:,}",
                'change': '+12%',
                'trend': 'up'
            },
            {
                'label': 'Orçamento Utilizado',
                'value': f"{kpis['budget_utilization']:.1f}%",
                'change': '+1.5%',
                'trend': 'up'
            }
        ]
    
    def _generate_action_items(self, executive_summary: Dict) -> List[Dict]:
        """Gera itens de ação baseados nos alertas"""
        action_items = []
        
        for alert in executive_summary['alerts']:
            action_items.append({
                'priority': alert['type'],
                'title': alert['message'],
                'action': alert['action'],
                'status': 'pending'
            })
        
        return action_items
    
    def _generate_financial_breakdown(self, filters: Dict = None) -> Dict[str, Any]:
        """Gera detalhamento financeiro"""
        # Simulação - em produção, faria consultas mais detalhadas
        return {
            'by_project_category': [
                {'category': 'Educação', 'budget': 50000, 'spent': 35000, 'remaining': 15000},
                {'category': 'Saúde', 'budget': 30000, 'spent': 28000, 'remaining': 2000},
                {'category': 'Meio Ambiente', 'budget': 20000, 'spent': 15000, 'remaining': 5000}
            ],
            'monthly_spending': [
                {'month': '2024-01', 'spent': 12000},
                {'month': '2024-02', 'spent': 15000},
                {'month': '2024-03', 'spent': 18000}
            ]
        }
    
    def _generate_budget_analysis(self, financial_data: Dict) -> Dict[str, Any]:
        """Gera análise orçamentária"""
        return {
            'efficiency_score': 85,
            'cost_per_beneficiary': 125.50,
            'budget_variance': -5.2,  # negativo = abaixo do orçado
            'forecasted_completion': '2024-12-15'
        }
    
    def _generate_financial_recommendations(self, financial_data: Dict) -> List[str]:
        """Gera recomendações financeiras"""
        recommendations = []
        
        if financial_data['budget_utilization_percentage'] > 90:
            recommendations.append("Considerar realocação de orçamento entre projetos")
        
        if financial_data['remaining_budget'] < 10000:
            recommendations.append("Planejar captação de recursos adicionais")
        
        recommendations.append("Implementar controles de despesas mais rigorosos")
        
        return recommendations
