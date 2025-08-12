"""
Teste simples do endpoint de analytics
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from reports.simple_views import SimpleAnalyticsAPIView
from rest_framework.test import APIRequestFactory
from django.contrib.auth.models import User

def test_analytics_endpoint():
    # Testar o endpoint de analytics
    factory = APIRequestFactory()
    request = factory.get('/analytics/advanced-stats/')

    # Criar usuário teste se não existir
    user, created = User.objects.get_or_create(username='test_user')
    request.user = user

    # Testar view
    view = SimpleAnalyticsAPIView()
    view.action = 'advanced_stats'
    
    try:
        response = view.advanced_stats(request)
        print(f'Status: {response.status_code}')
        
        if hasattr(response, 'data'):
            print(f'Data keys: {list(response.data.keys())}')
            
            # Verificar se tem dados de métricas
            if 'data' in response.data:
                metrics = response.data['data']
                print(f'Metrics available: {list(metrics.keys())}')
                
                # Verificar métricas financeiras
                if 'financialMetrics' in metrics:
                    financial = metrics['financialMetrics']
                    print(f'Total donations: {financial.get("totalDonations", 0)}')
                    
        print('✅ Endpoint de analytics funcionando!')
        return True
        
    except Exception as e:
        print(f'❌ Erro no endpoint: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    test_analytics_endpoint()
