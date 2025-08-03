import json
from django import template
from django.utils.safestring import mark_safe
from django.urls import reverse
from blog.seo_utils import SchemaGenerator, OpenGraphGenerator, extract_faqs_from_content

register = template.Library()


@register.simple_tag(takes_context=True)
def breadcrumb_schema(context, post):
    """Gera schema de breadcrumb para um post"""
    request = context.get('request')
    schema_data = SchemaGenerator.generate_breadcrumb_schema(post)
    return mark_safe(json.dumps(schema_data, ensure_ascii=False, indent=2))


@register.simple_tag(takes_context=True)
def faq_schema(context, post):
    """Extrai FAQs do conteúdo e gera schema"""
    faqs = extract_faqs_from_content(post.content)
    if faqs:
        schema_data = SchemaGenerator.generate_faq_schema(faqs)
        return mark_safe(json.dumps(schema_data, ensure_ascii=False, indent=2))
    return ''


@register.simple_tag(takes_context=True)
def og_tags(context, post):
    """Gera meta tags Open Graph"""
    request = context.get('request')
    tags = OpenGraphGenerator.generate_og_tags(post, request)
    
    html = []
    for key, value in tags.items():
        if isinstance(value, list):
            for item in value:
                html.append(f'<meta property="{key}" content="{item}">')
        else:
            html.append(f'<meta property="{key}" content="{value}">')
    
    return mark_safe('\n'.join(html))


@register.simple_tag(takes_context=True)
def twitter_tags(context, post):
    """Gera meta tags do Twitter"""
    request = context.get('request')
    tags = OpenGraphGenerator.generate_twitter_tags(post, request)
    
    html = []
    for key, value in tags.items():
        html.append(f'<meta name="{key}" content="{value}">')
    
    return mark_safe('\n'.join(html))


@register.simple_tag
def schema_json(schema_data):
    """Converte dados de schema para JSON formatado"""
    return mark_safe(json.dumps(schema_data, ensure_ascii=False, indent=2))


@register.filter
def seo_score_color(score):
    """Retorna cor baseada na pontuação SEO"""
    if score >= 80:
        return 'success'
    elif score >= 60:
        return 'warning'
    else:
        return 'danger'


@register.filter
def seo_score_text(score):
    """Retorna texto descritivo da pontuação SEO"""
    if score >= 80:
        return 'Excelente'
    elif score >= 60:
        return 'Bom'
    elif score >= 40:
        return 'Regular'
    else:
        return 'Precisa melhorar'


@register.inclusion_tag('blog/seo_meta_tags.html', takes_context=True)
def seo_meta_tags(context, post):
    """Template tag de inclusão para todas as meta tags SEO"""
    request = context.get('request')
    
    return {
        'post': post,
        'request': request,
        'og_tags': OpenGraphGenerator.generate_og_tags(post, request),
        'twitter_tags': OpenGraphGenerator.generate_twitter_tags(post, request),
        'breadcrumb_schema': SchemaGenerator.generate_breadcrumb_schema(post),
        'faq_schema': SchemaGenerator.generate_faq_schema(extract_faqs_from_content(post.content)),
    }


@register.inclusion_tag('blog/social_sharing.html', takes_context=True)
def social_sharing(context, post):
    """Template tag para botões de compartilhamento social"""
    request = context.get('request')
    absolute_url = request.build_absolute_uri(post.get_absolute_url()) if request else post.get_absolute_url()
    
    return {
        'post': post,
        'absolute_url': absolute_url,
        'encoded_url': absolute_url,
        'encoded_title': post.title,
    }


@register.simple_tag
def reading_time_text(minutes):
    """Converte tempo de leitura em texto amigável"""
    if minutes <= 1:
        return "1 minuto de leitura"
    else:
        return f"{minutes} minutos de leitura"


@register.filter
def keyword_density(content, keyword):
    """Calcula densidade de palavra-chave"""
    if not content or not keyword:
        return 0
    
    from blog.seo_utils import SEOAnalyzer
    analysis = SEOAnalyzer.analyze_keyword_density(content, keyword)
    return analysis['density']


@register.simple_tag
def post_analysis(post):
    """Retorna análise completa SEO do post"""
    return post.get_seo_analysis()


@register.filter
def truncate_chars_words(value, length):
    """Trunca texto respeitando palavras completas"""
    if len(value) <= length:
        return value
    
    truncated = value[:length]
    # Encontra o último espaço para não cortar palavras
    last_space = truncated.rfind(' ')
    if last_space > 0:
        truncated = truncated[:last_space]
    
    return truncated + '...'
