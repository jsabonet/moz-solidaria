from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, CategoryViewSet, TagViewSet, NewsletterViewSet, CommentViewSet, ImageUploadView, ImageCreditViewSet
from .admin_views import CommentAdminViewSet, SocialStatsViewSet
from . import views

app_name = 'blog'

router = DefaultRouter()
router.register(r'posts', views.BlogPostViewSet, basename='blogpost')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'tags', views.TagViewSet, basename='tag')
router.register(r'newsletter', views.NewsletterViewSet, basename='newsletter')

# Admin routes (requer permissões de admin)
router.register(r'admin/comments', CommentAdminViewSet, basename='admin-comments')
router.register(r'admin/social-stats', SocialStatsViewSet, basename='admin-social-stats')

# Nested routes for comments
urlpatterns = [
    path('', include(router.urls)),
    
    # Specific routes for categories using slug
    path('categories/<slug:slug>/posts/', views.CategoryViewSet.as_view({
        'get': 'posts'
    }), name='category-posts'),
    
    # Comments nested under posts
    path('posts/<slug:post_slug>/comments/', views.CommentViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='post-comments'),
    path('posts/<slug:post_slug>/comments/<int:pk>/', views.CommentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='post-comment-detail'),
    
    # Image upload
    path('upload/image/', ImageUploadView.as_view(), name='image-upload'),
    
    # Post actions
    path('posts/<slug:post_slug>/related/', views.BlogPostViewSet.as_view({
        'get': 'related'
    }), name='post-related'),
    path('posts/featured/', views.BlogPostViewSet.as_view({
        'get': 'featured'
    }), name='post-featured'),
    path('posts/latest/', views.BlogPostViewSet.as_view({
        'get': 'latest'
    }), name='post-latest'),
    
    # Post duplication
    path('posts/<slug:post_slug>/duplicate/', views.BlogPostViewSet.as_view({
        'post': 'duplicate'
    }), name='post-duplicate'),
    
    # Image credits nested under posts
    path('posts/<slug:post_slug>/image-credits/', views.ImageCreditViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='post-image-credits'),
    path('posts/<slug:post_slug>/image-credits/<int:pk>/', views.ImageCreditViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='post-image-credit-detail'),
]
