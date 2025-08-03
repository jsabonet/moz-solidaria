"""
Utilitários SEO para o blog da Moz Solidária
"""
import re
from django.utils.html import strip_tags
from django.template.loader import render_to_string


class SEOAnalyzer:
    """Classe para análise avançada de SEO"""
    
    @staticmethod
    def analyze_keyword_density(content, keyword):
        """Analisa a densidade de palavras-chave no conteúdo"""
        if not content or not keyword:
            return {
                'density': 0,
                'count': 0,
                'word_count': 0,
                'optimal': False
            }
        
        clean_content = strip_tags(content).lower()
        keyword_lower = keyword.lower()
        
        # Conta palavras-chave
        keyword_count = clean_content.count(keyword_lower)
        
        # Conta palavras totais
        words = clean_content.split()
        word_count = len(words)
        
        if word_count == 0:
            density = 0
        else:
            density = (keyword_count / word_count) * 100
        
        # Densidade ideal: 0.5% - 2.5%
        optimal = 0.5 <= density <= 2.5
        
        return {
            'density': round(density, 2),
            'count': keyword_count,
            'word_count': word_count,
            'optimal': optimal
        }
    
    @staticmethod
    def analyze_title_seo(title):
        """Analisa otimização SEO do título"""
        title_len = len(title)
        
        return {
            'length': title_len,
            'optimal_length': 50 <= title_len <= 60,
            'too_short': title_len < 30,
            'too_long': title_len > 70,
            'score': SEOAnalyzer._calculate_title_score(title)
        }
    
    @staticmethod
    def analyze_meta_description(meta_description):
        """Analisa otimização da meta descrição"""
        if not meta_description:
            return {
                'length': 0,
                'optimal_length': False,
                'too_short': True,
                'too_long': False,
                'exists': False,
                'score': 0
            }
        
        desc_len = len(meta_description)
        
        return {
            'length': desc_len,
            'optimal_length': 150 <= desc_len <= 160,
            'too_short': desc_len < 120,
            'too_long': desc_len > 160,
            'exists': True,
            'score': SEOAnalyzer._calculate_meta_description_score(meta_description)
        }
    
    @staticmethod
    def analyze_content_structure(content):
        """Analisa a estrutura do conteúdo para SEO"""
        if not content:
            return {
                'headings': [],
                'h1_count': 0,
                'h2_count': 0,
                'h3_count': 0,
                'paragraphs': 0,
                'word_count': 0,
                'has_good_structure': False
            }
        
        # Encontra todos os headings
        headings = re.findall(r'<h([1-6])[^>]*>(.*?)</h[1-6]>', content, re.IGNORECASE)
        
        h1_count = len([h for h in headings if h[0] == '1'])
        h2_count = len([h for h in headings if h[0] == '2'])
        h3_count = len([h for h in headings if h[0] == '3'])
        
        # Conta parágrafos
        paragraphs = len(re.findall(r'<p[^>]*>.*?</p>', content, re.IGNORECASE))
        
        # Conta palavras
        clean_content = strip_tags(content)
        word_count = len(clean_content.split())
        
        # Estrutura boa: pelo menos um H2, parágrafos bem distribuídos
        has_good_structure = h2_count >= 1 and paragraphs >= 3 and word_count >= 300
        
        return {
            'headings': headings,
            'h1_count': h1_count,
            'h2_count': h2_count,
            'h3_count': h3_count,
            'paragraphs': paragraphs,
            'word_count': word_count,
            'has_good_structure': has_good_structure
        }
    
    @staticmethod
    def _calculate_title_score(title):
        """Calcula pontuação do título"""
        score = 0
        title_len = len(title)
        
        if 50 <= title_len <= 60:
            score += 30
        elif 40 <= title_len <= 70:
            score += 20
        elif title_len > 0:
            score += 10
        
        # Verifica se contém números (geralmente performam melhor)
        if re.search(r'\d', title):
            score += 10
        
        # Verifica se contém palavras de ação
        action_words = ['como', 'guia', 'dicas', 'passos', 'melhor', 'completo']
        if any(word in title.lower() for word in action_words):
            score += 10
        
        return min(score, 50)  # Máximo 50 pontos para título
    
    @staticmethod
    def _calculate_meta_description_score(meta_description):
        """Calcula pontuação da meta descrição"""
        score = 0
        desc_len = len(meta_description)
        
        if 150 <= desc_len <= 160:
            score += 25
        elif 120 <= desc_len <= 160:
            score += 20
        elif desc_len > 0:
            score += 10
        
        # Verifica se contém call-to-action
        cta_words = ['saiba', 'descubra', 'aprenda', 'veja', 'confira', 'leia']
        if any(word in meta_description.lower() for word in cta_words):
            score += 10
        
        return min(score, 35)  # Máximo 35 pontos para meta descrição


