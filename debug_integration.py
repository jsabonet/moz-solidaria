#!/usr/bin/env python3
"""
Teste para verificar se a integração de dados está funcionando corretamente
simulando exatamente o que o frontend faz
"""

import requests
import json

def test_complete_integration():
    """Simula exatamente o que fetchCompleteProjectData faz"""
    
    slug = "Joel"
    API_BASE = "http://127.0.0.1:8000/api/v1"
    
    print("🧪 SIMULANDO INTEGRAÇÃO COMPLETA DE DADOS")
    print("=" * 50)
    print(f"📍 Testando projeto: {slug}")
    
    # 1. Buscar dados básicos (como fetchProjectDetail)
    print("\n1️⃣ Buscando dados básicos do projeto...")
    try:
        # Estratégia 1: Busca por slug como parâmetro
        response = requests.get(f"{API_BASE}/projects/public/projects/?slug={slug}")
        if response.status_code == 200:
            data = response.json()
            if data['results']:
                project = data['results'][0]
                print("   ✅ Dados básicos encontrados!")
                print(f"   📋 current_beneficiaries: {project.get('current_beneficiaries', 'N/A')}")
                print(f"   📋 target_beneficiaries: {project.get('target_beneficiaries', 'N/A')}")
                print(f"   📋 progress_percentage: {project.get('progress_percentage', 'N/A')}")
            else:
                print("   ❌ Projeto não encontrado nos resultados")
                return
        else:
            print(f"   ❌ Erro na busca básica: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Erro na busca básica: {e}")
        return
    
    # 2. Buscar dados de tracking
    print("\n2️⃣ Buscando dados de tracking...")
    tracking_data = None
    try:
        tracking_response = requests.get(f"{API_BASE}/tracking/project-tracking/{slug}/")
        if tracking_response.status_code == 200:
            tracking_data = tracking_response.json()
            print("   ✅ Dados de tracking encontrados!")
            print(f"   📊 people_impacted: {tracking_data.get('metrics', {}).get('people_impacted', 'N/A')}")
            print(f"   📊 progress_percentage: {tracking_data.get('metrics', {}).get('progress_percentage', 'N/A')}")
            print(f"   📊 completed_milestones: {tracking_data.get('metrics', {}).get('completed_milestones', 'N/A')}")
            print(f"   📊 total_milestones: {tracking_data.get('metrics', {}).get('total_milestones', 'N/A')}")
            print(f"   📊 budget_used: {tracking_data.get('metrics', {}).get('budget_used', 'N/A')}")
            print(f"   📊 budget_total: {tracking_data.get('metrics', {}).get('budget_total', 'N/A')}")
        else:
            print(f"   ⚠️ Dados de tracking não disponíveis: {tracking_response.status_code}")
    except Exception as e:
        print(f"   ⚠️ Erro ao buscar tracking: {e}")
    
    # 3. Simular criação do objeto metrics (como fetchCompleteProjectData faz)
    print("\n3️⃣ Simulando criação do objeto metrics...")
    if tracking_data and tracking_data.get('metrics'):
        tm = tracking_data['metrics']  # tracking metrics
        
        metrics = {
            'peopleImpacted': tm.get('people_impacted') or project.get('current_beneficiaries', 0),
            'budgetUsed': tm.get('budget_used') or project.get('current_spending', 0),
            'budgetTotal': tm.get('budget_total') or project.get('target_budget', 0),
            'progressPercentage': tm.get('progress_percentage') or project.get('progress_percentage', 0),
            'completedMilestones': tm.get('completed_milestones', 0),
            'totalMilestones': tm.get('total_milestones', 0),
            'lastUpdate': tm.get('last_update') or project.get('updated_at')
        }
        
        print("   ✅ Objeto metrics criado:")
        for key, value in metrics.items():
            print(f"   📊 {key}: {value}")
    else:
        print("   ⚠️ Sem dados de tracking, usando apenas dados básicos")
        metrics = {
            'peopleImpacted': project.get('current_beneficiaries', 0),
            'budgetUsed': project.get('current_spending', 0),
            'budgetTotal': project.get('target_budget', 0),
            'progressPercentage': project.get('progress_percentage', 0),
            'completedMilestones': 0,
            'totalMilestones': 0,
            'lastUpdate': project.get('updated_at')
        }
        
        print("   📊 Objeto metrics (apenas dados básicos):")
        for key, value in metrics.items():
            print(f"   📊 {key}: {value}")
    
    # 4. Simular as funções do ProjectDetail.tsx
    print("\n4️⃣ Simulando funções do ProjectDetail.tsx...")
    
    def getCurrentBeneficiaries():
        return metrics.get('peopleImpacted', 0)
    
    def calculateBeneficiariesProgress():
        current = getCurrentBeneficiaries()
        target = project.get('target_beneficiaries', 0)
        return (current / target) * 100 if target > 0 else 0
    
    def calculateProjectProgress():
        return metrics.get('progressPercentage', 0)
    
    def getCompletedMilestones():
        return metrics.get('completedMilestones', 0)
    
    def getTotalMilestones():
        return metrics.get('totalMilestones', 0)
    
    print(f"   🎯 getCurrentBeneficiaries(): {getCurrentBeneficiaries():,}")
    print(f"   🎯 calculateBeneficiariesProgress(): {calculateBeneficiariesProgress():.1f}%")
    print(f"   🎯 calculateProjectProgress(): {calculateProjectProgress():.1f}%")
    print(f"   🎯 getCompletedMilestones(): {getCompletedMilestones()}")
    print(f"   🎯 getTotalMilestones(): {getTotalMilestones()}")
    
    # 5. Comparar com o que o frontend está mostrando
    print("\n5️⃣ COMPARAÇÃO COM FRONTEND:")
    frontend_beneficiaries = 0  # O que está aparecendo no frontend
    frontend_progress = 72      # O que está aparecendo no frontend
    frontend_milestones = "0/0" # O que está aparecendo no frontend
    
    expected_beneficiaries = getCurrentBeneficiaries()
    expected_progress = calculateProjectProgress()
    expected_milestones = f"{getCompletedMilestones()}/{getTotalMilestones()}"
    
    print(f"   Frontend mostra beneficiários: {frontend_beneficiaries:,}")
    print(f"   Deveria mostrar beneficiários: {expected_beneficiaries:,}")
    print(f"   Status: {'✅ CORRETO' if frontend_beneficiaries == expected_beneficiaries else '❌ INCORRETO'}")
    
    print(f"   Frontend mostra progresso: {frontend_progress}%")
    print(f"   Deveria mostrar progresso: {expected_progress:.0f}%")
    print(f"   Status: {'✅ CORRETO' if abs(frontend_progress - expected_progress) < 1 else '❌ INCORRETO'}")
    
    print(f"   Frontend mostra marcos: {frontend_milestones}")
    print(f"   Deveria mostrar marcos: {expected_milestones}")
    print(f"   Status: {'✅ CORRETO' if frontend_milestones == expected_milestones else '❌ INCORRETO'}")
    
    # 6. Diagnóstico
    print("\n6️⃣ DIAGNÓSTICO:")
    if expected_beneficiaries > 0 and frontend_beneficiaries == 0:
        print("   🐛 PROBLEMA ENCONTRADO: Beneficiários não estão sendo exibidos corretamente")
        print("   💡 CAUSA PROVÁVEL: fetchCompleteProjectData não está sendo chamada ou dados não estão chegando")
        print("   🔧 SOLUÇÃO: Verificar logs do navegador para ver se a API está sendo chamada")
    else:
        print("   ✅ Integração funcionando corretamente!")

if __name__ == "__main__":
    test_complete_integration()
