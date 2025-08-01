#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to Python path
sys.path.append('d:/Projectos/moz-solidaria-hub-main/backend')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from blog.models import Category, BlogPost
from django.contrib.auth.models import User

# Create categories
categories_data = [
    {'name': 'Educação', 'description': 'Posts sobre educação e aprendizado'},
    {'name': 'Saúde', 'description': 'Artigos relacionados à saúde'},
    {'name': 'Comunidade', 'description': 'Ações comunitárias e voluntariado'},
    {'name': 'Meio Ambiente', 'description': 'Sustentabilidade e meio ambiente'},
]

print("Criando categorias...")
for cat_data in categories_data:
    category, created = Category.objects.get_or_create(
        name=cat_data['name'],
        defaults={'description': cat_data['description']}
    )
    if created:
        print(f"✓ Categoria criada: {category.name}")
    else:
        print(f"- Categoria já existe: {category.name}")

# Get admin user
admin_user = User.objects.filter(is_superuser=True).first()
if not admin_user:
    print("❌ Nenhum superusuário encontrado!")
    sys.exit(1)

# Create blog posts
posts_data = [
    {
        'title': 'Projeto de Educação Rural em Moçambique',
        'excerpt': 'Como estamos levando educação de qualidade para comunidades rurais',
        'content': '''
        <h2>Transformando Vidas através da Educação</h2>
        
        <p>O nosso projeto de educação rural tem como objetivo levar ensino de qualidade para as comunidades mais afastadas de Moçambique. Através de parcerias com escolas locais e professores voluntários, conseguimos estabelecer centros de aprendizagem em várias províncias.</p>
        
        <h3>Resultados Alcançados</h3>
        <ul>
            <li>500+ crianças beneficiadas</li>
            <li>20 professores formados</li>
            <li>5 escolas renovadas</li>
        </ul>
        
        <p>Este é apenas o começo da nossa jornada para democratizar o acesso à educação em Moçambique.</p>
        ''',
        'category': 'Educação',
        'status': 'published',
        'featured_image': 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=1169&auto=format&fit=crop'
    },
    {
        'title': 'Campanha de Vacinação na Província de Gaza',
        'excerpt': 'Levando saúde preventiva para todas as idades',
        'content': '''
        <h2>Saúde é um Direito de Todos</h2>
        
        <p>A nossa campanha de vacinação na província de Gaza alcançou mais de 1000 pessoas em apenas duas semanas. Com o apoio de profissionais de saúde locais, conseguimos levar vacinas essenciais para comunidades que antes tinham acesso limitado aos cuidados de saúde.</p>
        
        <blockquote>
            <p>"A prevenção é sempre melhor que o tratamento. Investir em vacinação é investir no futuro da nossa comunidade."</p>
            <cite>- Dr. Maria Santos, Coordenadora da Campanha</cite>
        </blockquote>
        
        <p>Continuamos a trabalhar para expandir este programa para outras províncias.</p>
        ''',
        'category': 'Saúde',
        'status': 'published',
        'featured_image': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=1170&auto=format&fit=crop'
    },
    {
        'title': 'Mutirão de Limpeza do Rio Maputo',
        'excerpt': 'Comunidade se une para preservar o meio ambiente',
        'content': '''
        <h2>Unidos pela Natureza</h2>
        
        <p>No último sábado, mais de 200 voluntários se reuniram para o maior mutirão de limpeza do Rio Maputo dos últimos anos. O evento foi uma demonstração incrível do poder da união comunitária em prol do meio ambiente.</p>
        
        <h3>Números da Ação</h3>
        <ul>
            <li>200+ voluntários participantes</li>
            <li>3 toneladas de lixo coletadas</li>
            <li>5km de margem do rio limpos</li>
            <li>50 mudas de árvores plantadas</li>
        </ul>
        
        <p>Agradecemos a todos os voluntários que tornaram este evento possível. Juntos, fazemos a diferença!</p>
        ''',
        'category': 'Meio Ambiente',
        'status': 'published',
        'featured_image': 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?q=80&w=1170&auto=format&fit=crop'
    }
]

print("\nCriando posts do blog...")
for post_data in posts_data:
    category = Category.objects.get(name=post_data['category'])
    
    post, created = BlogPost.objects.get_or_create(
        title=post_data['title'],
        defaults={
            'excerpt': post_data['excerpt'],
            'content': post_data['content'],
            'author': admin_user,
            'category': category,
            'status': post_data['status'],
            'featured_image': None  # We'll set URL in a custom field if needed
        }
    )
    
    if created:
        print(f"✓ Post criado: {post.title}")
    else:
        print(f"- Post já existe: {post.title}")

print(f"\n🎉 Setup concluído!")
print(f"📊 Total de categorias: {Category.objects.count()}")
print(f"📝 Total de posts: {BlogPost.objects.count()}")
print(f"👤 Superusuário: {admin_user.username}")
