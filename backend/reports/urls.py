# backend/reports/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r'reports', views.ReportViewSet, basename='reports')
router.register(r'dashboards', views.AnalyticsDashboardViewSet, basename='dashboards')
router.register(r'metrics', views.MetricDefinitionViewSet, basename='metrics')
router.register(r'scheduled', views.ScheduledReportViewSet, basename='scheduled-reports')
router.register(r'analytics', views.AnalyticsAPIView, basename='analytics')

app_name = 'reports'

urlpatterns = [
    path('api/v1/', include(router.urls)),
]
