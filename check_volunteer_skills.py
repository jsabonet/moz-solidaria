#!/usr/bin/env python
"""
Script para verificar e popular habilidades de voluntários
"""
import os
import sys
import django

# Configurar Django
sys.path.append('backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from volunteers.models import VolunteerSkill

def check_and_create_skills():
    """
    Verifica se existem habilidades no banco e cria algumas padrão se necessário
    """
    print("🔍 Verificando habilidades de voluntários...")
    
    # Verificar quantas habilidades existem
    skills_count = VolunteerSkill.objects.count()
    print(f"📊 Habilidades existentes: {skills_count}")
    
    if skills_count == 0:
        print("⚠️  Nenhuma habilidade encontrada. Criando habilidades padrão...")
        
        # Habilidades padrão por categoria
        default_skills = [
            # Técnicas
            ('Programação', 'Desenvolvimento de software e aplicações', 'technical'),
            ('Design Gráfico', 'Criação de materiais visuais e gráficos', 'technical'),
            ('Fotografia', 'Documentação visual de eventos e atividades', 'technical'),
            ('Informática Básica', 'Conhecimentos básicos de computador e internet', 'technical'),
            ('Manutenção de Computadores', 'Reparo e manutenção de equipamentos', 'technical'),
            
            # Saúde
            ('Primeiros Socorros', 'Atendimento básico de emergências médicas', 'healthcare'),
            ('Enfermagem', 'Cuidados de saúde e assistência médica', 'healthcare'),
            ('Psicologia', 'Apoio psicológico e aconselhamento', 'healthcare'),
            ('Nutrição', 'Orientação nutricional e alimentar', 'healthcare'),
            ('Fisioterapia', 'Reabilitação e exercícios terapêuticos', 'healthcare'),
            
            # Educação
            ('Ensino de Português', 'Alfabetização e ensino da língua portuguesa', 'education'),
            ('Ensino de Matemática', 'Ensino de matemática básica e avançada', 'education'),
            ('Ensino de Inglês', 'Ensino da língua inglesa', 'education'),
            ('Educação Infantil', 'Trabalho com crianças pequenas', 'education'),
            ('Formação de Adultos', 'Educação para adultos e idosos', 'education'),
            
            # Construção
            ('Construção Civil', 'Trabalhos de construção e reforma', 'construction'),
            ('Eletricidade', 'Instalações e reparos elétricos', 'construction'),
            ('Encanamento', 'Instalações hidráulicas e reparos', 'construction'),
            ('Carpintaria', 'Trabalhos em madeira e móveis', 'construction'),
            ('Pintura', 'Pintura de casas e edifícios', 'construction'),
            
            # Administrativo
            ('Contabilidade', 'Gestão financeira e contábil', 'administrative'),
            ('Gestão de Projetos', 'Coordenação e gestão de iniciativas', 'administrative'),
            ('Recursos Humanos', 'Gestão de pessoas e recrutamento', 'administrative'),
            ('Marketing', 'Promoção e divulgação de projetos', 'administrative'),
            ('Logística', 'Organização e distribuição de recursos', 'administrative'),
            
            # Social
            ('Trabalho Social', 'Assistência social e comunitária', 'social'),
            ('Mediação de Conflitos', 'Resolução pacífica de disputas', 'social'),
            ('Organização Comunitária', 'Mobilização e organização social', 'social'),
            ('Cuidado de Idosos', 'Assistência a pessoas idosas', 'social'),
            ('Cuidado Infantil', 'Cuidado e proteção de crianças', 'social'),
            
            # Outras
            ('Condução', 'Transporte de pessoas e materiais', 'other'),
            ('Cozinha', 'Preparo de refeições para grupos', 'other'),
            ('Jardinagem', 'Cuidado de plantas e hortas', 'other'),
            ('Música', 'Ensino e apresentações musicais', 'other'),
            ('Desporto', 'Atividades esportivas e recreativas', 'other'),
        ]
        
        created_count = 0
        for name, description, category in default_skills:
            skill, created = VolunteerSkill.objects.get_or_create(
                name=name,
                defaults={
                    'description': description,
                    'category': category
                }
            )
            if created:
                created_count += 1
                print(f"  ✅ Criada: {name}")
        
        print(f"🎉 {created_count} habilidades criadas com sucesso!")
    
    else:
        print("✅ Habilidades já existem no banco de dados:")
        for skill in VolunteerSkill.objects.all()[:10]:
            print(f"  • {skill.name} ({skill.get_category_display()})")
        
        if skills_count > 10:
            print(f"  ... e mais {skills_count - 10} habilidades")

def test_api_endpoint():
    """
    Testa se o endpoint da API funciona
    """
    print("\n🔧 Testando configuração da API...")
    
    from django.test import Client
    from django.contrib.auth.models import User
    from rest_framework.authtoken.models import Token
    
    # Criar um usuário de teste se não existir
    test_user, created = User.objects.get_or_create(
        username='test_volunteer',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    # Criar token
    token, _ = Token.objects.get_or_create(user=test_user)
    
    # Testar endpoint
    client = Client()
    response = client.get('/api/v1/volunteers/skills/', 
                         HTTP_AUTHORIZATION=f'Token {token.key}')
    
    print(f"📡 Status da resposta: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if isinstance(data, dict) and 'results' in data:
            skills_returned = len(data['results'])
        else:
            skills_returned = len(data) if isinstance(data, list) else 0
        print(f"✅ API funcionando! Retornou {skills_returned} habilidades")
    else:
        print(f"❌ API com problema. Conteúdo: {response.content.decode()}")
    
    # Limpar usuário de teste
    test_user.delete()

if __name__ == '__main__':
    try:
        check_and_create_skills()
        test_api_endpoint()
        print("\n✅ Verificação concluída!")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
