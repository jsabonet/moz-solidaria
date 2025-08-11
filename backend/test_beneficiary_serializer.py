#!/usr/bin/env python
"""
Script para testar a criação de beneficiários com todos os campos
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from beneficiaries.models import BeneficiaryProfile
from beneficiaries.serializers import BeneficiaryProfileCreateSerializer
from rest_framework.test import APIRequestFactory
from django.test import RequestFactory

def test_beneficiary_creation():
    print("=== TESTE DE CRIAÇÃO DE BENEFICIÁRIO ===\n")
    
    # Dados completos como vem do formulário
    form_data = {
        'full_name': 'Maria Silva Teste',
        'date_of_birth': '1990-05-15',
        'gender': 'F',  # Usar código correto
        'phone_number': '+258840123456',
        'district': 'Maputo',
        'administrative_post': 'KaMpfumo',
        'locality': 'Polana',
        'neighborhood': 'Polana Cimento A',
        'address': 'Rua da Paz, 123',
        'province': 'Maputo',
        'family_members_count': 5,
        'children_count': 2,
        'elderly_count': 1,
        'disabled_count': 0,
        'family_status': 'casado',
        'education_level': 'secundario',
        'employment_status': 'formal',  # Usar código correto
        'monthly_income': 15000,
        'housing_type': 'alugada',
        'has_electricity': True,
        'has_water': False,
        'is_displaced': False,
        'has_chronic_illness': True,
        'priority_needs': 'alimentacao,saude'
    }
    
    print("1. Dados do formulário:")
    for key, value in form_data.items():
        print(f"   {key}: {value} ({type(value).__name__})")
    
    # Criar usuário de teste se não existir
    try:
        user = User.objects.get(username='test_beneficiary')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='test_beneficiary',
            email='test@example.com',
            password='testpass123'
        )
        print(f"\n2. Usuário criado: {user.username}")
    else:
        print(f"\n2. Usuário existente: {user.username}")
    
    # Testar serializer
    print("\n3. Testando BeneficiaryProfileCreateSerializer...")
    
    # Simular request com usuário
    factory = RequestFactory()
    request = factory.post('/')
    request.user = user
    
    # Criar contexto para serializer
    context = {'request': request}
    
    # Instanciar e validar serializer
    serializer = BeneficiaryProfileCreateSerializer(data=form_data, context=context)
    
    print(f"   Serializer é válido: {serializer.is_valid()}")
    
    if not serializer.is_valid():
        print("   ERROS DE VALIDAÇÃO:")
        for field, errors in serializer.errors.items():
            print(f"      {field}: {errors}")
        return False
    
    # Salvar
    try:
        beneficiary = serializer.save()
        print(f"   Beneficiário criado com ID: {beneficiary.id}")
        
        # Verificar campos salvos
        print("\n4. Verificando campos salvos:")
        print(f"   Nome: {beneficiary.full_name}")
        print(f"   Crianças: {beneficiary.children_count}")
        print(f"   Idosos: {beneficiary.elderly_count}")
        print(f"   Pessoas com deficiência: {beneficiary.disabled_count}")
        print(f"   Educação: {beneficiary.education_level}")
        print(f"   Emprego: {beneficiary.employment_status}")
        print(f"   Deslocado: {beneficiary.is_displaced}")
        print(f"   Doença crónica: {beneficiary.has_chronic_illness}")
        print(f"   Província: {beneficiary.province}")
        print(f"   Renda mensal: {beneficiary.monthly_income}")
        
        # Verificar se todos os campos problemáticos foram salvos corretamente
        problematic_fields = [
            'children_count', 'elderly_count', 'disabled_count', 
            'employment_status', 'education_level', 'is_displaced', 
            'has_chronic_illness'
        ]
        
        print("\n5. Verificação específica dos campos problemáticos:")
        all_ok = True
        for field in problematic_fields:
            db_value = getattr(beneficiary, field)
            form_value = form_data[field]
            status = "✓" if db_value == form_value else "✗"
            print(f"   {field}: {form_value} → {db_value} {status}")
            if db_value != form_value:
                all_ok = False
        
        if all_ok:
            print("\n🎉 SUCESSO: Todos os campos foram salvos corretamente!")
        else:
            print("\n❌ ERRO: Alguns campos não foram salvos corretamente!")
            
        return all_ok
        
    except Exception as e:
        print(f"   ERRO ao salvar: {e}")
        return False

if __name__ == '__main__':
    test_beneficiary_creation()
