# backend/volunteers/management/commands/populate_volunteer_data.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from volunteers.models import VolunteerSkill, VolunteerOpportunity


class Command(BaseCommand):
    help = 'Popula dados iniciais para o sistema de voluntários'

    def handle(self, *args, **options):
        self.stdout.write('Criando habilidades de voluntários...')
        
        # Criar habilidades
        skills_data = [
            ('Programação', 'Desenvolvimento de software e aplicações', 'technical'),
            ('Design Gráfico', 'Criação de materiais visuais', 'technical'),
            ('Ensino', 'Educação e treinamento', 'education'),
            ('Enfermagem', 'Cuidados de saúde básicos', 'healthcare'),
            ('Construção', 'Trabalhos de construção e reforma', 'construction'),
            ('Administração', 'Gestão e organização', 'administrative'),
            ('Culinária', 'Preparação de alimentos', 'other'),
            ('Tradução', 'Tradução de idiomas', 'technical'),
            ('Psicologia', 'Apoio psicológico e aconselhamento', 'healthcare'),
            ('Marketing', 'Promoção e divulgação', 'administrative'),
            ('Fotografia', 'Documentação visual', 'technical'),
            ('Jardinagem', 'Cultivo e manutenção de plantas', 'other'),
            ('Mecânica', 'Reparos e manutenção', 'technical'),
            ('Costura', 'Confecção e reparos de roupas', 'other'),
            ('Música', 'Ensino e performance musical', 'education'),
            # Adicionais (Cabo Delgado / contexto humanitário)
            ('Mediação Comunitária', 'Facilitação de diálogo e resolução de conflitos locais', 'social'),
            ('Apoio Psicossocial', 'Suporte emocional em contextos de crise', 'healthcare'),
            ('Logística Humanitária', 'Organização e distribuição de recursos em operações humanitárias', 'administrative'),
            ('Distribuição de Alimentos', 'Apoio na logística e entrega de alimentos a comunidades vulneráveis', 'social'),
            ('Água e Saneamento (WASH)', 'Atividades de promoção de higiene, água e saneamento básico', 'healthcare'),
            ('Sensibilização em Saúde', 'Campanhas de prevenção (malária, cólera, HIV, nutrição)', 'healthcare'),
            ('Educação Comunitária', 'Educação informal e palestras comunitárias', 'education'),
            ('Agricultura Sustentável', 'Técnicas de cultivo resiliente e agroecologia', 'other'),
            ('Nutrição', 'Promoção de alimentação equilibrada e combate à desnutrição', 'healthcare'),
            ('Gestão de Abrigos', 'Organização e apoio a centros/abrigos temporários', 'administrative'),
            ('Monitoramento e Avaliação', 'Coleta e análise de dados de projetos', 'administrative'),
            ('Alfabetização', 'Ensino de leitura e escrita básica', 'education'),
            ('Tradução de Línguas Locais', 'Interpretação (Makonde, Emakhuwa, Mwani)', 'social'),
            ('Resposta a Emergências', 'Apoio em evacuação, primeiros auxílios e coordenação inicial', 'healthcare'),
            ('Primeiros Socorros Avançados', 'Atendimento pré-hospitalar básico ampliado', 'healthcare'),
            ('Proteção Infantil', 'Atividades de proteção e suporte a crianças vulneráveis', 'social'),
            ('Igualdade de Gênero', 'Promoção de direitos e proteção de mulheres e raparigas', 'social'),
            ('Segurança Alimentar', 'Atividades voltadas à melhoria da disponibilidade de alimentos', 'other'),
            ('Coleta de Dados (Digital)', 'Uso de ferramentas digitais para registro de campo', 'technical'),
            ('Mapeamento Comunitário', 'Cartografia participativa / OpenStreetMap', 'technical'),
            ('Rádio Comunitária', 'Produção e locução para sensibilização social', 'social'),
            ('Gestão de Queixas e Feedback', 'Receção e encaminhamento de feedback comunitário', 'administrative'),
            ('Cadeia de Suprimentos', 'Gestão de inventário e fluxo de materiais', 'administrative'),
        ]
        
        for name, description, category in skills_data:
            skill, created = VolunteerSkill.objects.get_or_create(
                name=name,
                defaults={'description': description, 'category': category}
            )
            if created:
                self.stdout.write(f'  ✓ Criada habilidade: {name}')
        
        # Criar oportunidades (apenas se existir um usuário admin)
        admin_users = User.objects.filter(is_superuser=True)
        if admin_users.exists():
            admin_user = admin_users.first()
            self.stdout.write('Criando oportunidades de voluntariado...')
            
            opportunities_data = [
                {
                    'title': 'Ensino de Informática para Idosos',
                    'description': 'Ensinar conceitos básicos de informática para pessoas da terceira idade em centro comunitário.',
                    'location': 'Centro Comunitário - Maputo',
                    'is_remote': False,
                    'estimated_hours': 8,
                    'people_helped_estimate': 15,
                    'urgency_level': 'medium',
                    'required_skills': ['Programação', 'Ensino']
                },
                {
                    'title': 'Apoio em Campanha de Vacinação',
                    'description': 'Auxiliar profissionais de saúde em campanha de vacinação infantil.',
                    'location': 'Hospital Central de Maputo',
                    'is_remote': False,
                    'estimated_hours': 12,
                    'people_helped_estimate': 50,
                    'urgency_level': 'high',
                    'required_skills': ['Enfermagem', 'Administração']
                },
                {
                    'title': 'Desenvolvimento de Site para ONG',
                    'description': 'Criar website institucional para organização não-governamental local.',
                    'location': '',
                    'is_remote': True,
                    'estimated_hours': 20,
                    'people_helped_estimate': 1,
                    'urgency_level': 'low',
                    'required_skills': ['Programação', 'Design Gráfico']
                },
                {
                    'title': 'Construção de Poço de Água',
                    'description': 'Participar na construção de poço de água potável em comunidade rural.',
                    'location': 'Distrito de Marracuene',
                    'is_remote': False,
                    'estimated_hours': 40,
                    'people_helped_estimate': 200,
                    'urgency_level': 'critical',
                    'required_skills': ['Construção']
                },
                {
                    'title': 'Aulas de Culinária Nutritiva',
                    'description': 'Ensinar técnicas de culinária nutritiva para mães em situação vulnerável.',
                    'location': 'Centro de Saúde - Matola',
                    'is_remote': False,
                    'estimated_hours': 6,
                    'people_helped_estimate': 25,
                    'urgency_level': 'medium',
                    'required_skills': ['Culinária', 'Ensino']
                },
                {
                    'title': 'Tradução de Materiais Educativos',
                    'description': 'Traduzir materiais educativos sobre saúde do português para línguas locais.',
                    'location': '',
                    'is_remote': True,
                    'estimated_hours': 15,
                    'people_helped_estimate': 100,
                    'urgency_level': 'medium',
                    'required_skills': ['Tradução']
                }
            ]
            
            for opp_data in opportunities_data:
                required_skills_names = opp_data.pop('required_skills', [])
                
                opportunity, created = VolunteerOpportunity.objects.get_or_create(
                    title=opp_data['title'],
                    defaults={
                        **opp_data,
                        'created_by': admin_user,
                        'status': 'open'
                    }
                )
                
                if created:
                    # Adicionar habilidades requeridas
                    for skill_name in required_skills_names:
                        try:
                            skill = VolunteerSkill.objects.get(name=skill_name)
                            opportunity.required_skills.add(skill)
                        except VolunteerSkill.DoesNotExist:
                            pass
                    
                    self.stdout.write(f'  ✓ Criada oportunidade: {opp_data["title"]}')
        
        else:
            self.stdout.write(
                self.style.WARNING('Nenhum usuário administrador encontrado. Oportunidades não foram criadas.')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Dados de voluntários populados com sucesso!')
        )
