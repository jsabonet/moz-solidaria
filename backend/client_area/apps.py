# backend/client_area/apps.py
from django.apps import AppConfig


class ClientAreaConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'client_area'
    verbose_name = 'Portal de Comunidade'
    
    def ready(self):
        import client_area.signals
