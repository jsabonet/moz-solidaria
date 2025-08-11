#!/usr/bin/env python
"""
Script final para verificar compatibilidade completa frontend-backend
"""
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from beneficiaries.models import BeneficiaryProfile
from beneficiaries.serializers import BeneficiaryProfileCreateSerializer

def verify_field_compatibility():
    print("=== VERIFICAÇÃO DE COMPATIBILIDADE FRONTEND-BACKEND ===\n")
    
    # Campos que vem do frontend ATUAL
    frontend_fields = {
        'full_name', 'date_of_birth', 'gender', 'phone_number', 'alternative_phone',
        'province', 'district', 'administrative_post', 'locality', 'neighborhood', 
        'address_details', 'family_status', 'family_members_count', 'children_count',
        'elderly_count', 'disabled_count', 'education_level', 'employment_status',
        'monthly_income', 'is_displaced', 'displacement_reason', 'has_chronic_illness',
        'chronic_illness_details', 'priority_needs', 'additional_information'
    }
    
    # Campos do modelo Django
    model_fields = set()
    for field in BeneficiaryProfile._meta.fields:
        if field.name not in ['id', 'user', 'created_at', 'updated_at', 'is_verified', 'verification_date', 'verified_by']:
            model_fields.add(field.name)
    
    # Campos do serializer
    serializer_fields = set(BeneficiaryProfileCreateSerializer.Meta.fields)
    if 'user' in serializer_fields:
        serializer_fields.remove('user')
    
    print("1. ANÁLISE DE CAMPOS:")
    print(f"   Frontend envia: {len(frontend_fields)} campos")
    print(f"   Modelo possui: {len(model_fields)} campos")
    print(f"   Serializer aceita: {len(serializer_fields)} campos")
    
    print(f"\n2. CAMPOS DO FRONTEND:")
    for field in sorted(frontend_fields):
        print(f"   - {field}")
    
    print(f"\n3. CAMPOS DO MODELO:")
    for field in sorted(model_fields):
        print(f"   - {field}")
    
    print(f"\n4. CAMPOS DO SERIALIZER:")
    for field in sorted(serializer_fields):
        print(f"   - {field}")
    
    # Verificar incompatibilidades
    frontend_only = frontend_fields - model_fields
    model_only = model_fields - frontend_fields
    serializer_only = serializer_fields - frontend_fields
    missing_in_serializer = frontend_fields - serializer_fields
    
    print(f"\n5. INCOMPATIBILIDADES:")
    
    if frontend_only:
        print(f"   ❌ Campos enviados pelo FRONTEND que NÃO existem no modelo:")
        for field in sorted(frontend_only):
            print(f"      - {field}")
    
    if model_only:
        print(f"   ⚠️  Campos do MODELO que NÃO são enviados pelo frontend:")
        for field in sorted(model_only):
            print(f"      - {field}")
    
    if missing_in_serializer:
        print(f"   ❌ Campos do frontend que NÃO estão no serializer:")
        for field in sorted(missing_in_serializer):
            print(f"      - {field}")
    
    if serializer_only:
        print(f"   ⚠️  Campos do serializer que NÃO são enviados pelo frontend:")
        for field in sorted(serializer_only):
            print(f"      - {field}")
    
    # Resultado final
    if not frontend_only and not missing_in_serializer:
        print(f"\n✅ COMPATIBILIDADE PERFEITA!")
        print("   Todos os campos do frontend existem no modelo e estão no serializer")
    else:
        print(f"\n❌ INCOMPATIBILIDADES ENCONTRADAS!")
        print("   Alguns campos podem não estar sendo salvos corretamente")
    
    return len(frontend_only) == 0 and len(missing_in_serializer) == 0

if __name__ == '__main__':
    verify_field_compatibility()
