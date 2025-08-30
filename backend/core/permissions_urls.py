# backend/core/permissions_urls.py

from django.urls import path
from .views import (
    UserManagementView, audit_logs_view, system_stats_view,
    groups_and_permissions_view, my_profile_view
)

urlpatterns = [
    # Gestão de usuários
    path('users/', UserManagementView.as_view(), name='user_management'),
    path('users/<int:user_id>/', UserManagementView.as_view(), name='user_detail'),
    
    # Logs e auditoria
    path('audit-logs/', audit_logs_view, name='audit_logs'),
    path('system-stats/', system_stats_view, name='system_stats'),
    
    # Grupos e permissões
    path('groups-permissions/', groups_and_permissions_view, name='groups_permissions'),
    
    # Perfil do usuário
    path('my-profile/', my_profile_view, name='my_profile'),
]
