from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartnerMessageViewSet, PartnerProjectAssignmentViewSet, dashboard_stats, message_stream

# Create router for ViewSets
router = DefaultRouter()
router.register(r'messages', PartnerMessageViewSet, basename='partner-messages')
router.register(r'assignments', PartnerProjectAssignmentViewSet, basename='partner-assignments')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional endpoints
    path('dashboard/stats/', dashboard_stats, name='partnership-dashboard-stats'),
    path('messages/stream/', message_stream, name='partnership-message-stream'),
]
