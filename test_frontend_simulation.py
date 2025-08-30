#!/usr/bin/env python
"""
Simulação exata do que o frontend faz para promoção
"""
import requests

# URLs da API
base_url = "http://localhost:8000"
login_url = f"{base_url}/api/v1/auth/token/"
users_url = f"{base_url}/api/v1/auth/users/"

print("🔄 SIMULANDO EXATAMENTE O QUE O FRONTEND FAZ")
print("="*50)

try:
    # 1. Login (como o frontend faz)
    print("🔐 1. Fazendo login...")
    login_response = requests.post(login_url, {
        'username': 'admin',
        'password': 'admin123'
    })
    
    if login_response.status_code != 200:
        print(f"❌ Erro no login: {login_response.status_code}")
        exit(1)
        
    token_data = login_response.json()
    access_token = token_data['access']
    
    # 2. Buscar usuários (como o frontend faz na paginação)
    print("📋 2. Buscando usuários...")
    headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
    
    # Simular a busca de todas as páginas
    all_users = []
    page = 1
    while True:
        url = f"{users_url}?page={page}" if page > 1 else users_url
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            break
            
        data = response.json()
        all_users.extend(data['results'])
        
        if not data.get('next'):
            break
        page += 1
    
    print(f"   ✅ {len(all_users)} usuários carregados")
    
    # 3. Selecionar um usuário comum para teste
    test_user = None
    for user in all_users:
        if not user['is_superuser'] and user['username'] not in ['admin', 'joellasmim']:
            test_user = user
            break
    
    if not test_user:
        print("❌ Nenhum usuário de teste adequado encontrado")
        exit(1)
        
    print(f"👤 3. Usuário selecionado: {test_user['username']} (ID: {test_user['id']})")
    
    # 4. Tentar promoção (exatamente como o frontend)
    print("📈 4. Tentando promoção para Blog Manager...")
    promote_url = f"{users_url}{test_user['id']}/promote_to_profile/"
    
    # Headers exatos como o frontend
    promote_headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json',
    }
    
    # Body exato como o frontend
    promote_body = {'profile': 'blog_manager'}
    
    print(f"   📡 URL: {promote_url}")
    print(f"   🔑 Headers: {promote_headers}")
    print(f"   📦 Body: {promote_body}")
    
    promote_response = requests.post(promote_url, 
        headers=promote_headers,
        json=promote_body
    )
    
    print(f"   📊 Status: {promote_response.status_code}")
    
    if promote_response.status_code == 200:
        result = promote_response.json()
        print(f"   ✅ SUCESSO! Resposta: {result}")
        
        # 5. Verificar mudança (como o frontend faria ao refetch)
        print("🔍 5. Verificando mudança...")
        check_response = requests.get(f"{users_url}{test_user['id']}/", headers=headers)
        if check_response.status_code == 200:
            updated_user = check_response.json()
            print(f"   ✅ Usuário atualizado: {updated_user.get('groups', [])}")
        
    else:
        print(f"   ❌ ERRO! Resposta: {promote_response.text}")
        
    # 6. Teste de rebaixamento
    print("📉 6. Testando rebaixamento...")
    demote_response = requests.patch(f"{users_url}{test_user['id']}/",
        headers=promote_headers,
        json={'is_staff': False, 'is_superuser': False}
    )
    
    print(f"   📊 Status rebaixamento: {demote_response.status_code}")
    if demote_response.status_code == 200:
        print(f"   ✅ Rebaixamento bem-sucedido!")
    else:
        print(f"   ❌ Erro no rebaixamento: {demote_response.text}")
        
except Exception as e:
    print(f"❌ Erro na simulação: {e}")

print("\n" + "="*50)
print("📊 CONCLUSÃO:")
print("Se este teste funciona mas o frontend não,")
print("o problema está no JavaScript/React do frontend.")
print("Verifique o console do navegador para erros!")
print("="*50)
