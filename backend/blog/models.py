from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from PIL import Image
import os


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
    
    # Status and visibility
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='draft', verbose_name="Status")
    is_featured = models.BooleanField(default=False, verbose_name="Em destaque")
    
    # SEO
    meta_description = models.CharField(max_length=160, blank=True, verbose_name="Meta descrição")
    meta_keywords = models.CharField(max_length=255, blank=True, verbose_name="Palavras-chave")
    
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
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Calculate read time based on content
        if self.content:
            word_count = len(self.content.split())
            self.read_time = max(1, word_count // 200)  # Assuming 200 words per minute
            
        super().save(*args, **kwargs)
        
        # Resize featured image if it exists
        if self.featured_image:
            self.resize_image()
    
    def resize_image(self):
        """Resize featured image to optimize for web"""
        if self.featured_image:
            img = Image.open(self.featured_image.path)
            if img.height > 800 or img.width > 1200:
                output_size = (1200, 800)
                img.thumbnail(output_size, Image.Resampling.LANCZOS)
                img.save(self.featured_image.path, quality=85, optimize=True)
    
    def get_absolute_url(self):
        return f'/blog/{self.slug}/'
    
    @property
    def is_published(self):
        return self.status == 'published'
    
    def increment_views(self):
        """Increment the view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class Comment(models.Model):
    post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments', verbose_name="Post")
    author_name = models.CharField(max_length=100, verbose_name="Nome do autor")
    author_email = models.EmailField(verbose_name="Email do autor")
    content = models.TextField(verbose_name="Comentário")
    is_approved = models.BooleanField(default=False, verbose_name="Aprovado")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Criado em")
    
    class Meta:
        verbose_name = "Comentário"
        verbose_name_plural = "Comentários"
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Comentário de {self.author_name} em {self.post.title}'


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
