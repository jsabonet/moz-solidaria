from django.http import JsonResponse
from core.models import Project
from project_tracking.serializers import ProjectTrackingDataSerializer

def test_project_data(request, slug):
    """View simples para testar o serializer"""
    try:
        project = Project.objects.select_related('program', 'category').get(slug=slug)
        serializer = ProjectTrackingDataSerializer(project)
        
        return JsonResponse({
            'success': True,
            'data': serializer.data
        })
    except Project.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Project not found'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        })
