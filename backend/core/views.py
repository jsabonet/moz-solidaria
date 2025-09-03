from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.db.models import Q, Count
from django.utils import timezone
from datetime import timedelta
import json

from rest_framework import status, generics, viewsets, permissions
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import (
    UserProfile, Cause, Skill, Certification, Donor, Beneficiary, 
    Volunteer, VolunteerCertification, Partner, Program, ProjectCategory,
    AuditLog, LoginAttempt
)
from .serializers import (
    UserProfileSerializer, CauseSerializer, SkillSerializer, CertificationSerializer,
    DonorSerializer, BeneficiarySerializer, VolunteerSerializer, PartnerSerializer,
    UserRegistrationSerializer, DonorRegistrationSerializer, BeneficiaryRegistrationSerializer,
    VolunteerRegistrationSerializer, PartnerRegistrationSerializer, ProgramSerializer, 
    ProjectCategorySerializer
)
from .decorators import require_permission, require_any_permission
from .permissions import SYSTEM_PERMISSIONS, GROUPS_PERMISSIONS

User = get_user_model()


# =====================================
# VIEWS EXISTENTES
# =====================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    Retorna informações do usuário autenticado
    """
    user = request.user
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
    })


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Atualiza informações do usuário autenticado
    """
    user = request.user
    data = request.data
    
    # Campos que o usuário pode atualizar
    allowed_fields = ['first_name', 'last_name', 'email']
    
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    user.save()
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
    })


# =====================================
# SISTEMA DE PERFIS DE USUÁRIO
# =====================================

