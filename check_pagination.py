#!/usr/bin/env python3
"""
Verificar paginação da API de usuários
"""

import requests

def check_users_pagination():
    # Login
    token_response = requests.post(
        'http://localhost:8000/api/v1/auth/token/',
        json={'username': 'admin', 'password': 'admin123'}
    )
    
    if token_response.status_code != 200:
        print("Erro no login")
        return
    
    token = token_response.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Verificar primeira página
    users_response = requests.get(
        'http://localhost:8000/api/v1/auth/users/',
        headers=headers
    )
    
    if users_response.status_code != 200:
        print(f"Erro na API: {users_response.status_code}")
        return
    
    data = users_response.json()
    
    print("📊 ANÁLISE DA PAGINAÇÃO DE USUÁRIOS")
    print("=" * 50)
    print(f"Status da resposta: {users_response.status_code}")
    print(f"Total de usuários no banco: {data.get('count', 'N/A')}")
    print(f"Usuários retornados nesta página: {len(data.get('results', []))}")
    print(f"Próxima página: {data.get('next', 'N/A')}")
    print(f"Página anterior: {data.get('previous', 'N/A')}")
    
    # Listar alguns usuários
    print(f"\n👥 PRIMEIROS USUÁRIOS:")
    for i, user in enumerate(data.get('results', [])[:10]):
        print(f"  {i+1}. {user['username']} ({user['email']}) - {'Ativo' if user['is_active'] else 'Inativo'}")
    
    # Verificar se há mais páginas
    if data.get('next'):
        print(f"\n⚠️ ATENÇÃO: Há mais páginas de usuários!")
        print(f"URL da próxima página: {data['next']}")
        
        # Buscar próxima página
        next_response = requests.get(data['next'], headers=headers)
        if next_response.status_code == 200:
            next_data = next_response.json()
            print(f"Usuários na próxima página: {len(next_data.get('results', []))}")
        
        total_pages = (data['count'] + 19) // 20  # Arredondar para cima
        print(f"Total estimado de páginas: {total_pages}")
    else:
        print(f"\n✅ Todos os usuários estão sendo exibidos em uma única página")

if __name__ == "__main__":
    check_users_pagination()
