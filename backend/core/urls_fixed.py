from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'core'

# Router para ViewSets
router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet, basename='userprofile')
router.register(r'causes', views.CauseViewSet, basename='cause')
router.register(r'skills', views.SkillViewSet, basename='skill')
router.register(r'certifications', views.CertificationViewSet, basename='certification')
router.register(r'donors', views.DonorViewSet, basename='donor')
router.register(r'beneficiaries', views.BeneficiaryViewSet, basename='beneficiary')
router.register(r'volunteers', views.VolunteerViewSet, basename='volunteer')
router.register(r'partners', views.PartnerViewSet, basename='partner')

urlpatterns = [
    # APIs existentes
    path('profile/', views.user_profile, name='user_profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    
    # APIs do sistema de perfis
    path('auth/register/', views.UserRegistrationView.as_view(), name='user_registration'),
    path('auth/complete-profile/', views.ProfileCompletionView.as_view(), name='complete_profile'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # ViewSets do router
    path('', include(router.urls)),
]
