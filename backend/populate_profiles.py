"""
Script para popular o banco de dados com dados iniciais do sistema de perfis
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import (
    UserProfile, Cause, Skill, Certification, Donor, Beneficiary, 
    Volunteer, VolunteerCertification, Partner
)


def create_causes():
    """Criar causas básicas"""
    causes_data = [
        {
            'name': 'Alimentação',
            'description': 'Combate à fome e distribuição de alimentos',
            'icon': 'utensils',
            'color': 'green'
        },
        {
            'name': 'Educação',
            'description': 'Acesso à educação e material escolar',
            'icon': 'book',
            'color': 'blue'
        },
        {
            'name': 'Saúde',
            'description': 'Cuidados médicos e prevenção',
            'icon': 'heart',
            'color': 'red'
        },
        {
            'name': 'Habitação',
            'description': 'Construção e reabilitação de casas',
            'icon': 'home',
            'color': 'orange'
        },
        {
            'name': 'Emergência',
            'description': 'Resposta rápida a situações de crise',
            'icon': 'alert-triangle',
            'color': 'yellow'
        },
        {
            'name': 'Formação Profissional',
            'description': 'Capacitação e desenvolvimento de habilidades',
            'icon': 'briefcase',
            'color': 'purple'
        }
    ]
    
    print("Criando causas...")
    for cause_data in causes_data:
        cause, created = Cause.objects.get_or_create(
            name=cause_data['name'],
            defaults=cause_data
        )
        if created:
            print(f"✅ Causa criada: {cause.name}")
        else:
            print(f"ℹ️ Causa já existe: {cause.name}")


def create_skills():
    """Criar habilidades para voluntários"""
    skills_data = [
        {'name': 'Medicina', 'category': 'Saúde'},
        {'name': 'Enfermagem', 'category': 'Saúde'},
        {'name': 'Psicologia', 'category': 'Saúde'},
        {'name': 'Educação Infantil', 'category': 'Educação'},
        {'name': 'Ensino Fundamental', 'category': 'Educação'},
        {'name': 'Alfabetização', 'category': 'Educação'},
        {'name': 'Construção Civil', 'category': 'Construção'},
        {'name': 'Carpintaria', 'category': 'Construção'},
        {'name': 'Eletricidade', 'category': 'Construção'},
        {'name': 'Cozinha', 'category': 'Alimentação'},
        {'name': 'Nutrição', 'category': 'Alimentação'},
        {'name': 'Gestão de Projetos', 'category': 'Administração'},
        {'name': 'Contabilidade', 'category': 'Administração'},
        {'name': 'Marketing', 'category': 'Comunicação'},
        {'name': 'Fotografia', 'category': 'Comunicação'},
        {'name': 'Informática', 'category': 'Tecnologia'},
        {'name': 'Costura', 'category': 'Artesanato'},
        {'name': 'Agricultura', 'category': 'Agricultura'},
        {'name': 'Tradução', 'category': 'Idiomas'},
        {'name': 'Transporte', 'category': 'Logística'}
    ]
    
    print("Criando habilidades...")
    for skill_data in skills_data:
        skill, created = Skill.objects.get_or_create(**skill_data)
        if created:
            print(f"✅ Habilidade criada: {skill.name}")
        else:
            print(f"ℹ️ Habilidade já existe: {skill.name}")


def create_certifications():
    """Criar certificações"""
    certifications_data = [
        {
            'name': 'Primeiros Socorros',
            'issuer': 'Cruz Vermelha',
            'description': 'Certificação em primeiros socorros básicos',
            'validity_period': 24
        },
        {
            'name': 'Gestão de Voluntários',
            'issuer': 'Instituto de Voluntariado',
            'description': 'Capacitação em gestão e coordenação de voluntários',
            'validity_period': 36
        },
        {
            'name': 'Educação Comunitária',
            'issuer': 'Ministério da Educação',
            'description': 'Formação em educação para comunidades',
            'validity_period': 60
        },
        {
            'name': 'Construção Sustentável',
            'issuer': 'Instituto de Construção',
            'description': 'Técnicas de construção sustentável',
            'validity_period': 48
        },
        {
            'name': 'Segurança Alimentar',
            'issuer': 'OMS',
            'description': 'Certificação em manipulação segura de alimentos',
            'validity_period': 12
        }
    ]
    
    print("Criando certificações...")
    for cert_data in certifications_data:
        cert, created = Certification.objects.get_or_create(
            name=cert_data['name'],
            issuer=cert_data['issuer'],
            defaults=cert_data
        )
        if created:
            print(f"✅ Certificação criada: {cert.name}")
        else:
            print(f"ℹ️ Certificação já existe: {cert.name}")


def create_sample_users():
    """Criar usuários de exemplo para cada tipo"""
    
    # Doador
    print("\nCriando usuário doador de exemplo...")
    donor_user, created = User.objects.get_or_create(
        username='doador_exemplo',
        defaults={
            'email': 'doador@example.com',
            'first_name': 'João',
            'last_name': 'Silva',
            'password': 'pbkdf2_sha256$320000$test'  # Senha: test123
        }
    )
    if created:
        donor_profile = UserProfile.objects.create(
            user=donor_user,
            user_type='donor',
            phone='+258842345678',
            address='Maputo, Moçambique'
        )
        donor = Donor.objects.create(
            user_profile=donor_profile,
            total_donated=5000.00,
            preferred_frequency='monthly'
        )
        # Adicionar causas preferidas
        donor.preferred_causes.set(Cause.objects.filter(name__in=['Alimentação', 'Educação']))
        print(f"✅ Doador criado: {donor_user.get_full_name()}")
    else:
        print(f"ℹ️ Doador já existe: {donor_user.get_full_name()}")
    
    # Beneficiário
    print("Criando usuário beneficiário de exemplo...")
    beneficiary_user, created = User.objects.get_or_create(
        username='beneficiario_exemplo',
        defaults={
            'email': 'beneficiario@example.com',
            'first_name': 'Maria',
            'last_name': 'António',
            'password': 'pbkdf2_sha256$320000$test'
        }
    )
    if created:
        beneficiary_profile = UserProfile.objects.create(
            user=beneficiary_user,
            user_type='beneficiary',
            phone='+258847654321',
            address='Mocímboa da Praia, Cabo Delgado'
        )
        beneficiary = Beneficiary.objects.create(
            user_profile=beneficiary_profile,
            family_size=5,
            children_count=3,
            family_status='married',
            community='Unidade',
            district='Mocímboa da Praia',
            province='Cabo Delgado',
            verification_status='verified'
        )
        print(f"✅ Beneficiário criado: {beneficiary_user.get_full_name()}")
    else:
        print(f"ℹ️ Beneficiário já existe: {beneficiary_user.get_full_name()}")
    
    # Voluntário
    print("Criando usuário voluntário de exemplo...")
    volunteer_user, created = User.objects.get_or_create(
        username='voluntario_exemplo',
        defaults={
            'email': 'voluntario@example.com',
            'first_name': 'Carlos',
            'last_name': 'Mendes',
            'password': 'pbkdf2_sha256$320000$test'
        }
    )
    if created:
        volunteer_profile = UserProfile.objects.create(
            user=volunteer_user,
            user_type='volunteer',
            phone='+258849876543',
            address='Pemba, Cabo Delgado'
        )
        volunteer = Volunteer.objects.create(
            user_profile=volunteer_profile,
            availability_type='weekends',
            max_hours_per_week=10,
            total_hours=150,
            projects_completed=3,
            rating=4.8,
            transportation_available=True
        )
        # Adicionar habilidades
        volunteer.skills.set(Skill.objects.filter(name__in=['Medicina', 'Gestão de Projetos']))
        volunteer.preferred_causes.set(Cause.objects.filter(name__in=['Saúde', 'Emergência']))
        print(f"✅ Voluntário criado: {volunteer_user.get_full_name()}")
    else:
        print(f"ℹ️ Voluntário já existe: {volunteer_user.get_full_name()}")
    
    # Parceiro
    print("Criando usuário parceiro de exemplo...")
    partner_user, created = User.objects.get_or_create(
        username='parceiro_exemplo',
        defaults={
            'email': 'parceiro@example.com',
            'first_name': 'Ana',
            'last_name': 'Costa',
            'password': 'pbkdf2_sha256$320000$test'
        }
    )
    if created:
        partner_profile = UserProfile.objects.create(
            user=partner_user,
            user_type='partner',
            phone='+258841234567',
            address='Maputo, Moçambique'
        )
        partner = Partner.objects.create(
            user_profile=partner_profile,
            organization_name='ONG Exemplo',
            organization_type='ngo',
            partnership_level='strategic',
            contact_person='Ana Costa',
            contact_email='ana@ongexemplo.org',
            contact_phone='+258841234567'
        )
        # Adicionar áreas de especialização
        partner.areas_of_expertise.set(Cause.objects.filter(name__in=['Educação', 'Saúde']))
        print(f"✅ Parceiro criado: {partner.organization_name}")
    else:
        print(f"ℹ️ Parceiro já existe: {partner_user.get_full_name()}")


def main():
    """Função principal"""
    print("🚀 Iniciando população do banco de dados com dados do sistema de perfis...\n")
    
    create_causes()
    print()
    create_skills()
    print()
    create_certifications()
    print()
    create_sample_users()
    
    print("\n✅ População do banco de dados concluída!")
    print("\n📊 Resumo:")
    print(f"   • Causas: {Cause.objects.count()}")
    print(f"   • Habilidades: {Skill.objects.count()}")
    print(f"   • Certificações: {Certification.objects.count()}")
    print(f"   • Perfis de usuário: {UserProfile.objects.count()}")
    print(f"   • Doadores: {Donor.objects.count()}")
    print(f"   • Beneficiários: {Beneficiary.objects.count()}")
    print(f"   • Voluntários: {Volunteer.objects.count()}")
    print(f"   • Parceiros: {Partner.objects.count()}")
    
    print("\n🔑 Credenciais de teste:")
    print("   • Doador: doador_exemplo / test123")
    print("   • Beneficiário: beneficiario_exemplo / test123")
    print("   • Voluntário: voluntario_exemplo / test123")
    print("   • Parceiro: parceiro_exemplo / test123")


if __name__ == '__main__':
    main()
