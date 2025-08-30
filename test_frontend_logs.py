#!/usr/bin/env python
"""
Teste para verificar se há logs de acesso aos endpoints de promoção
"""
import requests
import time

print("🔍 Monitorando logs do Django para testar promoções no frontend...")

# Pegar o último log antes do teste
logs_url = "d:\\Projectos\\moz-solidaria-hub-main\\logs\\django.log"

try:
    with open(logs_url, 'r', encoding='utf-8') as f:
        initial_lines = len(f.readlines())
        
    print(f"📊 Logs iniciais: {initial_lines} linhas")
    print("🖱️ Agora faça uma promoção no frontend (http://localhost:8081/dashboard/users)")
    print("⏱️ Aguardando por 30 segundos...")
    
    time.sleep(30)
    
    # Verificar novos logs
    with open(logs_url, 'r', encoding='utf-8') as f:
        final_lines = f.readlines()
        
    if len(final_lines) > initial_lines:
        print(f"📈 Novos logs detectados: {len(final_lines) - initial_lines} linhas")
        print("🔍 Novos logs:")
        for line in final_lines[initial_lines:]:
            if 'promote_to_profile' in line or 'PATCH' in line or 'POST' in line:
                print(f"   🎯 {line.strip()}")
            elif any(word in line.lower() for word in ['error', 'warning', 'auth']):
                print(f"   ⚠️ {line.strip()}")
    else:
        print("❌ Nenhum novo log detectado - promoções podem não estar sendo enviadas")
        
except Exception as e:
    print(f"❌ Erro ao ler logs: {e}")
    
print("\n" + "="*60)
print("📋 INSTRUÇÕES PARA TESTE MANUAL:")
print("1. Acesse: http://localhost:8081/dashboard/users")
print("2. Faça login se necessário")
print("3. Clique no dropdown de um usuário")
print("4. Selecione uma promoção (ex: Blog Manager)")
print("5. Abra o console do navegador (F12) para ver os logs")
print("6. Verifique se aparecem mensagens de debug")
print("="*60)
