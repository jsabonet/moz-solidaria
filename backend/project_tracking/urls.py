# backend/project_tracking/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

# Router principal
router = DefaultRouter()
router.register(r'project-tracking', views.ProjectTrackingViewSet, basename='project-tracking')
router.register(r'project-metrics', views.ProjectMetricsViewSet, basename='project-metrics')
router.register(r'project-updates', views.ProjectUpdateViewSet, basename='project-updates')
router.register(r'project-milestones', views.ProjectMilestoneViewSet, basename='project-milestones')
router.register(r'project-gallery', views.ProjectGalleryImageViewSet, basename='project-gallery')
router.register(r'project-evidence', views.ProjectEvidenceViewSet, basename='project-evidence')
router.register(r'project-metrics-entries', views.ProjectMetricsEntryViewSet, basename='project-metrics-entries')

app_name = 'project_tracking'

urlpatterns = [
    # Include router URLs (will be available at /api/v1/tracking/)
    path('', include(router.urls)),
    
    # URLs específicas para projetos por slug
    path('projects/<slug:project_slug>/metrics/', 
         views.ProjectMetricsViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='project-metrics-by-slug'),
    path('projects/<slug:project_slug>/metrics/<int:pk>/', 
         views.ProjectMetricsViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='project-metrics-detail-by-slug'),
         
    path('projects/<slug:project_slug>/updates/', 
         views.ProjectUpdateViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='project-updates-by-slug'),
    path('projects/<slug:project_slug>/updates/<int:pk>/', 
         views.ProjectUpdateViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='project-updates-detail-by-slug'),
         
    path('projects/<slug:project_slug>/milestones/', 
         views.ProjectMilestoneViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='project-milestones-by-slug'),
    path('projects/<slug:project_slug>/milestones/<int:pk>/', 
         views.ProjectMilestoneViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='project-milestones-detail-by-slug'),
    path('projects/<slug:project_slug>/milestones/<int:pk>/complete/', 
         views.ProjectMilestoneViewSet.as_view({'post': 'complete'}), 
         name='project-milestones-complete-by-slug'),
         
    path('projects/<slug:project_slug>/gallery/', 
         views.ProjectGalleryImageViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='project-gallery-by-slug'),
    path('projects/<slug:project_slug>/gallery/<int:pk>/', 
         views.ProjectGalleryImageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='project-gallery-detail-by-slug'),
    path('projects/<slug:project_slug>/gallery/<int:pk>/toggle-featured/', 
         views.ProjectGalleryImageViewSet.as_view({'post': 'toggle_featured'}), 
         name='project-gallery-toggle-featured-by-slug'),
         
    path('projects/<slug:project_slug>/evidence/', 
         views.ProjectEvidenceViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='project-evidence-by-slug'),
    path('projects/<slug:project_slug>/evidence/<int:pk>/', 
         views.ProjectEvidenceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='project-evidence-detail-by-slug'),
         
    path('projects/<slug:project_slug>/metrics-entries/', 
         views.ProjectMetricsEntryViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='project-metrics-entries-by-slug'),
    path('projects/<slug:project_slug>/metrics-entries/<int:pk>/', 
         views.ProjectMetricsEntryViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), 
         name='project-metrics-entries-detail-by-slug'),
    path('projects/<slug:project_slug>/metrics-entries/<int:pk>/verify/', 
         views.ProjectMetricsEntryViewSet.as_view({'post': 'verify'}), 
         name='project-metrics-entries-verify-by-slug'),
]
