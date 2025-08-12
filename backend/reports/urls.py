# backend/reports/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views
from . import export_views
from .simple_views import SimpleAnalyticsAPIView

router = DefaultRouter()
router.register(r'reports', views.ReportViewSet, basename='reports')
router.register(r'scheduled', views.ScheduledReportViewSet, basename='scheduled')
router.register(r'export', views.ExportViewSet, basename='export')
router.register(r'exports', export_views.ExportViewSet, basename='exports')
router.register(r'analytics', SimpleAnalyticsAPIView, basename='analytics')

app_name = 'reports'

urlpatterns = [
    path('', include(router.urls)),
]
