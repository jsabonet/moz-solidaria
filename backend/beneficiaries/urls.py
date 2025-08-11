# backend/beneficiaries/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BeneficiaryProfileViewSet, SupportRequestViewSet, 
    BeneficiaryCommunicationViewSet, BeneficiaryDocumentViewSet,
    beneficiary_dashboard_stats, beneficiary_profile_exists,
    # Admin views
    admin_beneficiaries_stats, AdminBeneficiaryViewSet,
    AdminSupportRequestViewSet, AdminBeneficiaryCommunicationViewSet
)

app_name = 'beneficiaries'

router = DefaultRouter()
router.register(r'profiles', BeneficiaryProfileViewSet, basename='beneficiary-profiles')
router.register(r'support-requests', SupportRequestViewSet, basename='support-requests')
router.register(r'communications', BeneficiaryCommunicationViewSet, basename='beneficiary-communications')
router.register(r'documents', BeneficiaryDocumentViewSet, basename='beneficiary-documents')

# Router para endpoints administrativos
admin_router = DefaultRouter()
admin_router.register(r'beneficiaries', AdminBeneficiaryViewSet, basename='admin-beneficiaries')
admin_router.register(r'support-requests', AdminSupportRequestViewSet, basename='admin-support-requests')
admin_router.register(r'communications', AdminBeneficiaryCommunicationViewSet, basename='admin-beneficiary-communications')

dashboard_stats_view = BeneficiaryProfileViewSet.as_view({'get': 'dashboard_stats'})

urlpatterns = [
    # Endpoints para beneficiários
    path('', include(router.urls)),
    
    # Endpoints administrativos
    path('admin/', include(admin_router.urls)),
    path('admin/stats/', admin_beneficiaries_stats, name='admin_beneficiaries_stats'),
    
    # Ações via viewset (ainda disponíveis)
    path('profiles/dashboard_stats/', dashboard_stats_view, name='beneficiary-dashboard-stats'),
    path('dashboard/stats/', dashboard_stats_view, name='beneficiary-dashboard-stats-alt'),
    
    # Endpoint estável independente
    path('dashboard/summary/', beneficiary_dashboard_stats, name='beneficiary-dashboard-summary'),
    
    # Verificação de existência de perfil
    path('profiles/exists/', beneficiary_profile_exists, name='beneficiary-profile-exists'),
]
