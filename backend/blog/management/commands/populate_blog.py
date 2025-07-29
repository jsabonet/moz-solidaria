from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from blog.models import BlogPost, Category, Tag
from datetime import datetime, timedelta


class Command(BaseCommand):
    help = 'Populate database with sample blog data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Get or create admin user
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@mozsolidaria.org',
                'first_name': 'Admin',
                'last_name': 'MOZ SOLIDÁRIA',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
        
        # Create categories
        categories_data = [
            {'name': 'Educação', 'description': 'Artigos sobre programas educacionais'},
            {'name': 'Saúde', 'description': 'Informações sobre saúde e medicina preventiva'},
            {'name': 'Desenvolvimento Rural', 'description': 'Projetos de desenvolvimento rural'},
            {'name': 'Empoderamento', 'description': 'Programas de empoderamento comunitário'},
            {'name': 'Infraestrutura', 'description': 'Projetos de infraestrutura'},
            {'name': 'Voluntariado', 'description': 'Informações sobre voluntariado'},
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Create tags
        tags_data = [
            'Educação', 'Alfabetização', 'Cabo Delgado', 'Transformação Social',
            'Agricultura', 'Sustentabilidade', 'Segurança Alimentar',
            'Empoderamento Feminino', 'Capacitação', 'Desenvolvimento Econômico',
            'Cooperativas', 'Saúde Preventiva', 'Vacinação', 'Medicina Comunitária',
            'Brigadas Móveis', 'Infraestrutura', 'Água Potável', 'Saneamento'
        ]
        
        tags = []
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            tags.append(tag)
            if created:
                self.stdout.write(f'Created tag: {tag.name}')
        
        # Create blog posts
        posts_data = [
            {
                'title': 'Transformando Vidas através da Educação em Cabo Delgado',
                'excerpt': 'Descubra como nossos programas de alfabetização estão criando oportunidades reais para crianças e adultos em comunidades rurais.',
                'content': '''
<p>A educação é a ferramenta mais poderosa que temos para transformar vidas e comunidades. Em Cabo Delgado, onde muitas famílias foram deslocadas por conflitos, a necessidade de programas educacionais adaptados às circunstâncias locais tornou-se ainda mais urgente.</p>

<h2>O Desafio da Educação em Tempos de Crise</h2>
<p>Quando iniciamos nossos programas de alfabetização, encontramos uma realidade complexa: crianças que nunca haviam frequentado uma escola, adultos que perderam a oportunidade de aprender a ler e escrever, e famílias inteiras vivendo em campos de deslocados sem acesso a qualquer tipo de educação formal.</p>

<p>A situação exigia uma abordagem inovadora. Não podíamos simplesmente replicar o modelo tradicional de ensino - precisávamos criar algo novo, adaptado às necessidades específicas dessas comunidades.</p>

<h2>Metodologia Adaptada</h2>
<p>Desenvolvemos um programa de alfabetização que funciona em três níveis:</p>

<ul>
<li><strong>Alfabetização Infantil:</strong> Aulas lúdicas para crianças de 6 a 12 anos, focadas em português e matemática básica</li>
<li><strong>Educação de Jovens:</strong> Programas acelerados para adolescentes que perderam anos de escolaridade</li>
<li><strong>Alfabetização de Adultos:</strong> Aulas noturnas para pais e mães que querem aprender a ler e escrever</li>
</ul>

<h2>Resultados Transformadores</h2>
<p>Nos últimos 12 meses, conseguimos alfabetizar mais de 250 pessoas em nossas comunidades parceiras. Mas os números só contam parte da história. O que realmente importa são as transformações que vemos todos os dias.</p>

<blockquote>
"Agora posso ler as cartas que meu filho me manda de Maputo. Antes dependia de outros para saber notícias da minha família."
<cite>- Maria Joaquina, 45 anos, participante do programa de alfabetização</cite>
</blockquote>

<h2>O Futuro da Educação em Cabo Delgado</h2>
<p>Nosso trabalho está apenas começando. Para 2024, planejamos expandir nossos programas para alcançar mais 500 pessoas, incluindo a criação de uma biblioteca comunitária móvel que levará livros e recursos educacionais às aldeias mais remotas.</p>

<p>Acreditamos que cada pessoa que aprende a ler e escrever não apenas transforma sua própria vida, mas também se torna um agente de mudança em sua comunidade. É assim que construímos um futuro melhor para Cabo Delgado: uma pessoa, uma família, uma comunidade de cada vez.</p>
                ''',
                'category': 'Educação',
                'tags': ['Educação', 'Alfabetização', 'Cabo Delgado', 'Transformação Social'],
                'is_featured': True,
                'status': 'published'
            },
            {
                'title': 'Projeto de Agricultura Sustentável: Resultados do Primeiro Semestre',
                'excerpt': 'Conheça os impactos positivos das nossas iniciativas de desenvolvimento rural e agricultura sustentável nas comunidades locais.',
                'content': '''
<p>O primeiro semestre de 2024 marcou um momento histórico para nosso programa de agricultura sustentável em Cabo Delgado. Com o apoio de agricultores locais e técnicos especializados, conseguimos implementar técnicas inovadoras que estão transformando a produção agrícola na região.</p>

<h2>Desafios Iniciais</h2>
<p>Quando iniciamos o projeto, enfrentamos diversos desafios: solos degradados pela seca, falta de sementes resistentes e conhecimento limitado sobre técnicas sustentáveis. Muitas famílias haviam perdido suas terras devido aos conflitos e precisavam recomeçar do zero.</p>

<h2>Técnicas Implementadas</h2>
<p>Introduzimos várias práticas sustentáveis:</p>

<ul>
<li><strong>Compostagem:</strong> Aproveitamento de resíduos orgânicos para fertilizar o solo</li>
<li><strong>Rotação de Culturas:</strong> Preservação da fertilidade do solo</li>
<li><strong>Sementes Resistentes:</strong> Variedades adaptadas ao clima local</li>
<li><strong>Sistemas de Irrigação:</strong> Uso eficiente da água disponível</li>
</ul>

<h2>Resultados Alcançados</h2>
<p>Os resultados superaram nossas expectativas. A produtividade aumentou em média 60% nas propriedades participantes do programa. Além disso, 85% das famílias relataram melhoria na segurança alimentar.</p>

<blockquote>
"Minha colheita de milho nunca foi tão boa. As técnicas que aprendi me ajudaram a produzir alimento suficiente para minha família e ainda sobra para vender no mercado."
<cite>- António Muianga, agricultor de Chiure</cite>
</blockquote>

<h2>Próximos Passos</h2>
<p>Para o segundo semestre, planejamos expandir o programa para mais 150 famílias e introduzir culturas de valor comercial como hortaliças e frutas tropicais.</p>
                ''',
                'category': 'Desenvolvimento Rural',
                'tags': ['Agricultura', 'Sustentabilidade', 'Desenvolvimento Rural', 'Segurança Alimentar'],
                'is_featured': False,
                'status': 'published'
            },
            {
                'title': 'Empoderamento Feminino: Histórias de Sucesso',
                'excerpt': 'Mulheres de Cabo Delgado compartilham suas experiências de transformação através dos nossos programas de capacitação.',
                'content': '''
<p>O empoderamento feminino é uma das nossas prioridades na MOZ SOLIDÁRIA. Acreditamos que quando investimos em mulheres, investimos no futuro de toda a comunidade. Neste artigo, compartilhamos algumas das histórias inspiradoras que testemunhamos ao longo do nosso trabalho em Cabo Delgado.</p>

<h2>O Contexto das Mulheres em Cabo Delgado</h2>
<p>Em muitas comunidades rurais de Cabo Delgado, as mulheres enfrentam desafios únicos: acesso limitado à educação, dependência econômica, responsabilidades domésticas e cuidado dos filhos. Os conflitos na região agravaram essa situação, deixando muitas mulheres como chefes de família sem os recursos necessários para sustentarem suas famílias.</p>

<h2>Programas de Capacitação</h2>
<p>Desenvolvemos programas específicos focados no empoderamento feminino:</p>

<ul>
<li><strong>Alfabetização de Mulheres:</strong> Aulas específicas para mães e mulheres adultas</li>
<li><strong>Capacitação Profissional:</strong> Cursos de costura, culinária e artesanato</li>
<li><strong>Educação Financeira:</strong> Gestão de pequenos negócios e poupança</li>
<li><strong>Cooperativas Femininas:</strong> Grupos de apoio mútuo e desenvolvimento econômico</li>
</ul>

<h2>Histórias de Transformação</h2>
<p>Nas nossas comunidades parceiras, acompanhamos transformações extraordinárias:</p>

<blockquote>
"Antes eu dependia totalmente do meu marido. Agora tenho meu próprio negócio de costura e posso contribuir para as despesas da casa. Meus filhos me veem de forma diferente."
<cite>- Amina Assane, 32 anos, Pemba</cite>
</blockquote>

<h2>Impacto nas Comunidades</h2>
<p>O empoderamento das mulheres tem um efeito multiplicador. Quando uma mulher prospera, toda a família e comunidade se beneficiam. Observamos melhorias na educação das crianças, na saúde familiar e na coesão social.</p>

<h2>Metas para 2024</h2>
<p>Para este ano, planejamos formar mais 200 mulheres em diferentes habilidades profissionais e apoiar a criação de 10 novas cooperativas femininas em diferentes distritos de Cabo Delgado.</p>
                ''',
                'category': 'Empoderamento',
                'tags': ['Empoderamento Feminino', 'Capacitação', 'Desenvolvimento Econômico', 'Cooperativas'],
                'is_featured': False,
                'status': 'published'
            },
        ]
        
        for post_data in posts_data:
            # Get category
            category = Category.objects.get(name=post_data['category'])
            
            # Create or get post
            post, created = BlogPost.objects.get_or_create(
                title=post_data['title'],
                defaults={
                    'excerpt': post_data['excerpt'],
                    'content': post_data['content'],
                    'author': admin_user,
                    'category': category,
                    'is_featured': post_data['is_featured'],
                    'status': post_data['status'],
                    'published_at': timezone.now() - timedelta(days=1)
                }
            )
            
            if created:
                # Add tags
                for tag_name in post_data['tags']:
                    tag, created = Tag.objects.get_or_create(name=tag_name)
                    post.tags.add(tag)
                
                self.stdout.write(f'Created post: {post.title}')
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )
