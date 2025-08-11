# backend/beneficiaries/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from django.db.models import Q, Count, Avg
from django.utils import timezone
from .models import BeneficiaryProfile, SupportRequest, BeneficiaryCommunication, BeneficiaryDocument
from .serializers import (
    BeneficiaryProfileSerializer, SupportRequestSerializer, BeneficiaryCommunicationSerializer,
    BeneficiaryDocumentSerializer, BeneficiaryRegistrationSerializer, SupportRequestCreateSerializer,
    BeneficiaryProfileCreateSerializer, BeneficiaryProfileCompleteSerializer, SupportRequestCompleteSerializer
)
from rest_framework.decorators import api_view, permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def beneficiary_dashboard_stats(request):
    """Endpoint estável (fora do router) para estatísticas do beneficiário logado.
    Evita colisões de rota do DRF quando 'dashboard_stats' é confundido como PK.
    """
    try:
        profile = request.user.beneficiary_profile
        support_requests = SupportRequest.objects.filter(beneficiary=profile)
        stats = {
            'profile': BeneficiaryProfileSerializer(profile).data,
            'requests_count': support_requests.count(),
            'pending_requests': support_requests.filter(status='pendente').count(),
            'approved_requests': support_requests.filter(status='aprovada').count(),
            'completed_requests': support_requests.filter(status='concluida').count(),
            'unread_messages': BeneficiaryCommunication.objects.filter(
                support_request__beneficiary=profile,
                is_read=False
            ).exclude(sender=request.user).count(),
            'recent_requests': SupportRequestSerializer(
                support_requests.order_by('-requested_date')[:5], many=True
            ).data
        }
        return Response(stats)
    except BeneficiaryProfile.DoesNotExist:
        return Response({'error': 'Perfil de beneficiário não encontrado'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def beneficiary_profile_exists(request):
    """Retorna se o utilizador logado possui perfil de beneficiário."""
    exists = hasattr(request.user, 'beneficiary_profile')
    data = {'exists': exists}
    if exists:
        data['beneficiary_id'] = request.user.beneficiary_profile.id
        data['full_name'] = request.user.beneficiary_profile.full_name
    return Response(data)


class BeneficiaryProfileViewSet(viewsets.ModelViewSet):
    serializer_class = BeneficiaryProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return BeneficiaryProfile.objects.all()
        else:
            # Beneficiários só podem ver seu próprio perfil
            return BeneficiaryProfile.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return BeneficiaryProfileCreateSerializer
        return BeneficiaryProfileSerializer

    def create(self, request, *args, **kwargs):
        # Verificar se usuário já tem perfil
        if hasattr(request.user, 'beneficiary_profile'):
            return Response(
                {'error': 'Usuário já possui perfil de beneficiário'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().create(request, *args, **kwargs)

    @action(detail=False, methods=['post'], permission_classes=[])
    def register(self, request):
        """Registro de novo beneficiário"""
        serializer = BeneficiaryRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            beneficiary = serializer.save()
            return Response({
                'message': 'Registro realizado com sucesso',
                'beneficiary_id': beneficiary.id
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Obter perfil do beneficiário logado"""
        try:
            profile = request.user.beneficiary_profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except BeneficiaryProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de beneficiário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard_stats(self, request):
        """Estatísticas para o dashboard do beneficiário"""
        try:
            profile = request.user.beneficiary_profile
            
            # Estatísticas das solicitações
            support_requests = SupportRequest.objects.filter(beneficiary=profile)
            
            stats = {
                'profile': BeneficiaryProfileSerializer(profile).data,
                'requests_count': support_requests.count(),
                'pending_requests': support_requests.filter(status='pendente').count(),
                'approved_requests': support_requests.filter(status='aprovada').count(),
                'completed_requests': support_requests.filter(status='concluida').count(),
                'unread_messages': BeneficiaryCommunication.objects.filter(
                    support_request__beneficiary=profile,
                    is_read=False
                ).exclude(sender=request.user).count(),
                'recent_requests': SupportRequestSerializer(
                    support_requests.order_by('-requested_date')[:5], many=True
                ).data
            }
            
            return Response(stats)
        except BeneficiaryProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de beneficiário não encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def admin_stats(self, request):
        """Estatísticas para administradores"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Acesso negado'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Estatísticas gerais
        total_beneficiaries = BeneficiaryProfile.objects.count()
        verified_beneficiaries = BeneficiaryProfile.objects.filter(is_verified=True).count()
        pending_requests = SupportRequest.objects.filter(status='pendente').count()
        overdue_requests = SupportRequest.objects.filter(
            needed_by_date__lt=timezone.now().date(),
            status__in=['pendente', 'em_analise', 'aprovada', 'em_andamento']
        ).count()

        # Distribuição por vulnerabilidade
        vulnerability_distribution = {}
        for profile in BeneficiaryProfile.objects.all():
            score = profile.vulnerability_score
            if score >= 7:
                level = 'alta'
            elif score >= 4:
                level = 'media'
            else:
                level = 'baixa'
            vulnerability_distribution[level] = vulnerability_distribution.get(level, 0) + 1

        # Estatísticas por tipo de solicitação
        request_types = SupportRequest.objects.values('request_type').annotate(
            count=Count('id')
        ).order_by('-count')

        # Estatísticas por localização
        location_stats = BeneficiaryProfile.objects.values('district').annotate(
            count=Count('id')
        ).order_by('-count')[:10]

        stats = {
            'total_beneficiaries': total_beneficiaries,
            'verified_beneficiaries': verified_beneficiaries,
            'pending_requests': pending_requests,
            'overdue_requests': overdue_requests,
            'vulnerability_distribution': vulnerability_distribution,
            'request_types': list(request_types),
            'top_locations': list(location_stats),
            'verification_rate': round((verified_beneficiaries / total_beneficiaries * 100) if total_beneficiaries > 0 else 0, 1)
        }

        return Response(stats)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request, pk=None):
        """Verificar perfil de beneficiário (apenas administradores)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Acesso negado'},
                status=status.HTTP_403_FORBIDDEN
            )

        beneficiary = self.get_object()
        beneficiary.is_verified = True
        beneficiary.verification_date = timezone.now()
        beneficiary.verified_by = request.user
        beneficiary.save()

        return Response({'message': 'Beneficiário verificado com sucesso'})


class SupportRequestViewSet(viewsets.ModelViewSet):
    serializer_class = SupportRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return SupportRequest.objects.all()
        else:
            # Beneficiários só podem ver suas próprias solicitações
            return SupportRequest.objects.filter(beneficiary__user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return SupportRequestCreateSerializer
        return SupportRequestSerializer

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Atualizar status da solicitação (apenas administradores)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Acesso negado'},
                status=status.HTTP_403_FORBIDDEN
            )

        support_request = self.get_object()
        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes', '')

        if new_status not in dict(SupportRequest.STATUS_CHOICES):
            return Response(
                {'error': 'Status inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Atualizar campos baseado no status
        support_request.status = new_status
        support_request.admin_notes = admin_notes
        support_request.reviewed_by = request.user
        support_request.reviewed_at = timezone.now()

        if new_status == 'em_andamento' and not support_request.started_at:
            support_request.started_at = timezone.now()
            support_request.assigned_to = request.user

        elif new_status == 'concluida' and not support_request.completed_at:
            support_request.completed_at = timezone.now()
            # Capturar valores reais se fornecidos
            if 'actual_cost' in request.data:
                support_request.actual_cost = request.data['actual_cost']
            if 'actual_beneficiaries' in request.data:
                support_request.actual_beneficiaries = request.data['actual_beneficiaries']

        support_request.save()

        return Response({'message': f'Status atualizado para {support_request.get_status_display()}'})

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Aprovar solicitação"""
        support_request = self.get_object()
        
        if support_request.status != 'pendente':
            return Response(
                {'error': 'Apenas solicitações pendentes podem ser aprovadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar status
        support_request.status = 'aprovada'
        support_request.reviewed_by = request.user
        support_request.reviewed_at = timezone.now()
        
        # Adicionar notas se fornecidas
        admin_notes = request.data.get('admin_notes')
        if admin_notes:
            support_request.admin_notes = admin_notes
        
        support_request.save()
        
        return Response({
            'message': 'Solicitação aprovada com sucesso',
            'status': support_request.status
        })

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Rejeitar solicitação"""
        support_request = self.get_object()
        
        if support_request.status != 'pendente':
            return Response(
                {'error': 'Apenas solicitações pendentes podem ser rejeitadas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Atualizar status
        support_request.status = 'rejeitada'
        support_request.reviewed_by = request.user
        support_request.reviewed_at = timezone.now()
        
        # Adicionar notas se fornecidas
        admin_notes = request.data.get('admin_notes')
        if admin_notes:
            support_request.admin_notes = admin_notes
        
        support_request.save()
        
        return Response({
            'message': 'Solicitação rejeitada com sucesso',
            'status': support_request.status
        })

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def pending(self, request):
        """Solicitações pendentes (para administradores)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Acesso negado'},
                status=status.HTTP_403_FORBIDDEN
            )

        pending_requests = SupportRequest.objects.filter(status='pendente').order_by('-requested_date')
        serializer = self.get_serializer(pending_requests, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def overdue(self, request):
        """Solicitações em atraso (para administradores)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Acesso negado'},
                status=status.HTTP_403_FORBIDDEN
            )

        overdue_requests = SupportRequest.objects.filter(
            needed_by_date__lt=timezone.now().date(),
            status__in=['pendente', 'em_analise', 'aprovada', 'em_andamento']
        ).order_by('needed_by_date')
        
        serializer = self.get_serializer(overdue_requests, many=True)
        return Response(serializer.data)


class BeneficiaryCommunicationViewSet(viewsets.ModelViewSet):
    serializer_class = BeneficiaryCommunicationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return BeneficiaryCommunication.objects.all()
        else:
            # Beneficiários só podem ver comunicações de suas solicitações
            return BeneficiaryCommunication.objects.filter(
                support_request__beneficiary__user=self.request.user
            )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Marcar mensagem como lida"""
        communication = self.get_object()
        communication.is_read = True
        communication.read_at = timezone.now()
        communication.save()
        return Response({'message': 'Mensagem marcada como lida'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Contar mensagens não lidas"""
        if request.user.is_staff:
            # Administradores: mensagens de beneficiários não lidas
            count = BeneficiaryCommunication.objects.filter(
                is_read=False,
                sender__beneficiary_profile__isnull=False
            ).count()
        else:
            # Beneficiários: mensagens de administradores não lidas
            count = BeneficiaryCommunication.objects.filter(
                support_request__beneficiary__user=request.user,
                is_read=False
            ).exclude(sender=request.user).count()
        
        return Response({'unread_count': count})


class BeneficiaryDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = BeneficiaryDocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return BeneficiaryDocument.objects.all()
        else:
            # Beneficiários só podem ver seus próprios documentos
            return BeneficiaryDocument.objects.filter(beneficiary__user=self.request.user)

    def perform_create(self, serializer):
        # Associar automaticamente ao beneficiário logado
        serializer.save(beneficiary=self.request.user.beneficiary_profile)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request, pk=None):
        """Verificar documento (apenas administradores)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Acesso negado'},
                status=status.HTTP_403_FORBIDDEN
            )

        document = self.get_object()
        document.verified = True
        document.verified_by = request.user
        document.verified_at = timezone.now()
        document.save()

        return Response({'message': 'Documento verificado com sucesso'})


# ===== ENDPOINTS ADMINISTRATIVOS =====

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_beneficiaries_stats(request):
    """Estatísticas administrativas do sistema de beneficiários"""
    try:
        total_beneficiaries = BeneficiaryProfile.objects.count()
        verified_beneficiaries = BeneficiaryProfile.objects.filter(is_verified=True).count()
        pending_verification = total_beneficiaries - verified_beneficiaries
        
        total_requests = SupportRequest.objects.count()
        pending_requests = SupportRequest.objects.filter(status='pendente').count()
        approved_requests = SupportRequest.objects.filter(status='aprovada').count()
        rejected_requests = SupportRequest.objects.filter(status='rejeitada').count()
        urgent_requests = SupportRequest.objects.filter(
            urgency__in=['alta', 'critica'],
            status__in=['pendente', 'em_analise']
        ).count()
        
        stats = {
            'total_beneficiaries': total_beneficiaries,
            'verified_beneficiaries': verified_beneficiaries,
            'pending_verification': pending_verification,
            'total_requests': total_requests,
            'pending_requests': pending_requests,
            'approved_requests': approved_requests,
            'rejected_requests': rejected_requests,
            'urgent_requests': urgent_requests,
        }
        
        return Response(stats)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminBeneficiaryViewSet(viewsets.ModelViewSet):
    """ViewSet administrativo para gerenciar beneficiários"""
    queryset = BeneficiaryProfile.objects.all().select_related('user')
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        """Usar serializer completo para dados administrativos"""
        from .serializers import BeneficiaryProfileCompleteSerializer
        return BeneficiaryProfileCompleteSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) |
                Q(district__icontains=search) |
                Q(user__username__icontains=search) |
                Q(user__email__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search)
            )
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['patch'])
    def verify(self, request, pk=None):
        """Verificar beneficiário"""
        beneficiary = self.get_object()
        beneficiary.is_verified = True
        beneficiary.verified_by = request.user
        beneficiary.verification_date = timezone.now()
        beneficiary.save()
        
        return Response({'message': 'Beneficiário verificado com sucesso'})
    
    @action(detail=True, methods=['patch'])
    def unverify(self, request, pk=None):
        """Remover verificação do beneficiário"""
        beneficiary = self.get_object()
        beneficiary.is_verified = False
        beneficiary.verified_by = None
        beneficiary.verification_date = None
        beneficiary.save()
        
        return Response({'message': 'Verificação removida com sucesso'})


class AdminSupportRequestViewSet(viewsets.ModelViewSet):
    """ViewSet administrativo para gerenciar solicitações de apoio"""
    queryset = SupportRequest.objects.all().select_related('beneficiary__user', 'reviewed_by', 'assigned_to')
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        """Usar serializer completo para dados administrativos"""
        from .serializers import SupportRequestCompleteSerializer
        return SupportRequestCompleteSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filtros
        status_filter = self.request.query_params.get('status', None)
        urgency_filter = self.request.query_params.get('urgency', None)
        type_filter = self.request.query_params.get('type', None)
        search = self.request.query_params.get('search', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if urgency_filter:
            queryset = queryset.filter(urgency=urgency_filter)
        if type_filter:
            queryset = queryset.filter(request_type=type_filter)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(beneficiary__full_name__icontains=search) |
                Q(beneficiary__user__username__icontains=search) |
                Q(beneficiary__user__email__icontains=search)
            )
            
        return queryset.order_by('-requested_date')
    
    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        """Aprovar solicitação"""
        support_request = self.get_object()
        admin_notes = request.data.get('admin_notes', '')
        
        support_request.status = 'aprovada'
        support_request.reviewed_by = request.user
        support_request.reviewed_at = timezone.now()
        support_request.admin_notes = admin_notes
        support_request.save()
        
        # Aqui você pode adicionar lógica para notificar o beneficiário
        
        return Response({'message': 'Solicitação aprovada com sucesso'})
    
    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        """Rejeitar solicitação"""
        support_request = self.get_object()
        admin_notes = request.data.get('admin_notes', '')
        
        if not admin_notes:
            return Response(
                {'error': 'Notas administrativas são obrigatórias para rejeição'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        support_request.status = 'rejeitada'
        support_request.reviewed_by = request.user
        support_request.reviewed_at = timezone.now()
        support_request.admin_notes = admin_notes
        support_request.save()
        
        # Aqui você pode adicionar lógica para notificar o beneficiário
        
        return Response({'message': 'Solicitação rejeitada com sucesso'})
    
    @action(detail=True, methods=['patch'])
    def start_processing(self, request, pk=None):
        """Iniciar processamento da solicitação"""
        support_request = self.get_object()
        
        if support_request.status != 'aprovada':
            return Response(
                {'error': 'Solicitação deve estar aprovada para iniciar processamento'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        support_request.status = 'em_andamento'
        support_request.assigned_to = request.user
        support_request.started_at = timezone.now()
        support_request.save()
        
        return Response({'message': 'Processamento iniciado com sucesso'})
    
    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        """Marcar solicitação como concluída"""
        support_request = self.get_object()
        actual_cost = request.data.get('actual_cost')
        actual_beneficiaries = request.data.get('actual_beneficiaries')
        admin_notes = request.data.get('admin_notes', '')
        
        support_request.status = 'concluida'
        support_request.completed_at = timezone.now()
        
        if actual_cost:
            support_request.actual_cost = actual_cost
        if actual_beneficiaries:
            support_request.actual_beneficiaries = actual_beneficiaries
        if admin_notes:
            support_request.admin_notes = admin_notes
            
        support_request.save()
        
        return Response({'message': 'Solicitação marcada como concluída'})


class AdminBeneficiaryCommunicationViewSet(viewsets.ModelViewSet):
    """ViewSet administrativo para gerenciar comunicações"""
    queryset = BeneficiaryCommunication.objects.all().select_related('support_request__beneficiary', 'sender')
    serializer_class = BeneficiaryCommunicationSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        support_request_id = self.request.query_params.get('support_request', None)
        if support_request_id:
            queryset = queryset.filter(support_request_id=support_request_id)
        return queryset.order_by('-created_at')
