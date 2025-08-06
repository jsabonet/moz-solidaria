#!/usr/bin/env python3
"""
Script para testar os dados do ProjectDetail.tsx
Verifica se os beneficiários e progresso estão sendo exibidos corretamente
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_public_projects_api():
    """Testa o endpoint público de projetos"""
    print("🔍 Testando API pública de projetos...")
    
    try:
        # Buscar lista de projetos
        response = requests.get(f"{BASE_URL}/api/v1/projects/public/projects/")
        
        if response.status_code == 200:
            data = response.json()
            projects = data.get('results', [])
            
            print(f"✅ Encontrados {len(projects)} projetos públicos")
            
            for project in projects:
                print(f"\n📊 Projeto: {project['name']} (ID: {project['id']}, Slug: {project['slug']})")
                print(f"   📈 Progresso: {project['progress_percentage']}% - {project['progress_status']}")
                print(f"   👥 Beneficiários: {project['current_beneficiaries']}/{project['target_beneficiaries']}")
                print(f"   🖼️ Imagem: {project['featured_image']}")
                print(f"   📍 Local: {project['location']}")
                print(f"   🏷️ Status: {project['status']}")
                
                # Testar endpoint individual
                individual_response = requests.get(f"{BASE_URL}/api/v1/projects/public/projects/{project['id']}/")
                if individual_response.status_code == 200:
                    individual_data = individual_response.json()
                    print(f"   ✅ Endpoint individual OK - tem {len(individual_data.get('updates', []))} updates")
                    
                    # Verificar se tem dados de tracking
                    tracking_response = requests.get(f"{BASE_URL}/api/v1/tracking/project-tracking/{project['slug']}/")
                    if tracking_response.status_code == 200:
                        tracking_data = tracking_response.json()
                        print(f"   📊 Dados de tracking encontrados:")
                        print(f"      - Pessoas impactadas: {tracking_data.get('metrics', {}).get('people_impacted', 'N/A')}")
                        print(f"      - Progresso tracking: {tracking_data.get('metrics', {}).get('progress_percentage', 'N/A')}%")
                        print(f"      - Updates: {len(tracking_data.get('updates', []))}")
                        print(f"      - Marcos: {len(tracking_data.get('milestones', []))}")
                        print(f"      - Evidências: {len(tracking_data.get('evidences', []))}")
                    else:
                        print(f"   ⚠️ Dados de tracking não disponíveis (status: {tracking_response.status_code})")
                else:
                    print(f"   ❌ Erro no endpoint individual: {individual_response.status_code}")
                    
        else:
            print(f"❌ Erro na API: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erro: {e}")

def test_data_consistency():
    """Testa a consistência dos dados entre APIs"""
    print("\n🔍 Testando consistência de dados...")
    
    try:
        # Buscar projetos
        projects_response = requests.get(f"{BASE_URL}/api/v1/projects/public/projects/")
        if projects_response.status_code != 200:
            print("❌ Não foi possível buscar projetos")
            return
            
        projects = projects_response.json().get('results', [])
        
        for project in projects[:2]:  # Testar só os primeiros 2 projetos
            slug = project['slug']
            print(f"\n📊 Analisando consistência para '{project['name']}' (slug: {slug})")
            
            # Dados da API pública
            public_data = {
                'progress_percentage': project['progress_percentage'],
                'current_beneficiaries': project['current_beneficiaries'],
                'target_beneficiaries': project['target_beneficiaries']
            }
            
            # Dados do tracking
            tracking_response = requests.get(f"{BASE_URL}/api/v1/tracking/project-tracking/{slug}/")
            tracking_data = {}
            if tracking_response.status_code == 200:
                tracking_info = tracking_response.json()
                tracking_data = {
                    'progress_percentage': tracking_info.get('metrics', {}).get('progress_percentage'),
                    'people_impacted': tracking_info.get('metrics', {}).get('people_impacted'),
                    'total_updates': len(tracking_info.get('updates', []))
                }
            
            print(f"   📊 API Pública:")
            print(f"      - Progresso: {public_data['progress_percentage']}%")
            print(f"      - Beneficiários: {public_data['current_beneficiaries']}/{public_data['target_beneficiaries']}")
            
            print(f"   📈 Sistema Tracking:")
            print(f"      - Progresso: {tracking_data.get('progress_percentage', 'N/A')}%")
            print(f"      - Pessoas impactadas: {tracking_data.get('people_impacted', 'N/A')}")
            print(f"      - Total de updates: {tracking_data.get('total_updates', 'N/A')}")
            
            # Verificar se há discrepâncias
            if tracking_data.get('progress_percentage') and public_data['progress_percentage'] != tracking_data['progress_percentage']:
                print(f"   ⚠️ DISCREPÂNCIA no progresso: Público={public_data['progress_percentage']}% vs Tracking={tracking_data['progress_percentage']}%")
            
            if tracking_data.get('people_impacted') and public_data['current_beneficiaries'] != tracking_data['people_impacted']:
                print(f"   ⚠️ DISCREPÂNCIA nos beneficiários: Público={public_data['current_beneficiaries']} vs Tracking={tracking_data['people_impacted']}")
            
            if tracking_data.get('progress_percentage') == public_data['progress_percentage'] and tracking_data.get('people_impacted') == public_data['current_beneficiaries']:
                print(f"   ✅ Dados consistentes entre APIs")
                
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    print("🚀 Testando dados do ProjectDetail.tsx")
    print("=" * 50)
    
    test_public_projects_api()
    test_data_consistency()
    
    print("\n✅ Teste concluído!")
    print("\nℹ️ Para verificar no frontend:")
    print("1. Acesse http://localhost:5173/projects/[slug]")
    print("2. Verifique se os números de beneficiários e progresso estão corretos")
    print("3. Compare com os dados mostrados acima")
