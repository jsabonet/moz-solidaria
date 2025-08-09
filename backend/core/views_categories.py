"""
Views para o sistema de categorias de projetos
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Prefetch

from core.models import ProjectCategory, Project, ProjectUpdate, ProjectGallery, Program
from .serializers_categories import (
    ProjectCategorySerializer, ProjectCategoryListSerializer,
    ProjectDetailSerializer, ProjectListSerializer, ProjectCreateUpdateSerializer,
    ProjectUpdateSerializer, ProjectGallerySerializer, ProgramSimpleSerializer
)


class ProjectCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar categorias de projetos"""
    queryset = ProjectCategory.objects.select_related('program').annotate(
        projects_count=Count('project')
    )
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program', 'color', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order', 'created_at', 'projects_count']
    ordering = ['program__name', 'order', 'name']
    
    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.action == 'list':
            return ProjectCategoryListSerializer
        return ProjectCategorySerializer
    
    def get_queryset(self):
        """Filtra categorias baseado nos parâmetros da query"""
        queryset = super().get_queryset()
        
        # Filtrar por programa via slug
        program_slug = self.request.query_params.get('program_slug')
        if program_slug:
            queryset = queryset.filter(program__slug=program_slug)
        
        # Para usuários não autenticados, mostrar apenas categorias ativas
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_active=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_program(self, request):
        """Retorna categorias agrupadas por programa"""
        programs = Program.objects.filter(is_active=True).prefetch_related(
            Prefetch(
                'categories',
                queryset=ProjectCategory.objects.filter(is_active=True).order_by('order', 'name')
            )
        ).order_by('order', 'name')
        
        result = []
        for program in programs:
            categories = ProjectCategoryListSerializer(program.categories.all(), many=True).data
            result.append({
                'id': program.id,
                'name': program.name,
                'slug': program.slug,
                'color': program.color,
                'categories': categories
            })
        
        return Response(result)
    
    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        """Alterna o status ativo/inativo da categoria"""
        category = self.get_object()
        category.is_active = not category.is_active
        category.save()
        
        serializer = self.get_serializer(category)
        return Response(serializer.data)


class ProjectViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar projetos"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'program', 'category', 'status', 'priority', 'is_featured', 
        'is_public', 'accepts_donations'
    ]
    search_fields = ['name', 'description', 'location', 'meta_keywords']
    ordering_fields = [
        'name', 'start_date', 'progress_percentage', 'current_beneficiaries',
        'created_at', 'updated_at'
    ]
    ordering = ['-is_featured', '-created_at']
    
    def get_queryset(self):
        """Retorna projetos com otimizações de query"""
        queryset = Project.objects.select_related('program', 'category').prefetch_related(
            'updates', 'gallery'
        )
        
        # Para usuários não autenticados, mostrar apenas projetos públicos
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(is_public=True)
        
        # Filtros adicionais
        category_slug = self.request.query_params.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        program_slug = self.request.query_params.get('program_slug')
        if program_slug:
            queryset = queryset.filter(program__slug=program_slug)
        
        # Filtrar projetos em destaque
        featured_only = self.request.query_params.get('featured')
        if featured_only and featured_only.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        # Filtrar por status
        active_only = self.request.query_params.get('active')
        if active_only and active_only.lower() == 'true':
            queryset = queryset.filter(status__in=['active', 'completed'])
        
        return queryset
    
    def get_serializer_class(self):
        """Retorna o serializer apropriado baseado na ação"""
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProjectCreateUpdateSerializer
        return ProjectDetailSerializer
    
    def perform_create(self, serializer):
        """Personaliza a criação de projetos"""
        # Aqui você pode adicionar lógica adicional, como definir o usuário criador
        serializer.save()
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Retorna apenas projetos em destaque"""
        queryset = self.get_queryset().filter(is_featured=True)
        serializer = ProjectListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Retorna projetos agrupados por categoria"""
        queryset = self.get_queryset()
        
        # Agrupar por categoria
        categories = ProjectCategory.objects.filter(is_active=True).prefetch_related(
            Prefetch(
                'project_set',
                queryset=queryset,
                to_attr='filtered_projects'
            )
        ).order_by('program__name', 'order', 'name')
        
        result = []
        for category in categories:
            if category.filtered_projects:  # Só incluir se tiver projetos
                projects = ProjectListSerializer(
                    category.filtered_projects, 
                    many=True, 
                    context={'request': request}
                ).data
                
                result.append({
                    'id': category.id,
                    'name': category.name,
                    'slug': category.slug,
                    'description': category.description,
                    'color': category.color,
                    'icon': category.icon,
                    'program': {
                        'id': category.program.id,
                        'name': category.program.name,
                        'slug': category.program.slug
                    },
                    'projects': projects
                })
        
        return Response(result)
    
    @action(detail=True, methods=['get'])
    def updates(self, request, pk=None):
        """Retorna atualizações do projeto"""
        project = self.get_object()
        updates = ProjectUpdate.objects.filter(project=project).order_by('-created_at')
        serializer = ProjectUpdateSerializer(updates, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def gallery(self, request, pk=None):
        """Retorna galeria do projeto"""
        project = self.get_object()
        gallery = ProjectGallery.objects.filter(project=project).order_by('order', '-created_at')
        serializer = ProjectGallerySerializer(gallery, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_progress(self, request, pk=None):
        """Atualiza o progresso do projeto"""
        project = self.get_object()
        progress = request.data.get('progress_percentage')
        
        if progress is not None:
            try:
                progress = int(progress)
                if 0 <= progress <= 100:
                    project.progress_percentage = progress
                    project.save()
                    
                    serializer = self.get_serializer(project)
                    return Response(serializer.data)
                else:
                    return Response(
                        {'error': 'O progresso deve estar entre 0 e 100.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except ValueError:
                return Response(
                    {'error': 'Progresso deve ser um número inteiro.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(
            {'error': 'Campo progress_percentage é obrigatório.'},
            status=status.HTTP_400_BAD_REQUEST
        )


class ProjectUpdateViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar atualizações de projetos"""
    queryset = ProjectUpdate.objects.select_related('project', 'created_by').order_by('-created_at')
    serializer_class = ProjectUpdateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'is_milestone']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        """Define o usuário criador da atualização"""
        serializer.save(created_by=self.request.user)


class ProjectGalleryViewSet(viewsets.ModelViewSet):
    """ViewSet para gerenciar galeria de projetos"""
    queryset = ProjectGallery.objects.select_related('project').order_by('project', 'order', '-created_at')
    serializer_class = ProjectGallerySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['project', 'is_featured']
    ordering_fields = ['order', 'created_at']
    ordering = ['order', '-created_at']


# Views públicas simplificadas para frontend
class PublicProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet público para categorias (apenas leitura)"""
    queryset = ProjectCategory.objects.filter(is_active=True).select_related('program')
    serializer_class = ProjectCategoryListSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['program']
    ordering = ['program__order', 'order', 'name']


class PublicProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet público para projetos (apenas leitura)"""
    queryset = Project.objects.filter(is_public=True, status__in=['planning', 'active', 'completed']).select_related(
        'program', 'category'
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program', 'category', 'status', 'is_featured', 'slug']
    search_fields = ['name', 'description', 'location']
    ordering_fields = ['name', 'start_date', 'created_at']
    ordering = ['-is_featured', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        return ProjectDetailSerializer
        return ProjectDetailSerializer
