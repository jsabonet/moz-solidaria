#!/usr/bin/env python3
"""
Debug das métricas para verificar o que está sendo retornado pela API
"""
import os
import sys
import django

# Configurar Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

import requests
import json

def debug_metrics_api():
    """Debug das métricas via API"""
    print("=== DEBUG: MÉTRICAS VIA API ===")
    
    # Obter token
    auth_response = requests.post('http://localhost:8000/api/v1/auth/token/', {
        'username': 'admin',
        'password': 'admin123'
    })
    
    if auth_response.status_code != 200:
        print(f"❌ Erro na autenticação: {auth_response.status_code}")
        return
    
    token = auth_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Buscar dados do projeto
    response = requests.get('http://localhost:8000/api/v1/tracking/project-tracking/Joel/', headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar projeto: {response.status_code}")
        return
    
    data = response.json()
    
    print("📊 DADOS RETORNADOS PELA API:")
    print(f"Nome do projeto: {data.get('name')}")
    print(f"Slug: {data.get('slug')}")
    print()
    
    print("🔢 MÉTRICAS:")
    metrics = data.get('metrics', {})
    if metrics:
        print(f"  ID: {metrics.get('id')}")
        print(f"  Pessoas impactadas: {metrics.get('people_impacted')}")
        print(f"  Orçamento usado: {metrics.get('budget_used')}")
        print(f"  Orçamento total: {metrics.get('budget_total')}")
        print(f"  Progresso: {metrics.get('progress_percentage')}%")
        print(f"  Marcos concluídos: {metrics.get('completed_milestones')}")
        print(f"  Total marcos: {metrics.get('total_milestones')}")
        print(f"  Data início: {metrics.get('start_date')}")
        print(f"  Data fim: {metrics.get('end_date')}")
        print(f"  Última atualização: {metrics.get('last_updated')}")
    else:
        print("  ❌ Nenhuma métrica encontrada!")
    
    print()
    print("📝 ATUALIZAÇÕES:")
    updates = data.get('updates', [])
    print(f"  Total de updates: {len(updates)}")
    if updates:
        print("  Últimos 3 updates:")
        for i, update in enumerate(updates[:3]):
            print(f"    {i+1}. {update.get('title')} - {update.get('people_impacted', 0)} pessoas")
    
    print()
    print("📈 DADOS CALCULADOS:")
    total_people_from_updates = sum(update.get('people_impacted', 0) for update in updates)
    total_budget_from_updates = sum(float(update.get('budget_spent', 0) or 0) for update in updates)
    print(f"  Total pessoas (de updates): {total_people_from_updates}")
    print(f"  Total orçamento (de updates): {total_budget_from_updates}")
    
    print()
    print("🔍 ESTRUTURA COMPLETA DAS MÉTRICAS:")
    print(json.dumps(metrics, indent=2, default=str))

if __name__ == "__main__":
    debug_metrics_api()
