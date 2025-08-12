#!/usr/bin/env python3
"""
Teste específico para verificar dados de beneficiários
"""

import os
import sys
import django

# Configurar Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from reports.export_views import ExportViewSet

def test_beneficiaries_data():
    """Testar dados específicos de beneficiários"""
    print("🔍 TESTANDO DADOS DE BENEFICIÁRIOS")
    print("=" * 60)
    
    export_view = ExportViewSet()
    
    # Testar dados detalhados
    print("📊 Buscando dados detalhados de beneficiários...")
    beneficiaries_data = export_view._get_beneficiaries_data_detailed()
    
    print(f"📈 Total de registros encontrados: {len(beneficiaries_data)}")
    print("\n🔍 PREVIEW DOS DADOS:")
    print("-" * 60)
    
    # Mostrar os primeiros 5 registros
    for i, beneficiary in enumerate(beneficiaries_data[:5]):
        print(f"\n📋 BENEFICIÁRIO {i+1}:")
        print(f"   ID: {beneficiary['id']}")
        print(f"   Nome: {beneficiary['nome']}")
        print(f"   Localização: {beneficiary['localizacao']}")
        print(f"   Tipo: {beneficiary['tipo']}")
        print(f"   Pessoas Impactadas: {beneficiary['pessoas_impactadas']}")
        print(f"   Data Cadastro: {beneficiary['data_cadastro']}")
        print(f"   Projetos: {beneficiary['projetos']}")
        print(f"   Status: {beneficiary['status']}")
        print(f"   Observações: {beneficiary['observacoes'][:80]}...")
    
    print("\n" + "=" * 60)
    
    # Verificar se há dados "N/A"
    na_count = 0
    for beneficiary in beneficiaries_data:
        for key, value in beneficiary.items():
            if value == 'N/A':
                na_count += 1
    
    if na_count == 0:
        print("✅ SUCESSO: Nenhum campo 'N/A' encontrado!")
    else:
        print(f"⚠️  ATENÇÃO: {na_count} campos 'N/A' ainda encontrados")
    
    print(f"📊 Total de campos analisados: {len(beneficiaries_data) * 9}")
    print("🎉 TESTE CONCLUÍDO!")
    
    return len(beneficiaries_data) > 0

if __name__ == "__main__":
    try:
        success = test_beneficiaries_data()
        if success:
            print("\n✅ TESTE DE BENEFICIÁRIOS: SUCESSO")
        else:
            print("\n❌ TESTE DE BENEFICIÁRIOS: FALHOU")
    except Exception as e:
        print(f"\n❌ ERRO NO TESTE: {str(e)}")
