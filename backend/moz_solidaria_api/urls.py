"""
URL configuration for moz_solidaria_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from client_area.models import UserProfile
from client_area.serializers import UserProfileSerializer
from django.contrib.auth.models import Permission
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    """Get authenticated user data"""
    user = request.user
    
    # Detectar se é um reload da página
    is_page_reload = request.headers.get('X-Page-Reload') == 'true'
    force_fresh = request.headers.get('X-Force-Fresh') == 'true'
    
    if is_page_reload or force_fresh:
        print(f"🔄 RELOAD DA PÁGINA DETECTADO para usuário {user.username} - Forçando dados frescos")
    
    # FORÇA ATUALIZAÇÃO COMPLETA DO USUÁRIO DESDE O BANCO DE DADOS
    # Isso resolve o problema do cache de permissões
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    # Buscar usuário fresh do banco de dados 
    fresh_user = User.objects.select_related().prefetch_related(
        'groups', 'user_permissions', 'groups__permissions'
    ).get(id=user.id)
    
    # Força limpeza do cache de permissões do Django (sempre, mas especialmente em reloads)
    if hasattr(fresh_user, '_perm_cache'):
        delattr(fresh_user, '_perm_cache')
    if hasattr(fresh_user, '_user_perm_cache'):
        delattr(fresh_user, '_user_perm_cache')
    if hasattr(fresh_user, '_group_perm_cache'):
        delattr(fresh_user, '_group_perm_cache')
    
    # Limpar cache adicional se for reload da página
    if is_page_reload:
        from django.core.cache import cache
        cache_keys_to_clear = [
            f"user_permissions_{user.id}",
            f"user_groups_{user.id}",
            f"user_profile_{user.id}",
            f"user_staff_status_{user.id}",
            f"group_permissions_{user.id}",
        ]
        for key in cache_keys_to_clear:
            cache.delete(key)
        print(f"🧹 Cache adicional limpo para reload do usuário {user.username}")
    
    # Obter grupos do usuário (fresh data)
    groups = [group.name for group in fresh_user.groups.all()]
    
    # Obter permissões do usuário usando dados frescos (diretas + grupos)
    user_perms = fresh_user.user_permissions.all()
    group_perms = Permission.objects.filter(group__user=fresh_user)
    all_perms = (user_perms | group_perms).distinct()
    permissions = [f"{perm.content_type.app_label}.{perm.codename}" for perm in all_perms]
    
    user_data = {
        'id': fresh_user.id,
        'username': fresh_user.username,
        'email': fresh_user.email,
        'first_name': fresh_user.first_name,
        'last_name': fresh_user.last_name,
        'is_staff': fresh_user.is_staff,
        'is_superuser': fresh_user.is_superuser,
        'groups': groups,
        'permissions': permissions,
        'cache_busted': True,  # Indica que o cache foi limpo
        'fresh_data': True,    # Indica que são dados frescos do DB
        'is_page_reload': is_page_reload,  # Indica se foi um reload
        'timestamp': timezone.now().isoformat(),
    }
    
    try:
        # Try to get user profile from client_area
        profile = UserProfile.objects.get(user=fresh_user)
        user_data['profile'] = UserProfileSerializer(profile).data
    except UserProfile.DoesNotExist:
        pass
    
    # Adicionar headers para forçar não-cache no frontend
    response = Response(user_data)
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    response['Expires'] = '0'
    
    if is_page_reload:
        response['X-Cache-Cleared'] = 'true'
        response['X-Fresh-Data'] = 'true'
    
    return response

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/v1/', include([
        # Authentication
        path('auth/', include([
            path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
            path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
            path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
            path('user/', get_user_data, name='user_data'),
            # Gerenciamento de usuários
            path('', include('apps.authentication.urls')),
        ])),
        
        # Apps
        path('blog/', include('blog.urls')),
        path('client-area/', include('client_area.urls')),
        path('donations/', include('donations.urls')),
        path('notifications/', include('notifications.urls')),
        path('projects/', include('core.urls_categories')),
        path('tracking/', include('project_tracking.urls')),
        path('reports/', include('reports.urls')),
        path('partnerships/', include('partnerships.urls')),
        path('volunteers/', include('volunteers.urls')),
        path('beneficiaries/', include('beneficiaries.urls')),
        
        # Sistema RBAC - Gestão de Permissões e Usuários
        path('rbac/', include('core.permissions_urls')),
        
        # path('core/', include('core.urls')),  # Temporariamente desabilitado
    ])),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
