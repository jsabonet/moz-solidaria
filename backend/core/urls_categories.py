"""
URLs para o sistema de categorias de projetos
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_categories import (
    ProjectCategoryViewSet, ProjectViewSet, ProjectUpdateViewSet,
    ProjectGalleryViewSet, PublicProjectCategoryViewSet, PublicProjectViewSet
)

# Router para APIs administrativas (requer autenticação)
admin_router = DefaultRouter()
admin_router.register(r'categories', ProjectCategoryViewSet, basename='projectcategory')
admin_router.register(r'projects', ProjectViewSet, basename='project')
admin_router.register(r'project-updates', ProjectUpdateViewSet, basename='projectupdate')
admin_router.register(r'project-gallery', ProjectGalleryViewSet, basename='projectgallery')

# Router para APIs públicas (somente leitura)
public_router = DefaultRouter()
public_router.register(r'categories', PublicProjectCategoryViewSet, basename='public-projectcategory')
public_router.register(r'projects', PublicProjectViewSet, basename='public-project')

app_name = 'categories'

urlpatterns = [
    # APIs administrativas
    path('admin/', include(admin_router.urls)),
    
    # APIs públicas
    path('public/', include(public_router.urls)),
]
