# backend/volunteers/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VolunteerSkillViewSet, VolunteerOpportunityViewSet, VolunteerProfileViewSet,
    VolunteerParticipationViewSet, VolunteerAchievementViewSet, AdminVolunteerDashboardView
)

router = DefaultRouter()
router.register(r'skills', VolunteerSkillViewSet)
router.register(r'opportunities', VolunteerOpportunityViewSet)
router.register(r'profiles', VolunteerProfileViewSet, basename='volunteer-profile')
router.register(r'participations', VolunteerParticipationViewSet, basename='volunteer-participation')
router.register(r'achievements', VolunteerAchievementViewSet, basename='volunteer-achievement')

urlpatterns = [
    path('', include(router.urls)),
    # Admin endpoints diretos usando AdminVolunteerDashboardView
    path('admin/stats/', AdminVolunteerDashboardView.as_view({'get': 'stats'}), name='admin-stats'),
    path('admin/pending_applications/', AdminVolunteerDashboardView.as_view({'get': 'pending_applications'}), name='admin-pending-applications'),
]
