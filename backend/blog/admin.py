from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import BlogPost, Category, Tag, Comment, Newsletter, ImageCredit
from .seo_utils import SEOAnalyzer


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'posts_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    def posts_count(self, obj):
        return obj.blogpost_set.count()
    posts_count.short_description = 'Número de Posts'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'posts_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    
    def posts_count(self, obj):
        return obj.blogpost_set.count()
    posts_count.short_description = 'Número de Posts'


class CommentInline(admin.TabularInline):
    model = Comment
    extra = 0
    readonly_fields = ['created_at']
    fields = ['author_name', 'author_email', 'content', 'is_approved', 'created_at']


class ImageCreditInline(admin.TabularInline):
    model = ImageCredit
    extra = 0
    readonly_fields = ['created_at']
    fields = ['image_url', 'image_filename', 'caption', 'credit', 'source_url', 'created_at']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'category', 'status', 'is_featured', 
        'views_count', 'read_time', 'seo_score_display', 'created_at', 'published_at'
    ]
    list_filter = [
        'status', 'is_featured', 'category', 'tags', 'schema_type', 'created_at', 'published_at'
    ]
    search_fields = ['title', 'excerpt', 'content', 'focus_keyword']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    readonly_fields = [
        'views_count', 'read_time', 'seo_score', 'readability_score', 
        'created_at', 'updated_at', 'seo_analysis_display'
    ]
    inlines = [CommentInline, ImageCreditInline]
    
    fieldsets = (
        ('Conteúdo Principal', {
            'fields': ('title', 'slug', 'excerpt', 'content')
        }),
        ('Mídia', {
            'fields': (
                'featured_image', 'featured_image_caption', 
                'featured_image_credit', 'featured_image_source_url'
            )
        }),
        ('Classificação', {
            'fields': ('author', 'category', 'tags')
        }),
        ('Status e Visibilidade', {
            'fields': ('status', 'is_featured', 'published_at')
        }),
        ('SEO Básico', {
            'fields': (
                'meta_title', 'meta_description', 'meta_keywords', 
                'focus_keyword', 'canonical_url'
            )
        }),
        ('Open Graph / Redes Sociais', {
            'fields': ('og_title', 'og_description', 'og_image', 'twitter_title', 'twitter_description'),
            'classes': ('collapse',)
        }),
        ('Schema.org', {
            'fields': ('schema_type',),
            'classes': ('collapse',)
        }),
        ('Análise SEO', {
            'fields': ('seo_analysis_display', 'seo_score', 'readability_score'),
            'classes': ('collapse',)
        }),
        ('Estatísticas', {
            'fields': ('views_count', 'read_time', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not obj.author_id:
            obj.author = request.user
        
        # Set published_at when status changes to published
        if obj.status == 'published' and not obj.published_at:
            obj.published_at = timezone.now()
        
        super().save_model(request, obj, form, change)
    
    def seo_score_display(self, obj):
        """Exibe pontuação SEO com cores"""
        score = obj.seo_score
        if score >= 80:
            color = 'green'
        elif score >= 60:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}/100</span>',
            color, score
        )
    seo_score_display.short_description = 'Score SEO'
    seo_score_display.admin_order_field = 'seo_score'
    
    def seo_analysis_display(self, obj):
        """Exibe análise detalhada de SEO"""
        if not obj.pk:  # Objeto ainda não foi salvo
            return "Salve o post para ver a análise SEO"
        
        analysis = obj.get_seo_analysis()
        
        html = '<div style="max-width: 500px;">'
        
        # Título
        if analysis['title_optimal']:
            html += '<p>✅ <strong>Título:</strong> Tamanho ideal ({} chars)</p>'.format(analysis['title_length'])
        else:
            html += '<p>⚠️ <strong>Título:</strong> {} chars (ideal: 50-60)</p>'.format(analysis['title_length'])
        
        # Meta descrição
        if analysis['meta_description_optimal']:
            html += '<p>✅ <strong>Meta descrição:</strong> Tamanho ideal ({} chars)</p>'.format(analysis['meta_description_length'])
        elif analysis['meta_description_length'] == 0:
            html += '<p>❌ <strong>Meta descrição:</strong> Não definida</p>'
        else:
            html += '<p>⚠️ <strong>Meta descrição:</strong> {} chars (ideal: 150-160)</p>'.format(analysis['meta_description_length'])
        
        # Palavra-chave
        if analysis['has_focus_keyword']:
            if analysis['focus_keyword_in_title']:
                html += '<p>✅ <strong>Palavra-chave:</strong> Presente no título</p>'
            else:
                html += '<p>⚠️ <strong>Palavra-chave:</strong> Ausente no título</p>'
            
            if 'keyword_density' in analysis:
                if analysis['keyword_density_optimal']:
                    html += '<p>✅ <strong>Densidade:</strong> {:.1f}% (ideal)</p>'.format(analysis['keyword_density'])
                else:
                    html += '<p>⚠️ <strong>Densidade:</strong> {:.1f}% (ideal: 0.5-2.5%)</p>'.format(analysis['keyword_density'])
        else:
            html += '<p>❌ <strong>Palavra-chave:</strong> Não definida</p>'
        
        # Conteúdo
        if analysis['content_length_optimal']:
            html += '<p>✅ <strong>Conteúdo:</strong> {} palavras</p>'.format(analysis['content_word_count'])
        else:
            html += '<p>⚠️ <strong>Conteúdo:</strong> {} palavras (mínimo: 300)</p>'.format(analysis['content_word_count'])
        
        # Elementos visuais
        if analysis['has_featured_image']:
            html += '<p>✅ <strong>Imagem destacada:</strong> Presente</p>'
        else:
            html += '<p>❌ <strong>Imagem destacada:</strong> Ausente</p>'
        
        # Organização
        if analysis['has_category']:
            html += '<p>✅ <strong>Categoria:</strong> Definida</p>'
        else:
            html += '<p>❌ <strong>Categoria:</strong> Não definida</p>'
        
        if analysis['has_tags']:
            html += '<p>✅ <strong>Tags:</strong> Definidas</p>'
        else:
            html += '<p>❌ <strong>Tags:</strong> Não definidas</p>'
        
        html += '</div>'
        
        return mark_safe(html)
    seo_analysis_display.short_description = 'Análise SEO Detalhada'
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('author', 'category').prefetch_related('tags')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author_name', 'post', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['author_name', 'author_email', 'content', 'post__title']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Informações do Comentário', {
            'fields': ('post', 'author_name', 'author_email', 'content')
        }),
        ('Moderação', {
            'fields': ('is_approved', 'created_at')
        }),
    )
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('post')


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'subscribed_at']
    list_filter = ['is_active', 'subscribed_at']
    search_fields = ['email', 'name']
    readonly_fields = ['subscribed_at']
    
    fieldsets = (
        ('Informações do Assinante', {
            'fields': ('email', 'name')
        }),
        ('Status', {
            'fields': ('is_active', 'subscribed_at')
        }),
    )
    
    actions = ['make_active', 'make_inactive']
    
    def make_active(self, request, queryset):
        queryset.update(is_active=True)
    make_active.short_description = "Ativar assinantes selecionados"
    
    def make_inactive(self, request, queryset):
        queryset.update(is_active=False)
    make_inactive.short_description = "Desativar assinantes selecionados"


@admin.register(ImageCredit)
class ImageCreditAdmin(admin.ModelAdmin):
    list_display = ['post', 'image_filename', 'credit', 'photographer', 'created_at']
    list_filter = ['license_type', 'created_at']
    search_fields = ['post__title', 'image_filename', 'credit', 'photographer']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Imagem', {
            'fields': ('post', 'image_url', 'image_filename', 'alt_text')
        }),
        ('Créditos', {
            'fields': ('caption', 'credit', 'photographer', 'source_url', 'license_type')
        }),
        ('Metadados', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )


# Customize admin site header
admin.site.site_header = "MOZ SOLIDÁRIA - Administração"
admin.site.site_title = "MOZ SOLIDÁRIA Admin"
admin.site.index_title = "Painel de Administração"
