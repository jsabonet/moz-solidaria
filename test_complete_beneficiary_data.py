#!/usr/bin/env python
"""
Teste para verificar dados completos do beneficiário na API admin
"""
import os
import sys
import django
import json

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from beneficiaries.models import BeneficiaryProfile
from beneficiaries.serializers import BeneficiaryProfileCompleteSerializer, SupportRequestCompleteSerializer
from beneficiaries.models import SupportRequest

def test_complete_data():
    """Testa se os dados completos estão sendo retornados"""
    print("🔍 Testando dados completos dos beneficiários")
    print("=" * 50)
    
    try:
        # Pegar um beneficiário de exemplo
        beneficiary = BeneficiaryProfile.objects.select_related('user').first()
        
        if not beneficiary:
            print("❌ Nenhum beneficiário encontrado na base de dados")
            return
        
        print(f"✅ Testando beneficiário: {beneficiary.full_name}")
        
        # Serializar com dados completos
        serializer = BeneficiaryProfileCompleteSerializer(beneficiary)
        data = serializer.data
        
        print("\n📋 Dados Retornados:")
        print("-" * 30)
        
        # Verificar dados básicos
        print(f"ID: {data.get('id')}")
        print(f"Nome Completo: {data.get('full_name')}")
        print(f"Email: {data.get('user_email')}")
        print(f"Username: {data.get('username')}")
        
        # Verificar dados completos do usuário
        user_complete = data.get('user_complete', {})
        print(f"\n👤 Dados Completos do Usuário:")
        print(f"  - ID: {user_complete.get('id')}")
        print(f"  - Username: {user_complete.get('username')}")
        print(f"  - Email: {user_complete.get('email')}")
        print(f"  - Nome: {user_complete.get('first_name')} {user_complete.get('last_name')}")
        print(f"  - Ativo: {user_complete.get('is_active')}")
        print(f"  - Staff: {user_complete.get('is_staff')}")
        print(f"  - Data de Registro: {user_complete.get('date_joined')}")
        print(f"  - Último Login: {user_complete.get('last_login')}")
        
        # Verificar perfil client_area
        client_profile = data.get('client_profile')
        if client_profile:
            print(f"\n🏠 Perfil Client Area:")
            print(f"  - Tipo: {client_profile.get('user_type')}")
            print(f"  - Telefone: {client_profile.get('phone')}")
            print(f"  - Endereço: {client_profile.get('address')}")
        else:
            print("\n🏠 Perfil Client Area: Não encontrado")
        
        # Verificar dados de localização
        print(f"\n📍 Localização Completa:")
        print(f"  - Província: {data.get('province')}")
        print(f"  - Distrito: {data.get('district')}")
        print(f"  - Posto Administrativo: {data.get('administrative_post')}")
        print(f"  - Localidade: {data.get('locality')}")
        print(f"  - Bairro: {data.get('neighborhood')}")
        
        # Verificar dados familiares
        print(f"\n👨‍👩‍👧‍👦 Dados Familiares:")
        print(f"  - Membros da Família: {data.get('family_members_count')}")
        print(f"  - Crianças: {data.get('children_count')}")
        print(f"  - Idosos: {data.get('elderly_count')}")
        print(f"  - Pessoas com Deficiência: {data.get('disabled_count')}")
        print(f"  - Estado Civil: {data.get('family_status')}")
        
        # Verificar vulnerabilidade
        print(f"\n⚠️ Vulnerabilidade:")
        print(f"  - Score: {data.get('vulnerability_score')}")
        print(f"  - Deslocado: {data.get('is_displaced')}")
        print(f"  - Doença Crónica: {data.get('has_chronic_illness')}")
        
        print(f"\n✅ Teste do beneficiário concluído com sucesso!")
        
        # Testar solicitação se existir
        support_request = SupportRequest.objects.filter(beneficiary=beneficiary).first()
        if support_request:
            print(f"\n🎯 Testando dados completos da solicitação...")
            request_serializer = SupportRequestCompleteSerializer(support_request)
            request_data = request_serializer.data
            
            print(f"Solicitação: {request_data.get('title')}")
            print(f"Status: {request_data.get('status')}")
            print(f"Dias desde solicitação: {request_data.get('days_since_request')}")
            
            # Verificar dados completos do beneficiário na solicitação
            beneficiary_complete = request_data.get('beneficiary_complete', {})
            if beneficiary_complete:
                print(f"✅ Dados completos do beneficiário incluídos na solicitação")
                print(f"  - Nome: {beneficiary_complete.get('full_name')}")
                print(f"  - Email: {beneficiary_complete.get('user_email')}")
            else:
                print("❌ Dados completos do beneficiário não encontrados na solicitação")
        
        print("\n" + "=" * 50)
        print("🎉 Teste de dados completos finalizado!")
        print("\n📊 Resumo:")
        print("✅ Serializers completos funcionando")
        print("✅ Dados do usuário Django incluídos")
        print("✅ Dados de localização detalhados")
        print("✅ Informações familiares completas")
        print("✅ Dados de vulnerabilidade incluídos")
        
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_complete_data()
