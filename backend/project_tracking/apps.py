# backend/project_tracking/apps.py
from django.apps import AppConfig

class ProjectTrackingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'project_tracking'
    verbose_name = 'Project Tracking'
    
    def ready(self):
        import project_tracking.signals
