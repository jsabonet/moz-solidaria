import requests
import json
from datetime import datetime

# Configuração
API_BASE = "http://localhost:8000"
PROJECT_SLUG = "Joel"

# Headers para autenticação (você pode precisar ajustar)
headers = {
    'Content-Type': 'application/json',
}

def test_api_after_update():
    print("=== TESTE: VERIFICAR API APÓS NOVA ATUALIZAÇÃO ===")
    
    # 1. Verificar estado atual das métricas
    print("\n📊 1. Estado atual das métricas:")
    metrics_url = f"{API_BASE}/api/v1/tracking/projects/{PROJECT_SLUG}/metrics/"
    response = requests.get(metrics_url, headers=headers)
    
    if response.status_code == 200:
        current_metrics = response.json()
        print(f"  Pessoas impactadas: {current_metrics.get('people_impacted', 0)}")
        print(f"  Orçamento usado: {current_metrics.get('budget_used', '0')}")
        print(f"  Progresso: {current_metrics.get('progress_percentage', 0)}%")
        print(f"  Última atualização: {current_metrics.get('last_updated', 'N/A')}")
    else:
        print(f"  ❌ Erro ao buscar métricas: {response.status_code}")
        return
    
    # 2. Adicionar nova atualização
    print("\n📝 2. Adicionando nova atualização:")
    updates_url = f"{API_BASE}/api/v1/tracking/projects/{PROJECT_SLUG}/updates/"
    
    new_update = {
        "title": f"Teste API {datetime.now().strftime('%H:%M:%S')}",
        "description": "Teste para verificar se as métricas são recalculadas",
        "type": "progress",
        "status": "published",
        "people_impacted": 100,
        "budget_spent": "10000.00",
        "progress_percentage": 95
    }
    
    response = requests.post(updates_url, json=new_update, headers=headers)
    
    if response.status_code == 201:
        created_update = response.json()
        print(f"  ✅ Atualização criada: {created_update.get('title')}")
        print(f"  ID: {created_update.get('id')}")
    else:
        print(f"  ❌ Erro ao criar atualização: {response.status_code}")
        print(f"  Resposta: {response.text}")
        return
    
    # 3. Verificar se as métricas foram atualizadas
    print("\n📊 3. Verificando métricas após atualização:")
    response = requests.get(metrics_url, headers=headers)
    
    if response.status_code == 200:
        updated_metrics = response.json()
        print(f"  Pessoas impactadas: {current_metrics.get('people_impacted', 0)} → {updated_metrics.get('people_impacted', 0)}")
        print(f"  Orçamento usado: {current_metrics.get('budget_used', '0')} → {updated_metrics.get('budget_used', '0')}")
        print(f"  Progresso: {current_metrics.get('progress_percentage', 0)}% → {updated_metrics.get('progress_percentage', 0)}%")
        print(f"  Última atualização: {updated_metrics.get('last_updated', 'N/A')}")
        
        # Verificar se houve mudanças
        if (updated_metrics.get('people_impacted') != current_metrics.get('people_impacted') or
            updated_metrics.get('budget_used') != current_metrics.get('budget_used') or
            updated_metrics.get('progress_percentage') != current_metrics.get('progress_percentage')):
            print("  ✅ Métricas foram atualizadas!")
        else:
            print("  ❌ Métricas NÃO foram atualizadas automaticamente")
    else:
        print(f"  ❌ Erro ao buscar métricas atualizadas: {response.status_code}")
    
    # 4. Verificar endpoint de tracking completo
    print("\n🔍 4. Verificando endpoint de tracking completo:")
    tracking_url = f"{API_BASE}/api/v1/tracking/project-tracking/{PROJECT_SLUG}/"
    response = requests.get(tracking_url, headers=headers)
    
    if response.status_code == 200:
        tracking_data = response.json()
        metrics = tracking_data.get('metrics', {})
        updates = tracking_data.get('updates', [])
        
        print(f"  Total de updates: {len(updates)}")
        print(f"  Último update: {updates[0].get('title', 'N/A') if updates else 'Nenhum'}")
        print(f"  Métricas - Pessoas: {metrics.get('people_impacted', 0)}")
        print(f"  Métricas - Orçamento: {metrics.get('budget_used', '0')}")
    else:
        print(f"  ❌ Erro ao buscar dados de tracking: {response.status_code}")

if __name__ == "__main__":
    test_api_after_update()
