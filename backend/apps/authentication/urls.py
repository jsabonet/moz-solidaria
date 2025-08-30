# backend/apps/authentication/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.user_management import UserManagementViewSet
from .views.session_management import SessionManagementViewSet

router = DefaultRouter()
router.register(r'users', UserManagementViewSet, basename='user-management')
router.register(r'sessions', SessionManagementViewSet, basename='session-management')

urlpatterns = [
    path('', include(router.urls)),
]
