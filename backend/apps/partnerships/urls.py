# backend/apps/partnerships/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartnerMessageViewSet, PartnerProjectAssignmentViewSet, AdminPartnerDashboardView

router = DefaultRouter()
router.register(r'messages', PartnerMessageViewSet, basename='partner-messages')
router.register(r'project-assignments', PartnerProjectAssignmentViewSet, basename='partner-assignments')
router.register(r'admin-dashboard', AdminPartnerDashboardView, basename='admin-partner-dashboard')

urlpatterns = [
    path('partner/', include(router.urls)),
]
