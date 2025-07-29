from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import BlogPost, Category, Tag, Comment, Newsletter
from .serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer, BlogPostCreateUpdateSerializer,
    CategorySerializer, TagSerializer, CommentSerializer, NewsletterSerializer
)
from .filters import BlogPostFilter
from .permissions import IsAuthorOrReadOnly


class BlogPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operações CRUD de posts do blog
    """
    queryset = BlogPost.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BlogPostFilter
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['created_at', 'published_at', 'views_count', 'title']
    ordering = ['-created_at']
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = BlogPost.objects.select_related('author', 'category').prefetch_related('tags')
        
        # Se não for staff, mostrar apenas posts publicados
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='published')
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return BlogPostCreateUpdateSerializer
        return BlogPostDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to increment view count"""
        instance = self.get_object()
        
        # Increment view count for published posts
        if instance.status == 'published':
            instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured posts"""
        featured_posts = self.get_queryset().filter(is_featured=True)
        page = self.paginate_queryset(featured_posts)
        if page is not None:
            serializer = BlogPostListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = BlogPostListSerializer(featured_posts, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get latest posts"""
        latest_posts = self.get_queryset().order_by('-published_at')[:5]
        serializer = BlogPostListSerializer(latest_posts, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular posts by view count"""
        popular_posts = self.get_queryset().order_by('-views_count')[:10]
        serializer = BlogPostListSerializer(popular_posts, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related posts based on category and tags"""
        post = self.get_object()
        related_posts = BlogPost.objects.filter(
            status='published'
        ).exclude(id=post.id)
        
        # Filter by same category or tags
        if post.category:
            related_posts = related_posts.filter(
                Q(category=post.category) | Q(tags__in=post.tags.all())
            ).distinct()
        else:
            related_posts = related_posts.filter(tags__in=post.tags.all()).distinct()
        
        related_posts = related_posts[:3]
        serializer = BlogPostListSerializer(related_posts, many=True, context={'request': request})
        return Response(serializer.data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para categorias (apenas leitura)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    
    @action(detail=True, methods=['get'])
    def posts(self, request, slug=None):
        """Get posts from a specific category"""
        category = self.get_object()
        posts = BlogPost.objects.filter(
            category=category, 
            status='published'
        ).select_related('author', 'category').prefetch_related('tags')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = BlogPostListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = BlogPostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para tags (apenas leitura)
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'
    
    @action(detail=True, methods=['get'])
    def posts(self, request, slug=None):
        """Get posts with a specific tag"""
        tag = self.get_object()
        posts = BlogPost.objects.filter(
            tags=tag, 
            status='published'
        ).select_related('author', 'category').prefetch_related('tags')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = BlogPostListSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        
        serializer = BlogPostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para comentários
    """
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        if hasattr(self, 'kwargs') and 'post_slug' in self.kwargs:
            post = get_object_or_404(BlogPost, slug=self.kwargs['post_slug'])
            return Comment.objects.filter(post=post, is_approved=True)
        return Comment.objects.filter(is_approved=True)
    
    def perform_create(self, serializer):
        post_slug = self.kwargs.get('post_slug')
        if post_slug:
            post = get_object_or_404(BlogPost, slug=post_slug)
            serializer.save(post=post)


class NewsletterViewSet(viewsets.ModelViewSet):
    """
    ViewSet para newsletter
    """
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'delete']  # Apenas permitir GET, POST e DELETE
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = []  # Permitir inscrição sem autenticação
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'])
    def subscribe(self, request):
        """Subscribe to newsletter"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Inscrição realizada com sucesso!'}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def unsubscribe(self, request):
        """Unsubscribe from newsletter"""
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email é obrigatório'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            subscription = Newsletter.objects.get(email=email)
            subscription.is_active = False
            subscription.save()
            return Response({'message': 'Inscrição cancelada com sucesso!'})
        except Newsletter.DoesNotExist:
            return Response(
                {'error': 'Email não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
