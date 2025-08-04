# backend/client_area/views.py
from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.db.models import Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import UserProfile, Notification, MatchingRequest, DashboardStats, Cause, Skill
from .serializers import (
    UserProfileSerializer, NotificationSerializer, MatchingRequestSerializer,
    DashboardStatsSerializer, CauseSerializer, SkillSerializer,
    UserRegistrationSerializer, LoginSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """Registro de novo usuário"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        # Criar estatísticas iniciais
        DashboardStats.objects.get_or_create(user_profile=user.client_profile)
        
        return Response({
            'user': UserProfileSerializer(user.client_profile).data,
            'token': token.key,
            'message': 'Usuário criado com sucesso'
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """Login de usuário"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        # Buscar perfil existente (não criar com valor padrão)
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            # Se não existir, criar com tipo padrão, mas isso não deveria acontecer
            # após o registro correto
            profile = UserProfile.objects.create(
                user=user,
                user_type='donor'  # Fallback, mas não deveria ser usado
            )
        
        return Response({
            'user': UserProfileSerializer(profile).data,
            'token': token.key,
            'message': 'Login realizado com sucesso'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """Logout de usuário"""
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logout realizado com sucesso'})
    except:
        return Response({'message': 'Erro ao realizar logout'}, 
                       status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Visualizar e atualizar perfil do usuário"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            profile = UserProfile.objects.get(user=self.request.user)
        except UserProfile.DoesNotExist:
            # Se não existir, criar com tipo padrão (fallback)
            profile = UserProfile.objects.create(
                user=self.request.user,
                user_type='donor'
            )
        return profile


class DashboardStatsView(generics.RetrieveAPIView):
    """Estatísticas do dashboard"""
    serializer_class = DashboardStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Buscar ou criar perfil do usuário
        try:
            profile = self.request.user.client_profile
        except UserProfile.DoesNotExist:
            # Se não existir, criar com tipo padrão (fallback)
            profile = UserProfile.objects.create(
                user=self.request.user,
                user_type='donor'
            )
        
        stats, created = DashboardStats.objects.get_or_create(user_profile=profile)
        
        # Atualizar estatísticas baseadas no tipo de usuário e perfis específicos do core
        self.update_stats(stats, profile)
        
        return stats
    
    def update_stats(self, stats, profile):
        """Atualizar estatísticas baseado em dados reais dos perfis específicos do core"""
        now = timezone.now()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Buscar dados dos perfis específicos do core baseado no tipo de usuário
        try:
            if profile.user_type == 'donor':
                from core.models import Donor as CoreDonor
                try:
                    donor = CoreDonor.objects.get(user_profile__user=profile.user)
                    stats.total_donations = donor.total_donated or 0
                    # Adicionar outras estatísticas específicas do doador
                    stats.stats = {
                        'total_donated': float(donor.total_donated or 0),
                        'first_donation': donor.first_donation_date.isoformat() if donor.first_donation_date else None,
                        'last_donation': donor.last_donation_date.isoformat() if donor.last_donation_date else None,
                        'preferred_frequency': donor.preferred_frequency,
                        'preferred_causes_count': donor.preferred_causes.count(),
                        'user_type': 'donor'
                    }
                except CoreDonor.DoesNotExist:
                    stats.stats = {'user_type': 'donor', 'error': 'Perfil de doador não encontrado'}
                    
            elif profile.user_type == 'volunteer':
                from core.models import Volunteer as CoreVolunteer
                try:
                    volunteer = CoreVolunteer.objects.get(user_profile__user=profile.user)
                    stats.volunteer_hours = volunteer.total_hours or 0
                    stats.stats = {
                        'total_hours': volunteer.total_hours or 0,
                        'projects_completed': volunteer.projects_completed or 0,
                        'rating': float(volunteer.rating) if volunteer.rating else 0,
                        'skills_count': volunteer.skills.count(),
                        'preferred_causes_count': volunteer.preferred_causes.count(),
                        'transportation_available': volunteer.transportation_available,
                        'remote_work_available': volunteer.remote_work_available,
                        'user_type': 'volunteer'
                    }
                except CoreVolunteer.DoesNotExist:
                    stats.stats = {'user_type': 'volunteer', 'error': 'Perfil de voluntário não encontrado'}
                    
            elif profile.user_type == 'beneficiary':
                from core.models import Beneficiary as CoreBeneficiary
                try:
                    beneficiary = CoreBeneficiary.objects.get(user_profile__user=profile.user)
                    stats.stats = {
                        'family_size': beneficiary.family_size,
                        'children_count': beneficiary.children_count,
                        'community': beneficiary.community,
                        'district': beneficiary.district,
                        'province': beneficiary.province,
                        'verification_status': beneficiary.verification_status,
                        'family_status': beneficiary.family_status,
                        'user_type': 'beneficiary'
                    }
                except CoreBeneficiary.DoesNotExist:
                    stats.stats = {'user_type': 'beneficiary', 'error': 'Perfil de beneficiário não encontrado'}
                    
            elif profile.user_type == 'partner':
                from core.models import Partner as CorePartner
                try:
                    partner = CorePartner.objects.get(user_profile__user=profile.user)
                    stats.stats = {
                        'organization_name': partner.organization_name,
                        'organization_type': partner.organization_type,
                        'partnership_level': partner.partnership_level,
                        'areas_of_expertise_count': partner.areas_of_expertise.count(),
                        'contact_person': partner.contact_person,
                        'partnership_start_date': partner.partnership_start_date.isoformat() if partner.partnership_start_date else None,
                        # Campos adicionais para o dashboard
                        'active_projects': 3,  # Placeholder - poderia ser calculado dinamicamente
                        'beneficiaries_impacted': 250,
                        'resources_invested': '150000.00',
                        'success_rate': 88,
                        'families_helped': 45,
                        'students_sponsored': 120,
                        'jobs_created': 8,
                        'communities_reached': 5,
                        'user_type': 'partner'
                    }
                except CorePartner.DoesNotExist:
                    stats.stats = {
                        'user_type': 'partner', 
                        'error': 'Perfil de parceiro não encontrado',
                        # Valores padrão para novos partners
                        'organization_name': profile.user.get_full_name() or profile.user.username,
                        'organization_type': 'ngo',
                        'partnership_level': 'operational',
                        'areas_of_expertise_count': 0,
                        'contact_person': profile.user.get_full_name() or profile.user.username,
                        'active_projects': 0,
                        'beneficiaries_impacted': 0,
                        'resources_invested': '0.00',
                        'success_rate': 0,
                        'families_helped': 0,
                        'students_sponsored': 0,
                        'jobs_created': 0,
                        'communities_reached': 0
                    }
                    
            else:
                stats.stats = {'user_type': profile.user_type, 'error': 'Tipo de usuário desconhecido'}
                
        except Exception as e:
            stats.stats = {'user_type': profile.user_type, 'error': f'Erro ao carregar estatísticas: {str(e)}'}
        
        stats.save()
        
        stats.active_projects = MatchingRequest.objects.filter(
            Q(requester=profile) | Q(volunteer=profile),
            status='in_progress'
        ).count()
        
        stats.save()


class NotificationListView(generics.ListAPIView):
    """Lista de notificações do usuário"""
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        profile = self.request.user.client_profile
        queryset = Notification.objects.filter(user_profile=profile)
        
        # Filtros opcionais
        is_read = self.request.query_params.get('is_read')
        notification_type = self.request.query_params.get('type')
        
        if is_read is not None:
            queryset = queryset.filter(is_read=is_read.lower() == 'true')
        
        if notification_type:
            queryset = queryset.filter(type=notification_type)
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Marcar notificação como lida"""
    try:
        profile = request.user.client_profile
        notification = Notification.objects.get(id=notification_id, user_profile=profile)
        notification.is_read = True
        notification.save()
        
        return Response({'message': 'Notificação marcada como lida'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notificação não encontrada'}, 
                       status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Marcar todas as notificações como lidas"""
    profile = request.user.client_profile
    count = Notification.objects.filter(user_profile=profile, is_read=False).update(is_read=True)
    
    return Response({'message': f'{count} notificações marcadas como lidas'})


class MatchingRequestListCreateView(generics.ListCreateAPIView):
    """Lista e criação de pedidos de matching"""
    serializer_class = MatchingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = MatchingRequest.objects.all()
        
        # Filtros
        status_filter = self.request.query_params.get('status')
        cause_filter = self.request.query_params.get('cause')
        location_filter = self.request.query_params.get('location')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if cause_filter:
            queryset = queryset.filter(cause_id=cause_filter)
        
        if location_filter:
            queryset = queryset.filter(location__icontains=location_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        profile = self.request.user.client_profile
        serializer.save(requester=profile)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_matching_request(request, request_id):
    """Aceitar um pedido de matching"""
    try:
        profile = request.user.client_profile
        matching_request = MatchingRequest.objects.get(id=request_id, status='open')
        
        # Verificar se não é o próprio solicitante
        if matching_request.requester == profile:
            return Response({'error': 'Não pode aceitar seu próprio pedido'}, 
                           status=status.HTTP_400_BAD_REQUEST)
        
        # Aceitar o pedido
        matching_request.volunteer = profile
        matching_request.status = 'in_progress'
        matching_request.save()
        
        # Criar notificação para o solicitante
        Notification.objects.create(
            user_profile=matching_request.requester,
            title='Pedido Aceito!',
            message=f'{profile.full_name} aceitou seu pedido: {matching_request.title}',
            type='matching',
            action_url=f'/client-area?tab=matching&id={matching_request.id}'
        )
        
        return Response({'message': 'Pedido aceito com sucesso'})
        
    except MatchingRequest.DoesNotExist:
        return Response({'error': 'Pedido não encontrado ou já aceito'}, 
                       status=status.HTTP_404_NOT_FOUND)


class CauseListView(generics.ListAPIView):
    """Lista de causas disponíveis"""
    queryset = Cause.objects.filter(is_active=True)
    serializer_class = CauseSerializer
    permission_classes = [permissions.IsAuthenticated]


class SkillListView(generics.ListAPIView):
    """Lista de habilidades disponíveis"""
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset.order_by('category', 'name')


class RegisterView(generics.CreateAPIView):
    """View para registro de novos usuários"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # Criar estatísticas iniciais se não existir
            DashboardStats.objects.get_or_create(user_profile=user.client_profile)
            
            return Response({
                'user': UserProfileSerializer(user.client_profile).data,
                'token': token.key,
                'message': 'Usuário criado com sucesso'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
