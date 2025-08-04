# backend/donations/urls.py
from django.urls import path
from . import views

app_name = 'donations'

urlpatterns = [
    # Doações
    path('', views.DonationListCreateView.as_view(), name='donation-list'),
    path('<int:pk>/', views.DonationDetailView.as_view(), name='donation-detail'),
    path('<int:donation_id>/comments/', views.donation_comments, name='donation-comments'),
    
    # Estatísticas
    path('statistics/', views.donation_statistics, name='statistics'),
    
    # Admin
    path('bulk-update/', views.bulk_update_donations, name='bulk-update'),
    
    # Métodos de doação
    path('methods/', views.DonationMethodListView.as_view(), name='methods'),
]