class UserRegistrationView(APIView):
    """
    Registro de novos usuários com diferentes tipos de perfil
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuário criado com sucesso',
                'user_id': user.id,
                'user_type': request.data['user_type']
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileCompletionView(APIView):
    """
    Completar perfil específico após registro inicial
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user_profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil de usuário não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        user_type = user_profile.user_type
        
        if user_type == 'donor':
            return self._complete_donor_profile(request, user_profile)
        elif user_type == 'beneficiary':
            return self._complete_beneficiary_profile(request, user_profile)
        elif user_type == 'volunteer':
            return self._complete_volunteer_profile(request, user_profile)
        elif user_type == 'partner':
            return self._complete_partner_profile(request, user_profile)
        else:
            return Response(
                {'error': 'Tipo de usuário inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _complete_donor_profile(self, request, user_profile):
        serializer = DonorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            donor = Donor.objects.get(user_profile=user_profile)
            
            # Atualizar dados do doador
            for field, value in serializer.validated_data.items():
                if field == 'preferred_causes':
                    causes = Cause.objects.filter(id__in=value)
                    donor.preferred_causes.set(causes)
                else:
                    setattr(donor, field, value)
            
            donor.save()
            return Response({'message': 'Perfil de doador completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _complete_beneficiary_profile(self, request, user_profile):
        serializer = BeneficiaryRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            beneficiary = Beneficiary.objects.get(user_profile=user_profile)
            
            # Atualizar dados do beneficiário
            for field, value in serializer.validated_data.items():
                setattr(beneficiary, field, value)
            
            beneficiary.save()
            return Response({'message': 'Perfil de beneficiário completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _complete_volunteer_profile(self, request, user_profile):
        serializer = VolunteerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            volunteer = Volunteer.objects.get(user_profile=user_profile)
            
            # Atualizar dados do voluntário
            for field, value in serializer.validated_data.items():
                if field == 'skills':
                    skills = Skill.objects.filter(id__in=value)
                    volunteer.skills.set(skills)
                elif field == 'preferred_causes':
                    causes = Cause.objects.filter(id__in=value)
                    volunteer.preferred_causes.set(causes)
                else:
                    setattr(volunteer, field, value)
            
            volunteer.save()
            return Response({'message': 'Perfil de voluntário completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _complete_partner_profile(self, request, user_profile):
        serializer = PartnerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            partner = Partner.objects.get(user_profile=user_profile)
            
            # Atualizar dados do parceiro
            for field, value in serializer.validated_data.items():
                if field == 'areas_of_expertise':
                    causes = Cause.objects.filter(id__in=value)
                    partner.areas_of_expertise.set(causes)
                else:
                    setattr(partner, field, value)
            
            partner.save()
            return Response({'message': 'Perfil de parceiro completado com sucesso'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de usuário
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Usuários só podem ver seus próprios perfis (ou admins podem ver todos)
        if self.request.user.is_staff:
            return UserProfile.objects.all()
        return UserProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil do usuário autenticado"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Perfil não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class CauseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar causas (somente leitura)
    """
    queryset = Cause.objects.filter(is_active=True)
    serializer_class = CauseSerializer
    permission_classes = [AllowAny]


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar habilidades (somente leitura)
    """
    queryset = Skill.objects.filter(is_active=True)
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]


class CertificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar certificações (somente leitura)
    """
    queryset = Certification.objects.filter(is_active=True)
    serializer_class = CertificationSerializer
    permission_classes = [AllowAny]


class DonorViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de doadores
    """
    serializer_class = DonorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Donor.objects.all()
        return Donor.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de doador do usuário autenticado"""
        try:
            donor = Donor.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(donor)
            return Response(serializer.data)
        except Donor.DoesNotExist:
            return Response(
                {'error': 'Perfil de doador não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BeneficiaryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de beneficiários
    """
    serializer_class = BeneficiarySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Beneficiary.objects.all()
        return Beneficiary.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de beneficiário do usuário autenticado"""
        try:
            beneficiary = Beneficiary.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(beneficiary)
            return Response(serializer.data)
        except Beneficiary.DoesNotExist:
            return Response(
                {'error': 'Quase lá, conclua as seguintes etapas para validar seu perfil de beneficiário.'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class VolunteerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de voluntários
    """
    serializer_class = VolunteerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Volunteer.objects.all()
        return Volunteer.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de voluntário do usuário autenticado"""
        try:
            volunteer = Volunteer.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(volunteer)
            return Response(serializer.data)
        except Volunteer.DoesNotExist:
            return Response(
                {'error': 'Perfil de voluntário não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class PartnerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar perfis de parceiros
    """
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Partner.objects.all()
        return Partner.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Retorna o perfil de parceiro do usuário autenticado"""
        try:
            partner = Partner.objects.get(user_profile__user=request.user)
            serializer = self.get_serializer(partner)
            return Response(serializer.data)
        except Partner.DoesNotExist:
            return Response(
                {'error': 'Perfil de parceiro não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )


# =====================================
# VIEWS DE DASHBOARD
# =====================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Retorna estatísticas para o dashboard baseadas no tipo de usuário
    """
    try:
        user_profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response(
            {'error': 'Perfil de usuário não encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    user_type = user_profile.user_type
    
    if user_type == 'donor':
        return _get_donor_stats(request.user)
    elif user_type == 'beneficiary':
        return _get_beneficiary_stats(request.user)
    elif user_type == 'volunteer':
        return _get_volunteer_stats(request.user)
    elif user_type == 'partner':
        return _get_partner_stats(request.user)
    else:
        return Response({'stats': {}})


def _get_donor_stats(user):
    """Estatísticas para doadores"""
    try:
        donor = Donor.objects.get(user_profile__user=user)
        return Response({
            'total_donated': donor.total_donated,
            'first_donation': donor.first_donation_date,
            'last_donation': donor.last_donation_date,
            'preferred_causes_count': donor.preferred_causes.count(),
            'user_type': 'donor'
        })
    except Donor.DoesNotExist:
        return Response({'error': 'Perfil de doador não encontrado'}, status=404)


def _get_beneficiary_stats(user):
    """Estatísticas para beneficiários"""
    try:
        beneficiary = Beneficiary.objects.get(user_profile__user=user)
        return Response({
            'family_size': beneficiary.family_size,
            'community': beneficiary.community,
            'verification_status': beneficiary.verification_status,
            'children_count': beneficiary.children_count,
            'user_type': 'beneficiary'
        })
    except Beneficiary.DoesNotExist:
        return Response({'error': 'Perfil de beneficiário não encontrado'}, status=404)


def _get_volunteer_stats(user):
    """Estatísticas para voluntários"""
    try:
        volunteer = Volunteer.objects.get(user_profile__user=user)
        return Response({
            'total_hours': volunteer.total_hours,
            'projects_completed': volunteer.projects_completed,
            'rating': volunteer.rating,
            'skills_count': volunteer.skills.count(),
            'user_type': 'volunteer'
        })
    except Volunteer.DoesNotExist:
        return Response({'error': 'Perfil de voluntário não encontrado'}, status=404)


def _get_partner_stats(user):
    """Estatísticas para parceiros"""
    try:
        partner = Partner.objects.get(user_profile__user=user)
        return Response({
            'organization_name': partner.organization_name,
            'partnership_level': partner.partnership_level,
            'areas_of_expertise_count': partner.areas_of_expertise.count(),
            'partnership_start_date': partner.partnership_start_date,
            'user_type': 'partner'
        })
    except Partner.DoesNotExist:
        return Response({'error': 'Perfil de parceiro não encontrado'}, status=404)


# =====================================
# PROGRAM & PROJECT CATEGORIES VIEWS
# =====================================

class ProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar programas
    """
    queryset = Program.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny]  # Público para seleção em formulários


# ========== VIEWS PARA GESTÃO DE USUÁRIOS E PERMISSÕES ==========

@method_decorator([login_required, require_permission('system.manage_users')], name='dispatch')
class UserManagementView(View):
    """View para gestão de usuários"""
    
    def get(self, request):
        """Lista usuários com suas permissões"""
        users = User.objects.select_related('profile').prefetch_related('groups', 'user_permissions')
        
        users_data = []
        for user in users:
            # Cria perfil se não existir
            profile, created = UserProfile.objects.get_or_create(user=user)
            
            users_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'groups': [g.name for g in user.groups.all()],
                'permissions': list(user.get_all_permissions()),
                'profile': {
                    'phone': profile.phone,
                    'department': profile.department,
                    'position': profile.position,
                    'location': profile.location,
                    'is_active_admin': profile.is_active_admin,
                    'last_permission_change': profile.last_permission_change.isoformat() if profile.last_permission_change else None
                }
            })
        
        return JsonResponse({
            'users': users_data,
            'total': len(users_data)
        })
    
    def post(self, request):
        """Cria novo usuário"""
        try:
            data = json.loads(request.body)
            
            # Validações básicas
            required_fields = ['username', 'email', 'password']
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({'error': f'Campo {field} é obrigatório'}, status=400)
            
            # Verifica se usuário já existe
            if User.objects.filter(username=data['username']).exists():
                return JsonResponse({'error': 'Nome de usuário já existe'}, status=400)
            
            if User.objects.filter(email=data['email']).exists():
                return JsonResponse({'error': 'Email já está em uso'}, status=400)
            
            # Cria usuário
            user = User.objects.create_user(
                username=data['username'],
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                is_active=data.get('is_active', True)
            )
            
            # Cria perfil
            profile_data = data.get('profile', {})
            UserProfile.objects.create(
                user=user,
                phone=profile_data.get('phone'),
                department=profile_data.get('department'),
                position=profile_data.get('position'),
                location=profile_data.get('location'),
                is_active_admin=profile_data.get('is_active_admin', False)
            )
            
            # Adiciona a grupos se especificado
            groups = data.get('groups', [])
            for group_name in groups:
                try:
                    group = Group.objects.get(name=group_name)
                    user.groups.add(group)
                except Group.DoesNotExist:
                    pass
            
            # Log da criação
            AuditLog.log_action(
                user=request.user,
                action='CREATE',
                module='USERS',
                object_type='User',
                object_id=user.id,
                object_name=user.username,
                changes=data,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT')
            )
            
            return JsonResponse({
                'message': 'Usuário criado com sucesso',
                'user_id': user.id
            })
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados JSON inválidos'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


@login_required
@require_permission('system.view_logs')
def audit_logs_view(request):
    """View para visualizar logs de auditoria"""
    
    # Parâmetros de filtro
    page = int(request.GET.get('page', 1))
    per_page = int(request.GET.get('per_page', 50))
    user_filter = request.GET.get('user')
    action_filter = request.GET.get('action')
    module_filter = request.GET.get('module')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # Query base
    logs = AuditLog.objects.select_related('user').all()
    
    # Aplicar filtros
    if user_filter:
        logs = logs.filter(user__username__icontains=user_filter)
    
    if action_filter:
        logs = logs.filter(action=action_filter)
    
    if module_filter:
        logs = logs.filter(module=module_filter)
    
    if date_from:
        logs = logs.filter(timestamp__gte=date_from)
    
    if date_to:
        logs = logs.filter(timestamp__lte=date_to)
    
    # Paginação
    total = logs.count()
    start = (page - 1) * per_page
    end = start + per_page
    logs = logs[start:end]
    
    # Serializar dados
    logs_data = []
    for log in logs:
        logs_data.append({
            'id': log.id,
            'user': log.user.username,
            'action': log.action,
            'module': log.module,
            'object_type': log.object_type,
            'object_id': log.object_id,
            'object_name': log.object_name,
            'changes': log.changes,
            'ip_address': log.ip_address,
            'timestamp': log.timestamp.isoformat(),
            'success': log.success,
            'error_message': log.error_message
        })
    
    return JsonResponse({
        'logs': logs_data,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page
        }
    })


@login_required
@require_permission('system.view_stats')
def system_stats_view(request):
    """View para estatísticas do sistema"""
    
    # Estatísticas de usuários
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    admin_users = User.objects.filter(is_staff=True).count()
    
    # Estatísticas de login dos últimos 30 dias
    thirty_days_ago = timezone.now() - timedelta(days=30)
    recent_logins = LoginAttempt.objects.filter(timestamp__gte=thirty_days_ago, success=True).count()
    failed_logins = LoginAttempt.objects.filter(timestamp__gte=thirty_days_ago, success=False).count()
    
    # Estatísticas de auditoria
    total_audit_logs = AuditLog.objects.count()
    recent_activities = AuditLog.objects.filter(timestamp__gte=thirty_days_ago).count()
    
    # Atividades por módulo
    module_activities = AuditLog.objects.filter(
        timestamp__gte=thirty_days_ago
    ).values('module').annotate(count=Count('id')).order_by('-count')
    
    # Usuários mais ativos
    active_users_stats = AuditLog.objects.filter(
        timestamp__gte=thirty_days_ago
    ).values('user__username').annotate(count=Count('id')).order_by('-count')[:10]
    
    return JsonResponse({
        'users': {
            'total': total_users,
            'active': active_users,
            'admin': admin_users
        },
        'logins': {
            'successful_last_30_days': recent_logins,
            'failed_last_30_days': failed_logins
        },
        'audit': {
            'total_logs': total_audit_logs,
            'recent_activities': recent_activities
        },
        'module_activities': list(module_activities),
        'most_active_users': list(active_users_stats)
    })


@login_required
def groups_and_permissions_view(request):
    """View para listar grupos e permissões disponíveis"""
    
    # Lista todos os grupos
    groups = Group.objects.prefetch_related('permissions').all()
    groups_data = []
    
    for group in groups:
        groups_data.append({
            'id': group.id,
            'name': group.name,
            'permissions': [p.codename for p in group.permissions.all()],
            'users_count': group.user_set.count()
        })
    
    # Lista todas as permissões do sistema
    permissions = Permission.objects.select_related('content_type').all()
    permissions_data = []
    
    for perm in permissions:
        permissions_data.append({
            'id': perm.id,
            'codename': perm.codename,
            'name': perm.name,
            'content_type': perm.content_type.model
        })
    
    return JsonResponse({
        'groups': groups_data,
        'permissions': permissions_data,
        'system_permissions': SYSTEM_PERMISSIONS,
        'groups_permissions': GROUPS_PERMISSIONS
    })


@login_required
def my_profile_view(request):
    """View para o perfil do usuário logado"""
    
    if request.method == 'GET':
        # Cria perfil se não existir
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        return JsonResponse({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'date_joined': request.user.date_joined.isoformat(),
                'last_login': request.user.last_login.isoformat() if request.user.last_login else None
            },
            'profile': {
                'phone': profile.phone,
                'department': profile.department,
                'position': profile.position,
                'location': profile.location
            },
            'groups': [g.name for g in request.user.groups.all()],
            'permissions': list(request.user.get_all_permissions())
        })
    
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            
            # Atualiza dados do usuário (campos básicos)
            user_data = data.get('user', {})
            updatable_fields = ['email', 'first_name', 'last_name']
            
            for field in updatable_fields:
                if field in user_data:
                    setattr(request.user, field, user_data[field])
            
            request.user.save()
            
            # Atualiza perfil
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            profile_data = data.get('profile', {})
            
            profile_fields = ['phone', 'department', 'position', 'location']
            for field in profile_fields:
                if field in profile_data:
                    setattr(profile, field, profile_data[field])
            
            profile.save()
            
            return JsonResponse({'message': 'Perfil atualizado com sucesso'})
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Dados JSON inválidos'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar categorias de projetos
    """
    queryset = ProjectCategory.objects.filter(is_active=True).order_by('program__order', 'order', 'name')
    serializer_class = ProjectCategorySerializer
    permission_classes = [AllowAny]  # Público para seleção em formulários
    
    def get_queryset(self):
        queryset = super().get_queryset()
        program_id = self.request.query_params.get('program_id', None)
        if program_id is not None:
            queryset = queryset.filter(program_id=program_id)
        return queryset
