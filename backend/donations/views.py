# backend/donations/views.py
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count
from django.utils import timezone
from datetime import datetime, timedelta

from .models import Donation, DonationComment, DonationMethod, DonationStats
from .serializers import (
    DonationSerializer, DonationCreateSerializer, DonationUpdateSerializer,
    DonationCommentSerializer, DonationMethodSerializer, DonationStatsSerializer
)
from notifications.services import NotificationService

class DonationListCreateView(generics.ListCreateAPIView):
    """Lista e cria doações"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_method', 'is_anonymous']
    search_fields = ['donor__username', 'donor__email', 'purpose', 'payment_reference']
    ordering_fields = ['submission_date', 'amount', 'status']
    ordering = ['-submission_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DonationCreateSerializer
        return DonationSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin vê todas as doações
        if user.is_staff:
            return Donation.objects.all().select_related('donor', 'reviewed_by').prefetch_related('comments')
        
        # Usuários normais veem apenas suas doações
        return Donation.objects.filter(donor=user).select_related('reviewed_by').prefetch_related('comments')
    
    def perform_create(self, serializer):
        donation = serializer.save(donor=self.request.user)
        # Disparar notificações para nova doação
        NotificationService.notify_donation_created(donation)

class DonationDetailView(generics.RetrieveUpdateAPIView):
    """Detalhe e atualização de doação"""
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DonationUpdateSerializer
        return DonationSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.is_staff:
            return Donation.objects.all()
        
        return Donation.objects.filter(donor=user)
    
    def update(self, request, *args, **kwargs):
        # Check if user is staff
        if not request.user.is_staff:
            return Response({'error': 'Apenas administradores podem atualizar doações'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def perform_update(self, serializer):
        # Apenas admins podem atualizar status
        if self.request.user.is_staff:
            # Capturar status anterior
            donation_instance = self.get_object()
            old_status = donation_instance.status
            
            donation = serializer.save(
                reviewed_by=self.request.user,
                review_date=timezone.now()
            )
            
            # Se aprovado, definir data de aprovação
            if donation.status == 'approved':
                donation.approval_date = timezone.now()
                donation.save()
            
            # Disparar notificações se o status mudou
            if old_status != donation.status:
                NotificationService.notify_donation_status_changed(
                    donation, old_status, donation.status, self.request.user
                )

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def donation_comments(request, donation_id):
    """Listar ou adicionar comentários à doação"""
    try:
        donation = Donation.objects.get(id=donation_id)
        
        # Verificar permissões
        if not request.user.is_staff and donation.donor != request.user:
            return Response({'error': 'Permissão negada'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            # Listar comentários
            comments = donation.comments.all().order_by('-created_at')
            serializer = DonationCommentSerializer(comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Adicionar comentário
            message = request.data.get('message', '').strip()
            is_internal = request.data.get('is_internal', False)
            
            if not message:
                return Response({'error': 'Mensagem é obrigatória'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Apenas admins podem criar notas internas
            if is_internal and not request.user.is_staff:
                is_internal = False
            
            comment = DonationComment.objects.create(
                donation=donation,
                author=request.user,
                message=message,
                is_internal=is_internal
            )
            
            # Disparar notificações para novo comentário
            NotificationService.notify_comment_added(comment)
            
            serializer = DonationCommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Donation.DoesNotExist:
        return Response({'error': 'Doação não encontrada'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def donation_statistics(request):
    """Estatísticas de doações"""
    if not request.user.is_staff:
        # Estatísticas do doador
        user_stats = {
            'total_donations': Donation.objects.filter(donor=request.user, status='approved').aggregate(
                total=Sum('amount')
            )['total'] or 0,
            'donation_count': Donation.objects.filter(donor=request.user, status='approved').count(),
            'pending_count': Donation.objects.filter(donor=request.user, status__in=['pending', 'submitted', 'under_review']).count(),
            'last_donation': None
        }
        
        last_donation = Donation.objects.filter(donor=request.user).order_by('-submission_date').first()
        if last_donation:
            user_stats['last_donation'] = DonationSerializer(last_donation).data
        
        return Response(user_stats)
    
    # Estatísticas do admin
    today = timezone.now().date()
    this_month = today.replace(day=1)
    last_30_days = today - timedelta(days=30)
    
    total_stats = Donation.objects.aggregate(
        total_amount=Sum('amount'),
        total_count=Count('id'),
        approved_amount=Sum('amount', filter=Q(status='approved')),
        approved_count=Count('id', filter=Q(status='approved'))
    )
    
    monthly_stats = Donation.objects.filter(
        submission_date__gte=this_month
    ).aggregate(
        monthly_amount=Sum('amount'),
        monthly_count=Count('id')
    )
    
    recent_stats = Donation.objects.filter(
        submission_date__gte=last_30_days
    ).aggregate(
        recent_amount=Sum('amount'),
        recent_count=Count('id')
    )
    
    pending_stats = Donation.objects.filter(
        status__in=['pending', 'submitted', 'under_review']
    ).aggregate(
        pending_amount=Sum('amount'),
        pending_count=Count('id')
    )
    
    # Doações por método de pagamento
    payment_methods = Donation.objects.filter(status='approved').values(
        'payment_method'
    ).annotate(
        count=Count('id'),
        total=Sum('amount')
    ).order_by('-total')
    
    # Top doadores
    top_donors = Donation.objects.filter(
        status='approved'
    ).values(
        'donor__username', 'donor__first_name', 'donor__last_name'
    ).annotate(
        total_amount=Sum('amount'),
        donation_count=Count('id')
    ).order_by('-total_amount')[:10]
    
    return Response({
        'total': total_stats,
        'monthly': monthly_stats,
        'recent': recent_stats,
        'pending': pending_stats,
        'payment_methods': payment_methods,
        'top_donors': top_donors,
        'summary': {
            'total_raised': total_stats['approved_amount'] or 0,
            'total_donors': Donation.objects.filter(status='approved').values('donor').distinct().count(),
            'average_donation': (total_stats['approved_amount'] or 0) / max(total_stats['approved_count'] or 1, 1),
            'pending_review': pending_stats['pending_count'] or 0
        }
    })

@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_update_donations(request):
    """Atualização em lote de doações"""
    donation_ids = request.data.get('donation_ids', [])
    new_status = request.data.get('status')
    admin_comment = request.data.get('admin_comment', '')
    rejection_reason = request.data.get('rejection_reason', '')
    
    if not donation_ids or not new_status:
        return Response({'error': 'IDs de doação e status são obrigatórios'}, status=status.HTTP_400_BAD_REQUEST)
    
    # rejection_reason é opcional - removida a validação obrigatória
    
    # Buscar doações antes da atualização para capturar status anterior
    donations = Donation.objects.filter(id__in=donation_ids)
    
    updated_count = 0
    for donation in donations:
        old_status = donation.status
        donation.status = new_status
        donation.reviewed_by = request.user
        donation.review_date = timezone.now()
        donation.admin_notes = admin_comment
        
        # Adicionar rejection_reason se fornecido
        if new_status == 'rejected' and rejection_reason:
            donation.rejection_reason = rejection_reason
            
        # Definir approval_date se aprovado
        if new_status == 'approved':
            donation.approval_date = timezone.now()
            
        donation.save()
        
        # Disparar notificações para mudança de status
        if old_status != new_status:
            NotificationService.notify_donation_status_changed(
                donation, old_status, new_status, request.user
            )
        
        updated_count += 1
    
    return Response({
        'message': f'{updated_count} doações atualizadas',
        'updated_count': updated_count
    })

class DonationMethodListView(generics.ListAPIView):
    """Lista métodos de doação disponíveis"""
    queryset = DonationMethod.objects.filter(is_active=True)
    serializer_class = DonationMethodSerializer
    permission_classes = [IsAuthenticated]
