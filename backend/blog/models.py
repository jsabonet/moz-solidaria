from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from django.utils.html import strip_tags
from django.urls import reverse
from PIL import Image
import os
import re


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="Nome")
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, verbose_name="Descrição")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Categoria"
        verbose_name_plural = "Categorias"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return f'/blog/categoria/{self.slug}/'
    
    def delete(self, *args, **kwargs):
        """Override delete to prevent deletion if category has posts"""
        if self.blogpost_set.exists():
            raise ValidationError(
                f'Não é possível excluir a categoria "{self.name}" pois ela possui posts associados.'
            )
        super().delete(*args, **kwargs)


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Nome")
    slug = models.SlugField(max_length=50, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Tag"
        verbose_name_plural = "Tags"
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def get_absolute_url(self):
        return f'/blog/tag/{self.slug}/'


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Rascunho'),
        ('published', 'Publicado'),
        ('archived', 'Arquivado'),
    ]
    
    title = models.CharField(max_length=200, verbose_name="Título")
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    excerpt = models.TextField(max_length=500, verbose_name="Resumo")
    content = models.TextField(verbose_name="Conteúdo")
    
    # Relationships
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Autor")
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Categoria")
    tags = models.ManyToManyField(Tag, blank=True, verbose_name="Tags")
    
    # Media
    featured_image = models.ImageField(upload_to='blog_images/', null=True, blank=True, verbose_name="Imagem em destaque")
    featured_image_caption = models.CharField(max_length=300, blank=True, verbose_name="Legenda da imagem principal")
    featured_image_credit = models.CharField(max_length=200, blank=True, verbose_name="Crédito da imagem principal")
    featured_image_source_url = models.URLField(blank=True, verbose_name="URL da fonte da imagem principal")
    
    # Status and visibility
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', verbose_name="Status")
    is_featured = models.BooleanField(default=False, verbose_name="Em destaque")
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True, verbose_name="Meta descrição")
    meta_keywords = models.CharField(max_length=255, blank=True, verbose_name="Palavras-chave")
    
    # Campos SEO avançados
    meta_title = models.CharField(max_length=70, blank=True, verbose_name="Título SEO", 
                                help_text="Título otimizado para SEO (máx. 70 caracteres)")
    canonical_url = models.URLField(blank=True, verbose_name="URL Canônica", 
                                   help_text="URL canônica para evitar conteúdo duplicado")
    
    # Open Graph
    og_title = models.CharField(max_length=95, blank=True, verbose_name="Título Open Graph",
                               help_text="Título para redes sociais (máx. 95 caracteres)")
    og_description = models.CharField(max_length=200, blank=True, verbose_name="Descrição Open Graph",
                                     help_text="Descrição para redes sociais (máx. 200 caracteres)")
    og_type = models.CharField(max_length=50, default='article', verbose_name="Tipo Open Graph",
                              choices=[
                                  ('article', 'Artigo'),
                                  ('website', 'Website'),
                                  ('blog', 'Blog'),
                                  ('news', 'Notícia'),
                              ])
    og_image = models.ImageField(upload_to='blog_images/og/', null=True, blank=True, 
                                verbose_name="Imagem Open Graph",
                                help_text="Imagem para redes sociais (recomendado: 1200x630px)")
    
    # Twitter Cards
    twitter_title = models.CharField(max_length=70, blank=True, verbose_name="Título Twitter")
    twitter_description = models.CharField(max_length=200, blank=True, verbose_name="Descrição Twitter")
    twitter_card = models.CharField(max_length=50, default='summary_large_image', verbose_name="Tipo Twitter Card",
                                   choices=[
                                       ('summary', 'Resumo'),
                                       ('summary_large_image', 'Resumo com imagem grande'),
                                       ('app', 'App'),
                                       ('player', 'Player'),
                                   ])
    
    # Schema.org estruturado
    schema_type = models.CharField(max_length=50, default='Article', verbose_name="Tipo de Schema",
                                  choices=[
                                      ('Article', 'Artigo'),
                                      ('NewsArticle', 'Artigo de Notícia'),
                                      ('BlogPosting', 'Post de Blog'),
                                      ('Review', 'Resenha'),
                                      ('HowTo', 'Tutorial'),
                                  ])
    
    # Meta Robots
    noindex = models.BooleanField(default=False, verbose_name="Não indexar (noindex)",
                                 help_text="Impede que motores de busca indexem este post")
    nofollow = models.BooleanField(default=False, verbose_name="Não seguir links (nofollow)",
                                  help_text="Impede que motores de busca sigam links neste post")
    
    # SEO técnico
    focus_keyword = models.CharField(max_length=100, blank=True, verbose_name="Palavra-chave principal",
                                    help_text="Palavra-chave principal para este post")
    
    # Hashtags para pesquisa e categorização
    hashtags = models.TextField(blank=True, verbose_name="Hashtags",
                               help_text="Hashtags separadas por vírgula (ex: #educacao, #cabo-delgado, #solidariedade)")
    
    # Configurações de SEO técnico
    robots_txt = models.CharField(max_length=200, blank=True, verbose_name="Diretivas Robots",
                                 help_text="Diretivas personalizadas para robots.txt")
    
    # Análise de conteúdo
    seo_score = models.FloatField(default=0.0, verbose_name="Pontuação SEO",
                                     help_text="Pontuação automática de SEO (0-100)")
    readability_score = models.FloatField(default=0.0, verbose_name="Pontuação de Legibilidade",
                                         help_text="Pontuação de legibilidade do conteúdo")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Publicado em")
    
    # Analytics
    views_count = models.PositiveIntegerField(default=0, verbose_name="Visualizações")
    read_time = models.PositiveIntegerField(default=0, verbose_name="Tempo de leitura (minutos)")
    
    class Meta:
        verbose_name = "Post do Blog"
        verbose_name_plural = "Posts do Blog"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'published_at']),
            models.Index(fields=['slug']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return self.title
    
    def get_hashtags_list(self):
        """Retorna uma lista de hashtags processadas"""
        if not self.hashtags:
            return []
        
        hashtags = []
        for tag in self.hashtags.split(','):
            tag = tag.strip()
            if tag:
                # Adicionar # se não existir
                if not tag.startswith('#'):
                    tag = f'#{tag}'
                # Remover espaços e caracteres especiais
                tag = tag.replace(' ', '-').lower()
                hashtags.append(tag)
        return hashtags
    
    def get_hashtags_for_search(self):
        """Retorna hashtags formatadas para busca (sem #)"""
        hashtags = self.get_hashtags_list()
        return [tag[1:] for tag in hashtags]  # Remove o #
    
    def process_content_hashtags(self):
        """Extrai hashtags do conteúdo do post"""
        import re
        if not self.content:
            return []
        
        # Encontrar todas as hashtags no conteúdo
        hashtag_pattern = r'#(\w+(?:-\w+)*)'
        found_hashtags = re.findall(hashtag_pattern, self.content)
        
        # Retornar com formato #hashtag
        return [f'#{tag}' for tag in found_hashtags]
    
    def update_hashtags_from_content(self):
        """Atualiza o campo hashtags com base no conteúdo"""
        content_hashtags = self.process_content_hashtags()
        existing_hashtags = self.get_hashtags_list()
        
        # Combinar hashtags existentes com as do conteúdo
        all_hashtags = list(set(existing_hashtags + content_hashtags))
        
        if all_hashtags:
            self.hashtags = ', '.join(all_hashtags)
    
    def generate_unique_slug(self):
        """Gera um slug único baseado no título"""
        if not self.title:
            return ''
            
        base_slug = slugify(self.title)
        unique_slug = base_slug
        counter = 1
        
        # Verificar se já existe um post com este slug (excluindo o próprio post se estivermos editando)
        while BlogPost.objects.filter(slug=unique_slug).exclude(pk=self.pk).exists():
            unique_slug = f"{base_slug}-{counter}"
            counter += 1
            
        return unique_slug
    
    def save(self, *args, **kwargs):
        # Extract update_fields from kwargs
        update_fields = kwargs.get('update_fields', None)
        
        if not self.slug:
            self.slug = self.generate_unique_slug()
        
        # Processar hashtags do conteúdo
        self.update_hashtags_from_content()
        
        # Auto-generate SEO fields if empty
        if not self.meta_title:
            self.meta_title = self.title[:70]
        
        if not self.meta_description and self.excerpt:
            self.meta_description = self.excerpt[:160]
        
        if not self.og_title:
            self.og_title = self.title[:95]
            
        if not self.og_description and self.excerpt:
            self.og_description = self.excerpt[:200]
        
        if not self.twitter_title:
            self.twitter_title = self.title[:70]
            
        if not self.twitter_description and self.excerpt:
            self.twitter_description = self.excerpt[:200]
        
        # Calculate read time based on content
        if self.content:
            word_count = len(self.content.split())
            self.read_time = max(1, word_count // 200)  # Assuming 200 words per minute
            
        # Save first to get an ID
        super().save(*args, **kwargs)
        
        # Calculate SEO and readability scores after saving (when we have an ID)
        if self.content:
            old_seo_score = self.seo_score
            old_readability_score = self.readability_score
            
            self.seo_score = self.calculate_seo_score()
            self.readability_score = self.calculate_readability_score()
            
            # Only update if scores changed
            if (old_seo_score != self.seo_score or 
                old_readability_score != self.readability_score):
                super().save(update_fields=['seo_score', 'readability_score'])
        
        # Only resize images if we're not doing a simple update_fields save
        # (e.g., incrementing views_count)
        if not update_fields or 'featured_image' in update_fields:
            # Resize featured image if it exists
            if self.featured_image:
                self.resize_image()
        
        if not update_fields or 'og_image' in update_fields:
            # Resize OG image if it exists
            if self.og_image:
                self.resize_og_image()
    
    def resize_image(self):
        """Resize featured image to optimize for web"""
        if self.featured_image:
            img = Image.open(self.featured_image.path)
            if img.height > 800 or img.width > 1200:
                output_size = (1200, 800)
                img.thumbnail(output_size, Image.Resampling.LANCZOS)
                img.save(self.featured_image.path, quality=85, optimize=True)
    
    def resize_og_image(self):
        """Resize Open Graph image to optimal dimensions"""
        if self.og_image:
            img = Image.open(self.og_image.path)
            if img.height != 630 or img.width != 1200:
                # Resize to exact OG dimensions
                img = img.resize((1200, 630), Image.Resampling.LANCZOS)
                img.save(self.og_image.path, quality=90, optimize=True)
    
    def calculate_seo_score(self):
        """Calculate SEO score based on various factors"""
        score = 0.0
        
        # Title length (ideal: 50-60 characters)
        title_len = len(self.title)
        if 50 <= title_len <= 60:
            score += 15
        elif 40 <= title_len <= 70:
            score += 10
        elif title_len > 0:
            score += 5
        
        # Meta description length (ideal: 150-160 characters)
        if self.meta_description:
            meta_len = len(self.meta_description)
            if 150 <= meta_len <= 160:
                score += 15
            elif 120 <= meta_len <= 160:
                score += 10
            else:
                score += 5
        
        # Focus keyword in title
        if self.focus_keyword and self.focus_keyword.lower() in self.title.lower():
            score += 15
        
        # Focus keyword in content
        if self.focus_keyword and self.content:
            content_lower = self.content.lower()
            keyword_lower = self.focus_keyword.lower()
            keyword_count = content_lower.count(keyword_lower)
            content_words = len(self.content.split())
            
            if content_words > 0:
                keyword_density = (keyword_count / content_words) * 100
                if 0.5 <= keyword_density <= 2.5:  # Ideal keyword density
                    score += 15
                elif keyword_count > 0:
                    score += 8
        
        # Content length (ideal: 300+ words)
        if self.content:
            word_count = len(self.content.split())
            if word_count >= 1000:
                score += 15
            elif word_count >= 500:
                score += 10
            elif word_count >= 300:
                score += 8
            else:
                score += 3
        
        # Has featured image
        if self.featured_image:
            score += 10
        
        # Has excerpt
        if self.excerpt:
            score += 5
        
        # Has category
        if self.category:
            score += 5
        
        # Has tags
        try:
            if self.pk and self.tags.exists():
                score += 5
        except (ValueError, AttributeError):
            # Object not saved yet or tags not accessible
            pass
        
        return min(score, 100.0)  # Cap at 100
    
    def calculate_readability_score(self):
        """Calculate basic readability score"""
        if not self.content:
            return 0.0
        
        # Remove HTML tags for analysis
        clean_content = strip_tags(self.content)
        
        # Count sentences (approximate)
        sentences = len(re.split(r'[.!?]+', clean_content))
        
        # Count words
        words = len(clean_content.split())
        
        # Count syllables (very basic approximation)
        syllables = 0
        for word in clean_content.split():
            syllables += max(1, len(re.findall(r'[aeiouAEIOU]', word)))
        
        if sentences == 0 or words == 0:
            return 0.0
        
        # Simplified Flesch Reading Ease formula
        avg_sentence_length = words / sentences
        avg_syllables_per_word = syllables / words
        
        flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables_per_word)
        
        # Normalize to 0-100 scale
        return max(0.0, min(100.0, flesch_score))
    
    def get_seo_analysis(self):
        """Get detailed SEO analysis"""
        analysis = {
            'title_length': len(self.title),
            'title_optimal': 50 <= len(self.title) <= 60,
            'meta_description_length': len(self.meta_description) if self.meta_description else 0,
            'meta_description_optimal': bool(self.meta_description and 150 <= len(self.meta_description) <= 160),
            'has_focus_keyword': bool(self.focus_keyword),
            'focus_keyword_in_title': bool(self.focus_keyword and self.focus_keyword.lower() in self.title.lower()),
            'content_word_count': len(self.content.split()) if self.content else 0,
            'content_length_optimal': bool(self.content and len(self.content.split()) >= 300),
            'has_featured_image': bool(self.featured_image),
            'has_og_image': bool(self.og_image),
            'has_excerpt': bool(self.excerpt),
            'has_category': bool(self.category),
            'has_tags': bool(self.pk and hasattr(self, 'tags') and self.tags.exists()),
            'seo_score': self.seo_score,
            'readability_score': self.readability_score,
        }
        
        # Calculate keyword density if focus keyword exists
        if self.focus_keyword and self.content:
            content_lower = self.content.lower()
            keyword_lower = self.focus_keyword.lower()
            keyword_count = content_lower.count(keyword_lower)
            content_words = len(self.content.split())
            
            if content_words > 0:
                analysis['keyword_density'] = (keyword_count / content_words) * 100
                analysis['keyword_density_optimal'] = 0.5 <= analysis['keyword_density'] <= 2.5
            else:
                analysis['keyword_density'] = 0
                analysis['keyword_density_optimal'] = False
        
        return analysis
    
    def get_absolute_url(self):
        return f'/blog/{self.slug}/'
    
    def get_schema_data(self):
        """Generate Schema.org structured data"""
        schema_data = {
            "@context": "https://schema.org",
            "@type": self.schema_type,
            "headline": self.title,
            "description": self.meta_description or self.excerpt,
            "url": self.get_absolute_url(),
            "datePublished": self.published_at.isoformat() if self.published_at else self.created_at.isoformat(),
            "dateModified": self.updated_at.isoformat(),
            "author": {
                "@type": "Person",
                "name": f"{self.author.first_name} {self.author.last_name}".strip() or self.author.username
            },
            "publisher": {
                "@type": "Organization",
                "name": "Moz Solidária",
                "logo": {
                    "@type": "ImageObject",
                    "url": "/static/logo-moz-solidaria.png"
                }
            }
        }
        
        # Add image if available
        if self.featured_image:
            schema_data["image"] = {
                "@type": "ImageObject",
                "url": self.featured_image.url,
                "caption": self.featured_image_caption
            }
        
        # Add category as articleSection
        if self.category:
            schema_data["articleSection"] = self.category.name
        
        # Add keywords
        try:
            if self.pk and self.tags.exists():
                schema_data["keywords"] = [tag.name for tag in self.tags.all()]
        except (ValueError, AttributeError):
            # Object not saved yet or tags not accessible
            pass
        
        # Add word count and reading time
        if self.content:
            schema_data["wordCount"] = len(self.content.split())
            schema_data["timeRequired"] = f"PT{self.read_time}M"
        
        return schema_data
    
    @property
    def is_published(self):
        return self.status == 'published'
    
    def increment_views(self):
        """Increment the view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])

    @property
    def likes_count(self):
        """Get total number of likes"""
        return self.likes.count()
    
    @property
    def shares_count(self):
        """Get total number of shares"""
        return self.shares.count()
    
    @property
    def comments_count(self):
        """Get total number of approved comments (excluding replies)"""
        return self.comments.filter(is_approved=True, parent__isnull=True).count()
    
    @property
    def total_comments_count(self):
        """Get total number of approved comments (including replies)"""
        return self.comments.filter(is_approved=True).count()
    
    def is_liked_by_user(self, user):
        """Check if a specific user has liked this post"""
        if not user.is_authenticated:
            return False
        return self.likes.filter(user=user).exists()
    
    def toggle_like(self, user):
        """Toggle like status for a user. Returns True if liked, False if unliked"""
        if not user.is_authenticated:
            return False
        
        like, created = self.likes.get_or_create(user=user)
        if not created:
            like.delete()
            return False
        return True


class Comment(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments', verbose_name="Post")
    author = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Autor")
    author_name = models.CharField(max_length=100, verbose_name="Nome do autor")
    author_email = models.EmailField(verbose_name="Email do autor")
    content = models.TextField(verbose_name="Comentário")
    is_approved = models.BooleanField(default=False, verbose_name="Aprovado")
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies', verbose_name="Resposta para")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Atualizado em")
    
    class Meta:
        verbose_name = "Comentário"
        verbose_name_plural = "Comentários"
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Comentário de {self.author_name} em {self.post.title}'

    @property
    def is_reply(self):
        return self.parent is not None


class Like(models.Model):
    """Modelo para curtidas em posts"""
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='likes', verbose_name="Post")
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Usuário")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Curtido em")
    
    class Meta:
        verbose_name = "Curtida"
        verbose_name_plural = "Curtidas"
        unique_together = ('post', 'user')  # Um usuário só pode curtir uma vez
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.username} curtiu {self.post.title}'


class Share(models.Model):
    """Modelo para compartilhamentos de posts"""
    SHARE_TYPES = [
        ('facebook', 'Facebook'),
        ('twitter', 'Twitter'),
        ('linkedin', 'LinkedIn'),
        ('whatsapp', 'WhatsApp'),
        ('email', 'Email'),
        ('copy_link', 'Copiar Link'),
        ('other', 'Outro'),
    ]
    
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='shares', verbose_name="Post")
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Usuário")
    share_type = models.CharField(max_length=20, choices=SHARE_TYPES, verbose_name="Tipo de compartilhamento")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="Endereço IP")
    user_agent = models.TextField(blank=True, verbose_name="User Agent")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Compartilhado em")
    
    class Meta:
        verbose_name = "Compartilhamento"
        verbose_name_plural = "Compartilhamentos"
        ordering = ['-created_at']
    
    def __str__(self):
        user_name = self.user.username if self.user else "Anônimo"
        return f'{user_name} compartilhou {self.post.title} via {self.get_share_type_display()}'


class Newsletter(models.Model):
    email = models.EmailField(unique=True, verbose_name="Email")
    name = models.CharField(max_length=100, blank=True, verbose_name="Nome")
    is_active = models.BooleanField(default=True, verbose_name="Ativo")
    subscribed_at = models.DateTimeField(auto_now_add=True, verbose_name="Inscrito em")
    
    class Meta:
        verbose_name = "Assinante da Newsletter"
        verbose_name_plural = "Assinantes da Newsletter"
        ordering = ['-subscribed_at']
    
    def __str__(self):
        return self.email


class ImageCredit(models.Model):
    """
    Modelo para gerenciar créditos de imagens dentro do conteúdo dos posts
    """
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='image_credits', verbose_name="Post")
    image_url = models.URLField(verbose_name="URL da imagem")
    image_filename = models.CharField(max_length=255, blank=True, verbose_name="Nome do arquivo")
    caption = models.CharField(max_length=300, blank=True, verbose_name="Legenda")
    credit = models.CharField(max_length=200, blank=True, verbose_name="Crédito/Fonte")
    source_url = models.URLField(blank=True, verbose_name="URL da fonte")
    photographer = models.CharField(max_length=100, blank=True, verbose_name="Fotógrafo")
    license_type = models.CharField(max_length=100, blank=True, verbose_name="Tipo de licença")
    alt_text = models.CharField(max_length=200, blank=True, verbose_name="Texto alternativo")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Crédito de Imagem"
        verbose_name_plural = "Créditos de Imagens"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Crédito para {self.image_filename or self.image_url[:50]} - {self.post.title}"
