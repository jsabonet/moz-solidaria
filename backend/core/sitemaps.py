"""
Gerador de Sitemap XML para Moz Solidária
Este arquivo gera automaticamente sitemaps baseados no conteúdo do site
"""

from django.http import HttpResponse
from django.template import loader
from django.urls import reverse
from django.utils import timezone
from django.conf import settings
from blog.models import BlogPost
# Adicione imports de outros modelos conforme necessário

def sitemap_index(request):
    """Sitemap index principal"""
    try:
        template = loader.get_template('sitemap_index.xml')
        
        # Data padrão para lastmod
        default_lastmod = timezone.now()
        
        # Tentar obter data do último post do blog
        try:
            latest_blog = BlogPost.objects.filter(is_published=True).latest('updated_at')
            blog_lastmod = latest_blog.updated_at
        except (BlogPost.DoesNotExist, AttributeError):
            blog_lastmod = default_lastmod
        
        sitemaps = [
            {
                'location': request.build_absolute_uri('/sitemap-static.xml'),
                'lastmod': default_lastmod
            },
            {
                'location': request.build_absolute_uri('/sitemap-blog.xml'),
                'lastmod': blog_lastmod
            },
            {
                'location': request.build_absolute_uri('/sitemap-programas.xml'),
                'lastmod': default_lastmod
            }
        ]
        
        context = {'sitemaps': sitemaps}
        return HttpResponse(template.render(context, request), content_type='application/xml')
    
    except Exception as e:
        # Fallback simples se der erro
        xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>{request.build_absolute_uri('/sitemap-static.xml')}</loc>
        <lastmod>{timezone.now().isoformat()}</lastmod>
    </sitemap>
    <sitemap>
        <loc>{request.build_absolute_uri('/sitemap-blog.xml')}</loc>
        <lastmod>{timezone.now().isoformat()}</lastmod>
    </sitemap>
    <sitemap>
        <loc>{request.build_absolute_uri('/sitemap-programas.xml')}</loc>
        <lastmod>{timezone.now().isoformat()}</lastmod>
    </sitemap>
</sitemapindex>'''
        return HttpResponse(xml_content, content_type='application/xml')

def sitemap_static(request):
    """Sitemap para páginas estáticas"""
    template = loader.get_template('sitemap.xml')
    
    # Páginas estáticas do site
    urls = [
        {
            'location': request.build_absolute_uri('/'),
            'lastmod': timezone.now(),
            'changefreq': 'daily',
            'priority': '1.0'
        },
        {
            'location': request.build_absolute_uri('/sobre'),
            'lastmod': timezone.now(),
            'changefreq': 'monthly',
            'priority': '0.9'
        },
        {
            'location': request.build_absolute_uri('/programas'),
            'lastmod': timezone.now(),
            'changefreq': 'weekly',
            'priority': '0.9'
        },
        {
            'location': request.build_absolute_uri('/blog'),
            'lastmod': timezone.now(),
            'changefreq': 'daily',
            'priority': '0.8'
        },
        {
            'location': request.build_absolute_uri('/contacto'),
            'lastmod': timezone.now(),
            'changefreq': 'monthly',
            'priority': '0.7'
        },
        {
            'location': request.build_absolute_uri('/doacao'),
            'lastmod': timezone.now(),
            'changefreq': 'monthly',
            'priority': '0.8'
        },
        {
            'location': request.build_absolute_uri('/transparencia'),
            'lastmod': timezone.now(),
            'changefreq': 'monthly',
            'priority': '0.6'
        }
    ]
    
    context = {'urlset': urls}
    return HttpResponse(template.render(context, request), content_type='application/xml')

def sitemap_blog(request):
    """Sitemap para posts do blog"""
    template = loader.get_template('sitemap.xml')
    
    posts = BlogPost.objects.filter(is_published=True).order_by('-updated_at')
    
    urls = []
    for post in posts:
        urls.append({
            'location': request.build_absolute_uri(post.get_absolute_url()),
            'lastmod': post.updated_at,
            'changefreq': 'weekly',
            'priority': '0.8' if post.is_featured else '0.6'
        })
    
    context = {'urlset': urls}
    return HttpResponse(template.render(context, request), content_type='application/xml')

def sitemap_programas(request):
    """Sitemap para programas/projetos"""
    template = loader.get_template('sitemap.xml')
    
    # Aqui você adicionaria os programas quando tiver o modelo
    # programs = Program.objects.filter(is_active=True)
    
    urls = []
    # Exemplo de URLs de programas (adapte conforme seu modelo)
    program_slugs = ['educacao', 'saude', 'empoderamento-feminino', 'desenvolvimento-rural']
    
    for slug in program_slugs:
        urls.append({
            'location': request.build_absolute_uri(f'/programas/{slug}'),
            'lastmod': timezone.now(),
            'changefreq': 'monthly',
            'priority': '0.7'
        })
    
    context = {'urlset': urls}
    return HttpResponse(template.render(context, request), content_type='application/xml')
