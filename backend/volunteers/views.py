# backend/volunteers/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q, Count, Avg
from django.db import IntegrityError
from django.utils import timezone
from .models import (
    VolunteerSkill, VolunteerOpportunity, VolunteerProfile, 
    VolunteerParticipation, VolunteerAchievement
)
from .serializers import (
    VolunteerSkillSerializer, VolunteerOpportunitySerializer,
    VolunteerProfileSerializer, VolunteerParticipationSerializer,
    VolunteerAchievementSerializer, VolunteerStatsSerializer,
    ParticipationUpdateSerializer, ManualMetricsAdjustmentSerializer
)


class VolunteerSkillViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar habilidades de voluntários"""
    queryset = VolunteerSkill.objects.all()
    serializer_class = VolunteerSkillSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Admin pode criar/editar/deletar, voluntários podem apenas listar"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]


class VolunteerOpportunityViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar oportunidades de voluntariado"""
    queryset = VolunteerOpportunity.objects.all()
    serializer_class = VolunteerOpportunitySerializer
    
    def get_permissions(self):
        """Admin pode criar/editar/deletar, voluntários podem listar e se candidatar"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Filtrar oportunidades baseado em parâmetros de query"""
        queryset = VolunteerOpportunity.objects.all()
        
        # Filtros
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        urgency_filter = self.request.query_params.get('urgency')
        if urgency_filter:
            queryset = queryset.filter(urgency_level=urgency_filter)
        
        # Para voluntários, mostrar apenas oportunidades abertas por padrão
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            if not status_filter:
                queryset = queryset.filter(status='open')
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Voluntário se candidatar a uma oportunidade"""
        opportunity = self.get_object()
        
        if opportunity.status != 'open':
            return Response(
                {'error': 'Esta oportunidade não está mais aberta para candidaturas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar ou obter perfil do voluntário
        volunteer_profile, created = VolunteerProfile.objects.get_or_create(
            user=request.user
        )
        
        # Verificar se já se candidatou
        existing_participation = VolunteerParticipation.objects.filter(
            volunteer=volunteer_profile,
            opportunity=opportunity
        ).first()
        
        if existing_participation:
            return Response(
                {'error': 'Você já se candidatou para esta oportunidade'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Criar candidatura
        participation_data = {
            'opportunity_id': opportunity.id,
            'application_message': request.data.get('message', ''),
            'status': 'applied'
        }
        
        serializer = VolunteerParticipationSerializer(
            data=participation_data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            participation = serializer.save()
            return Response({
                'message': 'Candidatura enviada com sucesso!',
                'participation_id': participation.id
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VolunteerProfileViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar perfis de voluntários"""
    serializer_class = VolunteerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Voluntários veem apenas seu próprio perfil, admin vê todos"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return VolunteerProfile.objects.all()
        else:
            return VolunteerProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Obter perfil do usuário atual"""
        profile, created = VolunteerProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_skills(self, request):
        """Atualizar habilidades do voluntário"""
        profile, created = VolunteerProfile.objects.get_or_create(user=request.user)
        skill_ids = request.data.get('skill_ids', [])
        
        # Validar se as habilidades existem
        skills = VolunteerSkill.objects.filter(id__in=skill_ids)
        if len(skills) != len(skill_ids):
            return Response(
                {'error': 'Uma ou mais habilidades são inválidas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        profile.skills.set(skills)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Estatísticas para o dashboard do voluntário"""
        profile, created = VolunteerProfile.objects.get_or_create(user=request.user)
        
        # Contar oportunidades disponíveis
        available_opportunities = VolunteerOpportunity.objects.filter(status='open').count()
        
        stats = {
            'total_hours_contributed': profile.total_hours_contributed,
            'total_people_helped': profile.total_people_helped,
            'volunteer_level': profile.volunteer_level,
            'hours_to_next_level': profile.hours_to_next_level,
            'average_rating': profile.average_rating,
            'active_opportunities': profile.participations.filter(
                status__in=['accepted', 'in_progress']
            ).count(),
            'completed_opportunities': profile.participations.filter(
                status='completed'
            ).count(),
            'available_opportunities': available_opportunities,
            'achievements_count': profile.achievements.count()
        }
        
        serializer = VolunteerStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def manual_adjust(self, request, pk=None):
        """Administrador ajusta horas/pessoas/nota criando uma participação de ajuste.
        Não altera participações existentes para manter histórico."""
        profile = self.get_object()
        serializer = ManualMetricsAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        # Criar SEMPRE uma nova oportunidade de ajuste única para evitar conflito unique_together
        timestamp = timezone.now().strftime('%Y%m%d%H%M%S%f')
        adjustment_opportunity = VolunteerOpportunity.objects.create(
            title=f'[AJUSTE] {profile.user_id} {timestamp}',
            description='Registro automático para ajuste administrativo individual',
            estimated_hours=data.get('added_hours') or 0,
            people_helped_estimate=data.get('added_people_helped') or 0,
            urgency_level='low',
            status='completed',
            created_by=request.user,
        )
        try:
            participation = VolunteerParticipation.objects.create(
                volunteer=profile,
                opportunity=adjustment_opportunity,
                status='completed',
                actual_hours=data.get('added_hours') or 0,
                people_helped=data.get('added_people_helped') or 0,
                admin_rating=data.get('admin_rating'),
                admin_notes=f"Ajuste manual: {data.get('notes', '')}"[:500]
            )
        except IntegrityError:
            # Fallback improvável agora, mas caso ocorra reutiliza atualização de participação existente
            existing = VolunteerParticipation.objects.filter(
                volunteer=profile, opportunity=adjustment_opportunity
            ).first()
            if existing:
                existing.actual_hours = (existing.actual_hours or 0) + (data.get('added_hours') or 0)
                existing.people_helped = (existing.people_helped or 0) + (data.get('added_people_helped') or 0)
                if data.get('admin_rating'):
                    existing.admin_rating = data.get('admin_rating')
                existing.admin_notes = (existing.admin_notes or '') + f"\nAjuste manual adicional: {data.get('notes', '')}"[:500]
                existing.save()
                participation = existing
            else:
                return Response({'error': 'Falha ao registrar ajuste.'}, status=500)

        return Response({
            'message': 'Ajuste aplicado com sucesso',
            'participation_id': participation.id,
            'new_totals': {
                'total_hours_contributed': profile.total_hours_contributed,
                'total_people_helped': profile.total_people_helped,
                'average_rating': profile.average_rating,
                'volunteer_level': profile.volunteer_level,
            }
        }, status=status.HTTP_201_CREATED)


class VolunteerParticipationViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar participações em voluntariado"""
    serializer_class = VolunteerParticipationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar participações baseado no usuário"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            queryset = VolunteerParticipation.objects.all()
        else:
            # Voluntários veem apenas suas próprias participações
            queryset = VolunteerParticipation.objects.filter(
                volunteer__user=self.request.user
            )
        
        # Filtros opcionais
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def accept_application(self, request, pk=None):
        """Admin aceitar candidatura de voluntário"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Apenas administradores podem aceitar candidaturas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        participation = self.get_object()
        
        if participation.status != 'applied':
            return Response(
                {'error': 'Esta candidatura não pode ser aceita'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participation.status = 'accepted'
        participation.start_date = timezone.now()
        participation.save()
        
        return Response({
            'message': 'Candidatura aceita com sucesso!',
            'status': participation.status
        })
    
    @action(detail=True, methods=['post'])
    def reject_application(self, request, pk=None):
        """Admin rejeitar candidatura de voluntário"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Apenas administradores podem rejeitar candidaturas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        participation = self.get_object()
        
        if participation.status != 'applied':
            return Response(
                {'error': 'Esta candidatura não pode ser rejeitada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participation.status = 'rejected'
        participation.admin_notes = request.data.get('reason', '')
        participation.save()
        
        return Response({
            'message': 'Candidatura rejeitada',
            'status': participation.status
        })
    
    @action(detail=True, methods=['post'])
    def complete_participation(self, request, pk=None):
        """Admin marcar participação como concluída e avaliar"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {'error': 'Apenas administradores podem completar participações'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        participation = self.get_object()
        
        if participation.status not in ['accepted', 'in_progress']:
            return Response(
                {'error': 'Esta participação não pode ser marcada como concluída'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ParticipationUpdateSerializer(
            participation, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            participation = serializer.save()
            participation.status = 'completed'
            participation.completion_date = timezone.now()
            participation.save()
            
            # Verificar se deve dar conquistas
            self._check_achievements(participation.volunteer)
            
            return Response({
                'message': 'Participação marcada como concluída!',
                'participation': VolunteerParticipationSerializer(participation).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _check_achievements(self, volunteer_profile):
        """Verificar e criar conquistas baseadas no progresso do voluntário"""
        # Conquista por horas
        hours = volunteer_profile.total_hours_contributed
        achievements_to_create = []
        
        if hours >= 10 and not volunteer_profile.achievements.filter(title="Primeiras 10 Horas").exists():
            achievements_to_create.append({
                'title': 'Primeiras 10 Horas',
                'description': 'Completou suas primeiras 10 horas de voluntariado',
                'icon': 'clock'
            })
        
        if hours >= 50 and not volunteer_profile.achievements.filter(title="50 Horas de Dedicação").exists():
            achievements_to_create.append({
                'title': '50 Horas de Dedicação',
                'description': 'Completou 50 horas de trabalho voluntário',
                'icon': 'award'
            })
        
        if hours >= 100 and not volunteer_profile.achievements.filter(title="Centurião do Bem").exists():
            achievements_to_create.append({
                'title': 'Centurião do Bem',
                'description': 'Alcançou a marca de 100 horas de voluntariado',
                'icon': 'star'
            })
        
        # Criar conquistas
        for achievement_data in achievements_to_create:
            VolunteerAchievement.objects.create(
                volunteer=volunteer_profile,
                **achievement_data
            )


class VolunteerAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para visualizar conquistas"""
    serializer_class = VolunteerAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Voluntários veem apenas suas conquistas, admin vê todas"""
        if self.request.user.is_staff or self.request.user.is_superuser:
            return VolunteerAchievement.objects.all()
        else:
            return VolunteerAchievement.objects.filter(
                volunteer__user=self.request.user
            )


class AdminVolunteerDashboardView(viewsets.ViewSet):
    """ViewSet para dashboard administrativo de voluntários"""
    permission_classes = [permissions.IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas gerais para admin"""
        completed_participations = VolunteerParticipation.objects.filter(status='completed').select_related('opportunity')
        total_hours = 0
        total_people = 0
        for p in completed_participations:
            try:
                total_hours += p.actual_hours if p.actual_hours is not None else (p.opportunity.estimated_hours or 0)
            except Exception:
                pass
            try:
                total_people += p.people_helped if p.people_helped is not None else (p.opportunity.people_helped_estimate or 0)
            except Exception:
                pass

        stats = {
            'total_volunteers': VolunteerProfile.objects.filter(is_active=True).count(),
            'active_opportunities': VolunteerOpportunity.objects.filter(status='open').count(),
            'pending_applications': VolunteerParticipation.objects.filter(status='applied').count(),
            'active_participations': VolunteerParticipation.objects.filter(status__in=['accepted', 'in_progress']).count(),
            'completed_participations': completed_participations.count(),
            'total_hours_contributed': total_hours,
            'total_people_helped': total_people,
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def pending_applications(self, request):
        """Listar candidaturas pendentes para revisão"""
        applications = VolunteerParticipation.objects.filter(
            status='applied'
        ).select_related('volunteer__user', 'opportunity').order_by('-created_at')

        simplified = []
        for app in applications:
            simplified.append({
                'id': app.id,
                'volunteer_name': app.volunteer.user.get_full_name() or app.volunteer.user.username,
                'opportunity_title': app.opportunity.title if app.opportunity else '',
                'application_message': app.application_message,
                'created_at': app.created_at,
            })
        return Response(simplified)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def admin_stats(self, request):
        """Estatísticas administrativas do sistema de voluntários"""
        from django.db.models import Sum, Count, Q
        
        stats = {
            'total_volunteers': VolunteerProfile.objects.filter(is_active=True).count(),
            'active_opportunities': VolunteerOpportunity.objects.filter(status='open').count(),
            'pending_applications': VolunteerParticipation.objects.filter(status='applied').count(),
            'active_participations': VolunteerParticipation.objects.filter(status='accepted').count(),
            'completed_participations': VolunteerParticipation.objects.filter(status='completed').count(),
            'total_hours_contributed': VolunteerParticipation.objects.filter(
                status='completed',
                actual_hours__isnull=False
            ).aggregate(total=Sum('actual_hours'))['total'] or 0,
            'total_people_helped': VolunteerParticipation.objects.filter(
                status='completed',
                people_helped__isnull=False
            ).aggregate(total=Sum('people_helped'))['total'] or 0,
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def admin_pending_applications(self, request):
        """Candidaturas pendentes formatadas para admin"""
        applications = VolunteerParticipation.objects.filter(
            status='applied'
        ).select_related('volunteer__user', 'opportunity').order_by('-created_at')
        
        data = []
        for app in applications:
            data.append({
                'id': app.id,
                'volunteer_name': app.volunteer.user.get_full_name() or app.volunteer.user.username,
                'opportunity_title': app.opportunity.title,
                'application_message': app.application_message,
                'created_at': app.created_at,
            })
        
        return Response(data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject_application(self, request, pk=None):
        """Rejeitar uma candidatura"""
        participation = self.get_object()
        if participation.status != 'applied':
            return Response(
                {'error': 'Candidatura não está pendente'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participation.status = 'rejected'
        participation.admin_notes = request.data.get('admin_notes', 'Candidatura rejeitada pelo administrador')
        participation.save()
        
        return Response({'message': 'Candidatura rejeitada com sucesso'})
