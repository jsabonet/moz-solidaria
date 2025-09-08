from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .views import ProgramViewSet, ProjectCategoryViewSet
from .sitemaps import sitemap_index, sitemap_static, sitemap_blog, sitemap_programas

app_name = 'core'

# Create router for ViewSets
router = DefaultRouter()
router.register(r'programs', ProgramViewSet)
router.register(r'project-categories', ProjectCategoryViewSet)

@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def profile_me(request):
    """Temporary endpoint for profile"""
    if request.method == 'GET':
        return JsonResponse({'error': 'Profile endpoint not implemented yet'}, status=404)
    return JsonResponse({'error': 'Profile endpoint not implemented yet'}, status=404)

@csrf_exempt
@require_http_methods(["GET"])
def dashboard_stats(request):
    """Temporary endpoint for dashboard stats"""
    return JsonResponse({'error': 'Dashboard stats endpoint not implemented yet'}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def auth_register(request):
    """Temporary endpoint for registration"""
    return JsonResponse({'error': 'Registration endpoint not implemented yet'}, status=404)

urlpatterns = [
    path('', include(router.urls)),
    path('profiles/me/', profile_me, name='profile-me'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('auth/register/', auth_register, name='register'),
    
    # Sitemaps
    path('sitemap.xml', sitemap_index, name='sitemap-index'),
    path('sitemap-static.xml', sitemap_static, name='sitemap-static'),
    path('sitemap-blog.xml', sitemap_blog, name='sitemap-blog'),
    path('sitemap-programas.xml', sitemap_programas, name='sitemap-programas'),
]
