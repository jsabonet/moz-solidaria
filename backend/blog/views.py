from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.conf import settings
from rest_framework.views import APIView
from slugify import slugify

from .models import BlogPost, Category, Tag, Comment, Newsletter, ImageCredit
from .serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer, BlogPostCreateUpdateSerializer,
    CategorySerializer, TagSerializer, CommentSerializer, NewsletterSerializer,
    ImageCreditSerializer
)
from .filters import BlogPostFilter
from .permissions import IsAuthorOrReadOnly


class BlogPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet para operações CRUD de posts do blog
    """
    queryset = BlogPost.objects.all()
    authentication_classes = []  # <--- Adicionado: Remove autenticação obrigatória para posts
    permission_classes = []      # <--- Já estava correto
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BlogPostFilter
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['created_at', 'published_at', 'views_count', 'title']
    ordering = ['-created_at']
    lookup_field = 'slug'
    
    def get_queryset(self):
        # Adiciona filtro por status se passado via query params
        queryset = BlogPost.objects.select_related('author', 'category').prefetch_related('tags')
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
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
    
    def perform_create(self, serializer):
        # Se o usuário estiver autenticado, usa normalmente
        user = self.request.user if self.request.user.is_authenticated and not self.request.user.is_anonymous else None
        if not user:
            # Busca o primeiro superusuário como fallback
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.filter(is_superuser=True).first()
        serializer.save(author=user)

    def perform_update(self, serializer):
        # Garante que o author nunca seja AnonymousUser
        user = self.request.user if self.request.user.is_authenticated and not self.request.user.is_anonymous else None
        if not user:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.filter(is_superuser=True).first()
        serializer.save(author=user)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, slug=None):
        """Duplicate a blog post"""
        original_post = self.get_object()
        
        # Create a new post with duplicated data
        duplicated_post = BlogPost(
            title=f"[CÓPIA] {original_post.title}",
            content=original_post.content,
            excerpt=original_post.excerpt,
            category=original_post.category,
            meta_description=original_post.meta_description,
            meta_keywords=original_post.meta_keywords,
            status='draft',  # Always create as draft
            is_featured=False,  # Reset featured status
            author=request.user if request.user.is_authenticated else original_post.author,
        )
        
        # Generate unique slug
        base_slug = slugify(duplicated_post.title)
        slug = base_slug
        counter = 1
        while BlogPost.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        duplicated_post.slug = slug
        
        duplicated_post.save()
        
        # Copy tags (many-to-many relationship)
        duplicated_post.tags.set(original_post.tags.all())
        
        # Copy featured image if exists
        if original_post.featured_image:
            import shutil
            import os
            from django.core.files import File
            from django.conf import settings
            
            try:
                # Get original file path
                original_path = original_post.featured_image.path
                
                # Create new filename
                original_name = os.path.basename(original_path)
                name, ext = os.path.splitext(original_name)
                new_name = f"{name}_copy_{duplicated_post.id}{ext}"
                
                # Create new file path
                new_path = os.path.join(
                    settings.MEDIA_ROOT, 
                    'blog_images', 
                    new_name
                )
                
                # Ensure directory exists
                os.makedirs(os.path.dirname(new_path), exist_ok=True)
                
                # Copy file
                shutil.copy2(original_path, new_path)
                
                # Update the duplicated post's featured_image field
                duplicated_post.featured_image.name = f'blog_images/{new_name}'
                duplicated_post.save(update_fields=['featured_image'])
                
            except Exception as e:
                print(f"Erro ao copiar imagem: {e}")
                # Continue without image if copy fails
        
        # Serialize and return the duplicated post
        serializer = BlogPostDetailSerializer(duplicated_post, context={'request': request})
        
        return Response({
            'message': 'Post duplicado com sucesso!',
            'duplicated_post': serializer.data
        }, status=status.HTTP_201_CREATED)

class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para categorias (CRUD completo)
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    # Remover lookup_field para usar ID por padrão
    authentication_classes = []
    permission_classes = []
    
    def get_permissions(self):
        """Permissions configuration"""
        return []
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to prevent deletion of categories with posts"""
        category = self.get_object()
        
        # Verificar se a categoria tem posts associados
        posts_count = category.blogpost_set.count()
        if posts_count > 0:
            return Response(
                {
                    'error': 'Não é possível excluir esta categoria',
                    'detail': f'Esta categoria possui {posts_count} post(s) associado(s). '
                             f'Remova ou altere a categoria dos posts antes de excluí-la.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
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
    permission_classes = []
    
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
    permission_classes = []
    http_method_names = ['get', 'post', 'delete']  # Apenas permitir GET, POST e DELETE
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            permission_classes = []  # Permitir inscrição sem autenticação
        else:
            permission_classes = []
        
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


class ImageCreditViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar créditos de imagens
    """
    serializer_class = ImageCreditSerializer
    authentication_classes = []
    permission_classes = []
    
    def get_queryset(self):
        post_slug = self.kwargs.get('post_slug')
        if post_slug:
            post = get_object_or_404(BlogPost, slug=post_slug)
            return ImageCredit.objects.filter(post=post)
        return ImageCredit.objects.none()
    
    def perform_create(self, serializer):
        post_slug = self.kwargs.get('post_slug')
        if post_slug:
            post = get_object_or_404(BlogPost, slug=post_slug)
            serializer.save(post=post)

class ImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    authentication_classes = []
    permission_classes = []

    def post(self, request, *args, **kwargs):
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'Nenhuma imagem enviada.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extrair informações de crédito dos metadados da requisição
        caption = request.data.get('caption', '')
        credit = request.data.get('credit', '')
        source_url = request.data.get('source_url', '')
        photographer = request.data.get('photographer', '')
        license_type = request.data.get('license_type', '')
        alt_text = request.data.get('alt_text', '')
        
        # Salva a imagem na pasta MEDIA_ROOT/uploads/
        path = default_storage.save(f'uploads/{image.name}', image)
        image_url = settings.MEDIA_URL + path
        full_image_url = request.build_absolute_uri(image_url)
        
        # Preparar resposta com informações de crédito
        response_data = {
            'url': full_image_url,
            'filename': image.name,
            'size': image.size,
            'credit_info': {
                'caption': caption,
                'credit': credit,
                'source_url': source_url,
                'photographer': photographer,
                'license_type': license_type,
                'alt_text': alt_text,
            }
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)