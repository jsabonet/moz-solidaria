from django.apps import AppConfig


class PartnershipsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'partnerships'
    verbose_name = 'Partnership Management'
    
    def ready(self):
        """Import signal handlers when the app is ready"""
        try:
            from . import signals
        except ImportError:
            pass
