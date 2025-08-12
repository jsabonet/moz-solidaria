#!/usr/bin/env python3
import requests
import json

# Login e teste
login_url = 'http://127.0.0.1:8000/api/v1/auth/token/'
login_data = {'username': 'admin', 'password': 'admin123'}

login_response = requests.post(login_url, json=login_data)
if login_response.status_code == 200:
    token = login_response.json()['access']
    
    stats_url = 'http://127.0.0.1:8000/api/v1/reports/reports/advanced_stats/?range=6months'
    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}
    
    stats_response = requests.get(stats_url, headers=headers)
    if stats_response.status_code == 200:
        data = stats_response.json()
        print('📊 DADOS FINAIS DAS ESTATÍSTICAS AVANÇADAS:')
        
        # Comunidade
        if 'communityMetrics' in data['data']:
            print('\n👥 COMUNIDADE:')
            community = data['data']['communityMetrics']
            print(f"  Voluntários: {community['totalVolunteers']} total, {community['activeVolunteers']} ativos")
            print(f"  Beneficiários: {community['totalBeneficiaries']} total, {community['activeBeneficiaries']} ativos")
            print(f"  Parceiros: {community['totalPartners']} total, {community['activePartners']} ativos")
        
        # Projetos
        if 'projectMetrics' in data['data']:
            print('\n📋 PROJETOS:')
            projects = data['data']['projectMetrics']
            print(f"  Total: {projects['totalProjects']}, Ativos: {projects['activeProjects']}, Completos: {projects['completedProjects']}")
            print(f"  Orçamento total: {projects['totalBudget']} MZN")
            print(f"  Orçamento gasto: {projects['totalSpent']} MZN")
            print(f"  Taxa de conclusão: {projects['averageCompletion']}%")
        
        # Performance
        if 'performanceMetrics' in data['data']:
            print('\n📈 PERFORMANCE:')
            perf = data['data']['performanceMetrics']
            for key, value in perf.items():
                print(f"  {key}: {value}")
                
        # Financeiro
        if 'financialMetrics' in data['data']:
            print('\n💰 FINANCEIRO:')
            fin = data['data']['financialMetrics']
            print(f"  Total doações: {fin['totalDonations']} MZN")
            print(f"  Crescimento: {fin['donationsGrowth']}%")
            print(f"  Doação média: {fin['averageDonation']} MZN")
            print(f"  Doadores recorrentes: {fin['recurringDonors']}")
    else:
        print(f'Erro: {stats_response.text}')
else:
    print(f'Erro no login: {login_response.text}')
