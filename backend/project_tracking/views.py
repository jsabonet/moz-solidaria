# backend/project_tracking/views.py
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, Sum, Avg
from django.http import JsonResponse
from datetime import datetime, timedelta

from .models import (
    ProjectMetrics, ProjectUpdate, ProjectMilestone,
    ProjectEvidence, ProjectGalleryImage, ProjectMetricsEntry
)
from .serializers import (
    ProjectMetricsSerializer, ProjectUpdateSerializer, ProjectMilestoneSerializer,
    ProjectEvidenceSerializer, ProjectGalleryImageSerializer, 
    ProjectMetricsEntrySerializer, ProjectTrackingDataSerializer
)
from .test_serializers import NewProjectTrackingDataSerializer
from core.models import Project

# View de teste
def test_project_data(request, slug):
    """View simples para testar o serializer"""
    try:
        project = Project.objects.select_related('program', 'category').get(slug=slug)
        serializer = ProjectTrackingDataSerializer(project)
        
        return JsonResponse({
            'success': True,
            'data': serializer.data
        })
    except Project.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Project not found'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })

class ProjectTrackingViewSet(viewsets.ModelViewSet):
    """ViewSet principal para dados consolidados de tracking de projetos"""
    queryset = Project.objects.all()
    serializer_class = ProjectTrackingDataSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = Project.objects.prefetch_related(
            'tracking_updates', 'tracking_milestones', 'tracking_gallery_images', 
            'tracking_evidence', 'tracking_metrics_entries'
        ).select_related('metrics', 'program', 'category')
        
        # Filtros opcionais
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset
    
    @action(detail=True, methods=['get'])
    def analytics(self, request, slug=None):
        """Retorna dados analíticos detalhados do projeto"""
        project = self.get_object()
        
        # Métricas do projeto
        try:
            metrics = project.metrics
            metrics_data = ProjectMetricsSerializer(metrics, context={'request': request}).data
        except ProjectMetrics.DoesNotExist:
            metrics_data = None
        
        # Estatísticas de atualizações
        updates_stats = project.tracking_updates.aggregate(
            total=Count('id'),
            published=Count('id', filter=Q(status='published')),
            drafts=Count('id', filter=Q(status='draft'))
        )
        
        # Progresso de milestones
        milestones_stats = project.tracking_milestones.aggregate(
            total=Count('id'),
            completed=Count('id', filter=Q(status='completed')),
            in_progress=Count('id', filter=Q(status='in_progress')),
            pending=Count('id', filter=Q(status='pending'))
        )
        
        # Atividade recente (últimos 30 dias)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_activity = {
            'updates': project.tracking_updates.filter(created_at__gte=thirty_days_ago).count(),
            'images': project.tracking_gallery_images.filter(upload_date__gte=thirty_days_ago).count(),
            'evidence': project.tracking_evidence.filter(upload_date__gte=thirty_days_ago).count(),
            'metrics_entries': project.tracking_metrics_entries.filter(created_at__gte=thirty_days_ago).count()
        }
        
        # Timeline de atividade (últimos 6 meses)
        timeline_data = []
        for i in range(6):
            month_start = timezone.now() - timedelta(days=(i+1)*30)
            month_end = timezone.now() - timedelta(days=i*30)
            
            timeline_data.append({
                'month': month_start.strftime('%Y-%m'),
                'updates': project.tracking_updates.filter(
                    created_at__gte=month_start, 
                    created_at__lt=month_end
                ).count(),
                'milestones_completed': project.tracking_milestones.filter(
                    completed_date__gte=month_start,
                    completed_date__lt=month_end
                ).count()
            })
        
        return Response({
            'project_id': project.id,
            'project_name': project.name,
            'metrics': metrics_data,
            'updates_stats': updates_stats,
            'milestones_stats': milestones_stats,
            'recent_activity': recent_activity,
            'timeline': timeline_data
        })
    
    @action(detail=True, methods=['post'])
    def quick_update(self, request, slug=None):
        """Endpoint rápido para adicionar atualização simples"""
        project = self.get_object()
        
        serializer = ProjectUpdateSerializer(
            data=request.data, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save(project=project)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectMetricsViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMetricsSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            return ProjectMetrics.objects.filter(project=project)
        return ProjectMetrics.objects.all()
    
    def perform_create(self, serializer):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            serializer.save(project=project)

class ProjectUpdateViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectUpdateSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            queryset = project.tracking_updates.all().order_by('-created_at')
            
            # Filtros
            status_filter = self.request.query_params.get('status', None)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
                
            type_filter = self.request.query_params.get('type', None)
            if type_filter:
                queryset = queryset.filter(type=type_filter)
                
            return queryset
        return ProjectUpdate.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            serializer.save(project=project, author=self.request.user)
        else:
            serializer.save(author=self.request.user)

class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            return project.tracking_milestones.all().order_by('target_date')
        return ProjectMilestone.objects.all().order_by('target_date')
    
    def perform_create(self, serializer):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            serializer.save(project=project)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None, project_slug=None):
        """Marca milestone como completado"""
        milestone = self.get_object()
        milestone.status = 'completed'
        milestone.completed_date = timezone.now().date()
        milestone.save()
        
        # Atualizar métricas do projeto
        try:
            metrics = milestone.project.metrics
            completed_milestones = milestone.project.tracking_milestones.filter(status='completed').count()
            metrics.completed_milestones = completed_milestones
            metrics.save()
        except ProjectMetrics.DoesNotExist:
            pass
        
        serializer = self.get_serializer(milestone)
        return Response(serializer.data)

class ProjectGalleryImageViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectGalleryImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            queryset = project.tracking_gallery_images.all().order_by('-upload_date')
            
            # Filtros
            category_filter = self.request.query_params.get('category', None)
            if category_filter:
                queryset = queryset.filter(category=category_filter)
                
            featured_filter = self.request.query_params.get('featured', None)
            if featured_filter == 'true':
                queryset = queryset.filter(featured=True)
                
            return queryset
        return ProjectGalleryImage.objects.all()
    
    def perform_create(self, serializer):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            serializer.save(project=project, uploaded_by=self.request.user)
        else:
            serializer.save(uploaded_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None, project_slug=None):
        """Toggle status de imagem em destaque"""
        image = self.get_object()
        image.featured = not image.featured
        image.save()
        
        serializer = self.get_serializer(image)
        return Response(serializer.data)

class ProjectEvidenceViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectEvidenceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            queryset = project.tracking_evidence.all().order_by('-upload_date')
            
            # Filtros
            type_filter = self.request.query_params.get('type', None)
            if type_filter:
                queryset = queryset.filter(type=type_filter)
                
            return queryset
        return ProjectEvidence.objects.all().order_by('-upload_date')
    
    def perform_create(self, serializer):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            evidence = serializer.save(project=project, uploaded_by=self.request.user)
            
            # Se for uma imagem, criar entrada na galeria automaticamente
            if evidence.type in ['image', 'photo'] and evidence.file:
                try:
                    from .models import ProjectGalleryImage
                    
                    # Verificar se já existe uma entrada na galeria para este arquivo
                    existing_gallery = ProjectGalleryImage.objects.filter(
                        project=project,
                        title=evidence.title
                    ).first()
                    
                    if not existing_gallery:
                        # Determinar categoria baseada na categoria da evidência
                        gallery_category = 'other'
                        if 'construção' in evidence.category.lower() or 'obra' in evidence.category.lower():
                            gallery_category = 'during'
                        elif 'progresso' in evidence.category.lower():
                            gallery_category = 'during'
                        elif 'antes' in evidence.category.lower():
                            gallery_category = 'before'
                        elif 'depois' in evidence.category.lower() or 'final' in evidence.category.lower():
                            gallery_category = 'after'
                        elif 'equipe' in evidence.category.lower() or 'equipa' in evidence.category.lower():
                            gallery_category = 'team'
                        elif 'comunidade' in evidence.category.lower():
                            gallery_category = 'community'
                        
                        ProjectGalleryImage.objects.create(
                            project=project,
                            image=evidence.file,
                            title=evidence.title,
                            description=evidence.description,
                            category=gallery_category,
                            uploaded_by=self.request.user,
                            featured=False
                        )
                        
                except Exception as e:
                    # Log do erro mas não falhar o upload da evidência
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.warning(f"Falha ao criar entrada na galeria para evidência {evidence.id}: {e}")
        else:
            serializer.save(uploaded_by=self.request.user)

class ProjectMetricsEntryViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectMetricsEntrySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            queryset = project.tracking_metrics_entries.all().order_by('-created_at')
            
            # Filtros
            category_filter = self.request.query_params.get('category', None)
            if category_filter:
                queryset = queryset.filter(category=category_filter)
                
            verified_filter = self.request.query_params.get('verified', None)
            if verified_filter == 'true':
                queryset = queryset.filter(verified=True)
                
            return queryset
        return ProjectMetricsEntry.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        project_slug = self.kwargs.get('project_slug')
        if project_slug:
            project = get_object_or_404(Project, slug=project_slug)
            serializer.save(project=project, author=self.request.user)
        else:
            serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None, project_slug=None):
        """Marca entrada de métrica como verificada"""
        entry = self.get_object()
        entry.verified = True
        entry.verified_by = request.user
        entry.verified_at = timezone.now()
        entry.save()
        
        serializer = self.get_serializer(entry)
        return Response(serializer.data)
