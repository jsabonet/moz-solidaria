# backend/client_area/urls.py
from django.urls import path
from . import views

app_name = 'client_area'

urlpatterns = [
    # Autenticação
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    
    # Perfil
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Dashboard
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Notificações
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:notification_id>/mark-read/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Sistema de Matching
    path('matching/requests/', views.MatchingRequestListCreateView.as_view(), name='matching-requests'),
    path('matching/requests/<int:request_id>/accept/', views.accept_matching_request, name='accept-matching-request'),
    
    # Dados auxiliares
    path('causes/', views.CauseListView.as_view(), name='causes'),
    path('skills/', views.SkillListView.as_view(), name='skills'),
]
