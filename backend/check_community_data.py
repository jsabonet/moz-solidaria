#!/usr/bin/env python3
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from volunteers.models import VolunteerProfile
from beneficiaries.models import BeneficiaryProfile 
from partnerships.models import PartnerMessage, PartnerProjectAssignment

print('📊 DADOS REAIS NO BANCO:')

# Verificar Voluntários
print(f'\n👥 VOLUNTÁRIOS:')
print(f'  Total: {VolunteerProfile.objects.count()}')
print(f'  Ativos: {VolunteerProfile.objects.filter(is_active=True).count()}')

# Verificar Beneficiários
print(f'\n🤝 BENEFICIÁRIOS:')
print(f'  Total: {BeneficiaryProfile.objects.count()}')

# Verificar quais campos de status existem
if BeneficiaryProfile.objects.count() > 0:
    first_beneficiary = BeneficiaryProfile.objects.first()
    print(f'  Campos disponíveis: {[f.name for f in first_beneficiary._meta.fields]}')
    
    # Tentar diferentes campos de status
    for status_value in ['ativo', 'active', 'approved', 'verified']:
        try:
            count = BeneficiaryProfile.objects.filter(status=status_value).count()
            if count > 0:
                print(f'  Status "{status_value}": {count}')
        except:
            pass

# Verificar Parcerias (através de PartnerMessage como proxy)
print(f'\n🤝 PARCERIAS:')
print(f'  Mensagens de Parceiros: {PartnerMessage.objects.count()}')
print(f'  Atribuições de Projetos: {PartnerProjectAssignment.objects.count()}')

if PartnerMessage.objects.count() > 0:
    first_message = PartnerMessage.objects.first()
    print(f'  Campos de PartnerMessage: {[f.name for f in first_message._meta.fields]}')

if PartnerProjectAssignment.objects.count() > 0:
    first_assignment = PartnerProjectAssignment.objects.first()
    print(f'  Campos de PartnerProjectAssignment: {[f.name for f in first_assignment._meta.fields]}')
