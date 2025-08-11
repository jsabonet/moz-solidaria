#!/usr/bin/env python
"""
Script para testar o sistema completo de beneficiários com dados do frontend
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from beneficiaries.models import BeneficiaryProfile
from beneficiaries.serializers import BeneficiaryProfileCreateSerializer, BeneficiaryProfileCompleteSerializer
from rest_framework.test import APIRequestFactory
from django.test import RequestFactory

def test_end_to_end_system():
    print("=== TESTE COMPLETO DO SISTEMA DE BENEFICIÁRIOS ===\n")
    
    # Dados EXATOS como vem do formulário frontend CORRIGIDO
    frontend_data = {
        'full_name': 'Ana Paula Santos',
        'date_of_birth': '1985-03-20',
        'gender': 'F',  # CORRETO
        'phone_number': '+258870123456',
        'district': 'Matola',
        'administrative_post': 'Matola Sede',
        'locality': 'Machava',
        'neighborhood': 'Machava Rio',
        'address': 'Rua dos Coqueiros, 45',
        'province': 'Maputo',
        'family_members_count': 4,
        'children_count': 3,
        'elderly_count': 0,
        'disabled_count': 1,
        'family_status': 'casado',
        'education_level': 'primario',
        'employment_status': 'informal',  # CORRETO (não mais 'empregado')
        'monthly_income': 5000,
        'housing_type': 'propria',
        'has_electricity': False,
        'has_water': True,
        'is_displaced': True,
        'has_chronic_illness': False,
        'priority_needs': 'habitacao,educacao,saude',
        'displacement_reason': 'Ciclone afetou nossa área'
    }
    
    print("1. DADOS DO FRONTEND (após correções):")
    for key, value in frontend_data.items():
        print(f"   {key}: {value} ({type(value).__name__})")
    
    # Criar usuário
    try:
        user = User.objects.get(username='test_frontend_user')
        user.delete()  # Limpar teste anterior
    except User.DoesNotExist:
        pass
    
    user = User.objects.create_user(
        username='test_frontend_user',
        email='frontend@test.com',
        password='testpass123'
    )
    print(f"\n2. USUÁRIO CRIADO: {user.username}")
    
    # ETAPA 1: Criar via CreateSerializer
    factory = RequestFactory()
    request = factory.post('/')
    request.user = user
    context = {'request': request}
    
    create_serializer = BeneficiaryProfileCreateSerializer(data=frontend_data, context=context)
    
    print(f"\n3. VALIDAÇÃO CREATE SERIALIZER: {create_serializer.is_valid()}")
    
    if not create_serializer.is_valid():
        print("   ERROS:")
        for field, errors in create_serializer.errors.items():
            print(f"      {field}: {errors}")
        return False
    
    # Salvar
    beneficiary = create_serializer.save()
    print(f"   Beneficiário criado com ID: {beneficiary.id}")
    
    # ETAPA 2: Verificar dados salvos
    print(f"\n4. DADOS SALVOS NO BANCO:")
    saved_data = {
        'children_count': beneficiary.children_count,
        'elderly_count': beneficiary.elderly_count, 
        'disabled_count': beneficiary.disabled_count,
        'employment_status': beneficiary.employment_status,
        'education_level': beneficiary.education_level,
        'is_displaced': beneficiary.is_displaced,
        'has_chronic_illness': beneficiary.has_chronic_illness,
        'displacement_reason': beneficiary.displacement_reason
    }
    
    for field, value in saved_data.items():
        original = frontend_data.get(field)
        status = "✓" if value == original else "✗"
        print(f"   {field}: {original} → {value} {status}")
    
    # ETAPA 3: Testar CompleteSerializer (usado no admin)
    print(f"\n5. TESTE COMPLETE SERIALIZER (ADMIN):")
    complete_serializer = BeneficiaryProfileCompleteSerializer(beneficiary)
    admin_data = complete_serializer.data
    
    problematic_fields = [
        'children_count', 'elderly_count', 'disabled_count',
        'employment_status', 'education_level', 'is_displaced',
        'has_chronic_illness'
    ]
    
    print("   Dados retornados para o admin:")
    all_correct = True
    for field in problematic_fields:
        admin_value = admin_data.get(field)
        original_value = frontend_data.get(field)
        status = "✓" if admin_value == original_value else "✗"
        print(f"   {field}: {admin_value} {status}")
        if admin_value != original_value:
            all_correct = False
    
    # ETAPA 4: Simular resposta da API
    print(f"\n6. SIMULAÇÃO RESPOSTA API (/beneficiaries/profiles/):")
    api_response = {
        'id': beneficiary.id,
        'full_name': beneficiary.full_name,
        'children_count': beneficiary.children_count,
        'elderly_count': beneficiary.elderly_count,
        'disabled_count': beneficiary.disabled_count,
        'employment_status': beneficiary.employment_status,
        'education_level': beneficiary.education_level,
        'is_displaced': beneficiary.is_displaced,
        'has_chronic_illness': beneficiary.has_chronic_illness,
        'displacement_reason': beneficiary.displacement_reason
    }
    
    for field, value in api_response.items():
        if field == 'id' or field == 'full_name':
            continue
        original = frontend_data.get(field)
        status = "✓" if value == original else "✗"
        print(f"   {field}: {value} {status}")
    
    # RESULTADO FINAL
    print(f"\n🎯 RESULTADO FINAL:")
    if all_correct:
        print("✅ SUCESSO COMPLETO! Todos os campos problemáticos estão funcionando:")
        print("   - Formulário → Banco de dados: ✓")
        print("   - Banco de dados → Admin: ✓") 
        print("   - Fluxo completo end-to-end: ✓")
    else:
        print("❌ Ainda há problemas na cadeia de dados")
    
    print(f"\n📊 ESTATÍSTICAS:")
    print(f"   Beneficiário ID: {beneficiary.id}")
    print(f"   Nome: {beneficiary.full_name}")
    print(f"   Crianças: {beneficiary.children_count}")
    print(f"   Pessoas com deficiência: {beneficiary.disabled_count}")
    print(f"   Status emprego: {beneficiary.employment_status}")
    print(f"   É deslocado: {beneficiary.is_displaced}")
    print(f"   Razão deslocamento: {beneficiary.displacement_reason}")

if __name__ == '__main__':
    test_end_to_end_system()
