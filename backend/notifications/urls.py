from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notificações
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('<int:notification_id>/read/', views.mark_notification_read, name='mark-read'),
    path('mark-all-read/', views.mark_all_read, name='mark-all-read'),
    path('bulk-action/', views.bulk_action_notifications, name='bulk-action'),
    path('stats/', views.notification_stats, name='stats'),
    
    # Preferências
    path('preferences/', views.NotificationPreferenceView.as_view(), name='preferences'),
]
