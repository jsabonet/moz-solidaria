#!/usr/bin/env python
"""
Script para testar a correção do bug de registro de usuários
"""
import os
import sys
import django

# Configurar Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from client_area.serializers import UserRegistrationSerializer
from core.models import UserProfile, Donor, Beneficiary, Volunteer, Partner

def test_registration(user_type='donor'):
    """
    Testa o registro de um usuário
    """
    print(f"\n=== Testando registro para tipo: {user_type} ===")
    
    # Dados de teste
    test_data = {
        'username': f'test_{user_type}_user',
        'email': f'test_{user_type}@example.com',
        'password': 'TestPassword123!',
        'first_name': 'Test',
        'last_name': 'User',
        'phone': '+258123456789',
        'user_type': user_type
    }
    
    # Limpar usuário de teste se existir
    User.objects.filter(username=test_data['username']).delete()
    
    try:
        # Testar serializer
        serializer = UserRegistrationSerializer(data=test_data)
        
        if serializer.is_valid():
            user = serializer.save()
            print(f"✅ Usuário criado com sucesso: {user.username}")
            
            # Verificar se o perfil foi criado
            profile = UserProfile.objects.get(user=user)
            print(f"✅ Perfil criado: {profile}")
            print(f"   - Telefone: {profile.phone}")
            
            # Verificar perfil específico baseado no tipo
            if user_type == 'donor':
                donor = Donor.objects.get(user_profile=profile)
                print(f"✅ Perfil de doador criado: {donor}")
            elif user_type == 'beneficiary':
                beneficiary = Beneficiary.objects.get(user_profile=profile)
                print(f"✅ Perfil de beneficiário criado: {beneficiary}")
                print(f"   - Tamanho da família: {beneficiary.family_size}")
                print(f"   - Província: {beneficiary.province}")
            elif user_type == 'volunteer':
                volunteer = Volunteer.objects.get(user_profile=profile)
                print(f"✅ Perfil de voluntário criado: {volunteer}")
            elif user_type == 'partner':
                partner = Partner.objects.get(user_profile=profile)
                print(f"✅ Perfil de parceiro criado: {partner}")
                print(f"   - Organização: {partner.organization_name}")
                print(f"   - Tipo: {partner.organization_type}")
            
            print("✅ Teste passou com sucesso!")
            return True
            
        else:
            print("❌ Erros de validação:")
            for field, errors in serializer.errors.items():
                print(f"   - {field}: {errors}")
            return False
            
    except Exception as e:
        print(f"❌ Erro durante teste: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Limpar dados de teste
        User.objects.filter(username=test_data['username']).delete()

def main():
    """
    Executa todos os testes
    """
    print("🧪 Iniciando testes de correção do registro de usuários...")
    
    user_types = ['donor', 'beneficiary', 'volunteer', 'partner']
    results = {}
    
    for user_type in user_types:
        results[user_type] = test_registration(user_type)
    
    print("\n" + "="*50)
    print("📊 RESUMO DOS TESTES:")
    print("="*50)
    
    all_passed = True
    for user_type, passed in results.items():
        status = "✅ PASSOU" if passed else "❌ FALHOU"
        print(f"{user_type.upper()}: {status}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 Todos os testes passaram! A correção foi bem-sucedida.")
    else:
        print("\n⚠️  Alguns testes falharam. Verifique os erros acima.")
    
    return all_passed

if __name__ == '__main__':
    main()
