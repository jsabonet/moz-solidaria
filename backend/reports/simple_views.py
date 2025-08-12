"""
Versão simplificada do endpoint de analytics para teste
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

class SimpleAnalyticsAPIView(viewsets.ViewSet):
    """ViewSet simplificado para endpoints de analytics"""
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def advanced_stats(self, request):
        """Endpoint simplificado para estatísticas avançadas"""
        try:
            # Lidar com diferentes tipos de request
            if hasattr(request, 'query_params'):
                time_range = request.query_params.get('range', '6months')
            else:
                time_range = request.GET.get('range', '6months')
            
            # Dados mockados para o frontend funcionar
            stats_data = {
                'financialMetrics': {
                    'totalDonations': 125000.50,
                    'donationsGrowth': 15.3,
                    'averageDonation': 85.75,
                    'recurringDonors': 89,
                    'monthlyRevenue': 15000.25,
                    'projectedRevenue': 150000.60,
                    'donorRetentionRate': 78.5,
                    'conversionRate': 3.2
                },
                'communityMetrics': {
                    'totalVolunteers': 245,
                    'activeVolunteers': 189,
                    'totalBeneficiaries': 1250,
                    'activeBeneficiaries': 1180,
                    'totalPartners': 32,
                    'activePartners': 28,
                    'communityGrowthRate': 12.5,
                    'engagementRate': 67.8
                },
                'projectMetrics': {
                    'totalProjects': 48,
                    'activeProjects': 12,
                    'completedProjects': 32,
                    'pausedProjects': 3,
                    'cancelledProjects': 1,
                    'averageCompletion': 73.4,
                    'totalBudget': 450000.0,
                    'totalSpent': 330300.0,
                    'onTimeDelivery': 85.2,
                    'budgetUtilization': 73.4
                },
                'performanceMetrics': {
                    'donorRetention': 78.5,
                    'volunteerRetention': 82.3,
                    'beneficiaryRetention': 91.2,
                    'projectSuccessRate': 88.9,
                    'averageProjectDuration': 8.5,
                    'costPerBeneficiary': 264.24,
                    'impactScore': 8.9,
                    'efficiency': 78.9
                },
                'contentMetrics': {
                    'totalPosts': 156,
                    'publishedPosts': 142,
                    'draftPosts': 14,
                    'totalViews': 45680,
                    'averageViews': 321.7,
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
                {'error': 'Erro ao gerar estatísticas avançadas', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def project_timeline(self, request):
        """Timeline de atividade dos projetos"""
        try:
            # Dados mockados para timeline
            timeline_data = {
                'success': True,
                'data': [
                    {
                        'date': '2024-01-01',
                        'projects_started': 3,
                        'projects_completed': 1,
                        'donations_received': 12500.0,
                        'volunteers_active': 45
                    },
                    {
                        'date': '2024-02-01',
                        'projects_started': 2,
                        'projects_completed': 2,
                        'donations_received': 15750.0,
                        'volunteers_active': 52
                    },
                    {
                        'date': '2024-03-01',
                        'projects_started': 4,
                        'projects_completed': 3,
                        'donations_received': 18200.0,
                        'volunteers_active': 48
                    }
                ],
                'generated_at': timezone.now().isoformat()
            }
            
            return Response(timeline_data)
            
        except Exception as e:
            logger.error(f"Erro ao gerar timeline: {str(e)}")
            return Response(
                {'error': 'Erro ao gerar timeline'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