class SchemaGenerator:
    """Gerador de dados estruturados Schema.org"""
    
    @staticmethod
    def generate_breadcrumb_schema(post):
        """Gera schema de breadcrumb para posts"""
        breadcrumb_data = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Blog",
                    "item": "/blog/"
                }
            ]
        }
        
        # Adiciona categoria se existir
        if post.category:
            breadcrumb_data["itemListElement"].append({
                "@type": "ListItem",
                "position": 3,
                "name": post.category.name,
                "item": post.category.get_absolute_url()
            })
            
            breadcrumb_data["itemListElement"].append({
                "@type": "ListItem",
                "position": 4,
                "name": post.title,
                "item": post.get_absolute_url()
            })
        else:
            breadcrumb_data["itemListElement"].append({
                "@type": "ListItem",
                "position": 3,
                "name": post.title,
                "item": post.get_absolute_url()
            })
        
        return breadcrumb_data
    
    @staticmethod
    def generate_faq_schema(faqs):
        """Gera schema FAQ se houver perguntas e respostas no conteúdo"""
        if not faqs:
            return None
        
        faq_data = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": []
        }
        
        for faq in faqs:
            faq_data["mainEntity"].append({
                "@type": "Question",
                "name": faq['question'],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq['answer']
                }
            })
        
        return faq_data


class OpenGraphGenerator:
    """Gerador de meta tags Open Graph"""
    
    @staticmethod
    def generate_og_tags(post, request=None):
        """Gera todas as meta tags Open Graph para um post"""
        og_tags = {
            'og:type': 'article',
            'og:title': post.og_title or post.title,
            'og:description': post.og_description or post.meta_description or post.excerpt,
            'og:url': request.build_absolute_uri(post.get_absolute_url()) if request else post.get_absolute_url(),
            'og:site_name': 'Moz Solidária',
            'article:published_time': post.published_at.isoformat() if post.published_at else post.created_at.isoformat(),
            'article:modified_time': post.updated_at.isoformat(),
            'article:author': f"{post.author.first_name} {post.author.last_name}".strip() or post.author.username,
        }
        
        # Adiciona imagem OG ou featured image
        if post.og_image:
            og_tags['og:image'] = request.build_absolute_uri(post.og_image.url) if request else post.og_image.url
        elif post.featured_image:
            og_tags['og:image'] = request.build_absolute_uri(post.featured_image.url) if request else post.featured_image.url
        
        # Adiciona categoria e tags
        if post.category:
            og_tags['article:section'] = post.category.name
        
        if post.tags.exists():
            og_tags['article:tag'] = [tag.name for tag in post.tags.all()]
        
        return og_tags
    
    @staticmethod
    def generate_twitter_tags(post, request=None):
        """Gera meta tags específicas do Twitter"""
        twitter_tags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': post.og_title or post.title,
            'twitter:description': post.og_description or post.meta_description or post.excerpt,
            'twitter:site': '@mozsolidaria',  # Substituir pelo handle real
        }
        
        # Adiciona imagem
        if post.og_image:
            twitter_tags['twitter:image'] = request.build_absolute_uri(post.og_image.url) if request else post.og_image.url
        elif post.featured_image:
            twitter_tags['twitter:image'] = request.build_absolute_uri(post.featured_image.url) if request else post.featured_image.url
        
        return twitter_tags


def generate_sitemap_data(posts):
    """Gera dados para sitemap XML"""
    sitemap_urls = []
    
    for post in posts:
        if post.is_published:
            sitemap_urls.append({
                'location': post.get_absolute_url(),
                'lastmod': post.updated_at,
                'changefreq': 'weekly',
                'priority': '0.8' if post.is_featured else '0.6'
            })
    
    return sitemap_urls


def extract_faqs_from_content(content):
    """Extrai FAQs do conteúdo baseado em padrões HTML"""
    faqs = []
    
    # Padrão simples: procura por H3/H4 seguidos de parágrafos
    faq_pattern = r'<h[34][^>]*>(.*?)</h[34]>\s*<p[^>]*>(.*?)</p>'
    matches = re.findall(faq_pattern, content, re.IGNORECASE | re.DOTALL)
    
    for question, answer in matches:
        # Remove tags HTML
        clean_question = strip_tags(question).strip()
        clean_answer = strip_tags(answer).strip()
        
        # Verifica se parece uma pergunta
        if ('?' in clean_question or 
            clean_question.lower().startswith(('como', 'o que', 'por que', 'quando', 'onde', 'qual'))):
            faqs.append({
                'question': clean_question,
                'answer': clean_answer
            })
    
    return faqs
