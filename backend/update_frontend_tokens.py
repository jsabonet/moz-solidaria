#!/usr/bin/env python3
import requests
import json
import os
import subprocess

BASE_URL = "http://localhost:8000"

def update_frontend_tokens():
    print("=== ATUALIZANDO TOKENS DO FRONTEND ===\n")
    
    # 1. Obter token válido
    print("1. Obtendo token válido...")
    login_data = {"username": "admin", "password": "admin123"}
    
    try:
        response = requests.post(f"{BASE_URL}/api/v1/auth/token/", json=login_data)
        if response.status_code == 200:
            tokens = response.json()
            access_token = tokens.get('access')
            refresh_token = tokens.get('refresh')
            print(f"   ✓ Tokens obtidos com sucesso")
            
            # 2. Criar arquivo JS para atualizar localStorage
            js_script = f"""
// Atualizar tokens no localStorage
console.log('Atualizando tokens...');
localStorage.setItem('authToken', '{access_token}');
localStorage.setItem('refreshToken', '{refresh_token}');
console.log('Tokens atualizados com sucesso!');
console.log('Token valido ate aproximadamente 1 hora');
alert('Tokens atualizados! Recarregue a pagina para aplicar as mudancas.');
"""
            
            # Salvar script JS
            with open('update_tokens.js', 'w', encoding='utf-8') as f:
                f.write(js_script)
            
            print("\n2. Script JavaScript criado: update_tokens.js")
            print("\n📝 INSTRUÇÕES PARA ATUALIZAR:")
            print("   OPÇÃO 1 - Via DevTools:")
            print("     1. Abra o DevTools (F12)")
            print("     2. Vá para Console")
            print("     3. Cole e execute:")
            print(f"        localStorage.setItem('authToken', '{access_token}');")
            print(f"        localStorage.setItem('refreshToken', '{refresh_token}');")
            print("     4. Recarregue a página")
            
            print("\n   OPÇÃO 2 - Via arquivo JS:")
            print("     1. Abra o DevTools (F12)")
            print("     2. Vá para Console")
            print("     3. Arraste o arquivo 'update_tokens.js' para o console")
            print("     4. Recarregue a página")
            
            print("\n✅ FRONTEND SERÁ ATUALIZADO AUTOMATICAMENTE")
            print("   - O ProjectDataBridge agora inclui renovação automática")
            print("   - Se o token expirar, será renovado automaticamente")
            print("   - Em caso de falha, o usuário será direcionado para login")
            
        else:
            print(f"   ✗ Erro no login: {response.text}")
            
    except Exception as e:
        print(f"   ✗ Erro de conexão: {e}")

if __name__ == "__main__":
    update_frontend_tokens()
