from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.contrib import messages
from django.db.models import Count, Q
from django.http import HttpResponseRedirect
from .models import BlogPost, Category, Tag, Comment, Newsletter, ImageCredit, Like, Share
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
    list_display = [
        'author_name_display', 'post_title_display', 'content_preview', 
        'status_display', 'replies_count', 'created_at_display', 'actions_display'
    ]
    list_filter = ['is_approved', 'created_at', 'updated_at', 'post__category']
    search_fields = ['author_name', 'author_email', 'content', 'post__title']
    readonly_fields = ['created_at', 'updated_at']
    list_per_page = 25
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    # Actions personalizadas
    actions = ['approve_comments', 'reject_comments', 'mark_as_spam', 'bulk_delete_comments']
    
    fieldsets = (
        ('Informações do Comentário', {
            'fields': ('post', 'content', 'parent')
        }),
        ('Autor', {
            'fields': ('author', 'author_name', 'author_email')
        }),
        ('Moderação', {
            'fields': ('is_approved', 'created_at', 'updated_at')
        }),
    )
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.select_related('post', 'author', 'parent').annotate(
            replies_count=Count('replies')
        )
    
    # Displays personalizados
    def author_name_display(self, obj):
        if obj.author:
            return format_html(
                '<strong>{}</strong><br><small>👤 Usuário registrado</small>',
                obj.author.get_full_name() or obj.author.username
            )
        return format_html(
            '{}<br><small>📧 {}</small>',
            obj.author_name,
            obj.author_email
        )
    author_name_display.short_description = 'Autor'
    author_name_display.admin_order_field = 'author_name'
    
    def post_title_display(self, obj):
        return format_html(
            '<a href="{}" target="_blank">{}</a><br><small>📂 {}</small>',
            reverse('admin:blog_blogpost_change', args=[obj.post.id]),
            obj.post.title[:50] + '...' if len(obj.post.title) > 50 else obj.post.title,
            obj.post.category.name if obj.post.category else 'Sem categoria'
        )
    post_title_display.short_description = 'Post'
    post_title_display.admin_order_field = 'post__title'
    
    def content_preview(self, obj):
        content = obj.content[:100] + '...' if len(obj.content) > 100 else obj.content
        if obj.parent:
            return format_html(
                '↳ <em>Resposta a:</em><br>{}<br><br><strong>Conteúdo:</strong><br>{}',
                obj.parent.content[:50] + '...' if len(obj.parent.content) > 50 else obj.parent.content,
                content
            )
        return format_html('<div style="max-width: 300px;">{}</div>', content)
    content_preview.short_description = 'Conteúdo'
    
    def status_display(self, obj):
        if obj.is_approved:
            return format_html(
                '<span style="color: green; font-weight: bold;">✅ Aprovado</span>'
            )
        return format_html(
            '<span style="color: orange; font-weight: bold;">⏳ Pendente</span>'
        )
    status_display.short_description = 'Status'
    status_display.admin_order_field = 'is_approved'
    
    def replies_count(self, obj):
        count = obj.replies_count
        if count > 0:
            return format_html(
                '<span style="background: #e1f5fe; padding: 2px 6px; border-radius: 3px;">{} respostas</span>',
                count
            )
        return '—'
    replies_count.short_description = 'Respostas'
    replies_count.admin_order_field = 'replies_count'
    
    def created_at_display(self, obj):
        return format_html(
            '{}<br><small>{}</small>',
            obj.created_at.strftime('%d/%m/%Y'),
            obj.created_at.strftime('%H:%M')
        )
    created_at_display.short_description = 'Data'
    created_at_display.admin_order_field = 'created_at'
    
    def actions_display(self, obj):
        actions = []
        
        if not obj.is_approved:
            actions.append(format_html(
                '<a href="{}" style="color: green;">✅ Aprovar</a>',
                reverse('admin:blog_comment_approve', args=[obj.id])
            ))
        else:
            actions.append(format_html(
                '<a href="{}" style="color: orange;">❌ Rejeitar</a>',
                reverse('admin:blog_comment_reject', args=[obj.id])
            ))
        
        actions.append(format_html(
            '<a href="{}" style="color: red;" onclick="return confirm(\'Tem certeza?\')">🗑️ Excluir</a>',
            reverse('admin:blog_comment_delete', args=[obj.id])
        ))
        
        return format_html(' | '.join(actions))
    actions_display.short_description = 'Ações'
    
    # Actions em massa
    def approve_comments(self, request, queryset):
        updated = queryset.update(is_approved=True, updated_at=timezone.now())
        self.message_user(
            request, 
            f'{updated} comentário(s) aprovado(s) com sucesso.',
            messages.SUCCESS
        )
    approve_comments.short_description = "✅ Aprovar comentários selecionados"
    
    def reject_comments(self, request, queryset):
        updated = queryset.update(is_approved=False, updated_at=timezone.now())
        self.message_user(
            request, 
            f'{updated} comentário(s) rejeitado(s) com sucesso.',
            messages.WARNING
        )
    reject_comments.short_description = "❌ Rejeitar comentários selecionados"
    
    def mark_as_spam(self, request, queryset):
        # Marcar como spam e rejeitar
        updated = queryset.update(is_approved=False, updated_at=timezone.now())
        # Aqui poderia adicionar lógica para blacklist de emails/IPs
        self.message_user(
            request, 
            f'{updated} comentário(s) marcado(s) como spam.',
            messages.ERROR
        )
    mark_as_spam.short_description = "🚫 Marcar como SPAM"
    
    def bulk_delete_comments(self, request, queryset):
        count = queryset.count()
        queryset.delete()
        self.message_user(
            request, 
            f'{count} comentário(s) excluído(s) permanentemente.',
            messages.ERROR
        )
    bulk_delete_comments.short_description = "🗑️ Excluir permanentemente"
    
    # URLs customizadas para ações individuais
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path(
                '<int:comment_id>/approve/',
                self.admin_site.admin_view(self.approve_comment_view),
                name='blog_comment_approve',
            ),
            path(
                '<int:comment_id>/reject/',
                self.admin_site.admin_view(self.reject_comment_view),
                name='blog_comment_reject',
            ),
        ]
        return custom_urls + urls
    
    def approve_comment_view(self, request, comment_id):
        comment = Comment.objects.get(id=comment_id)
        comment.is_approved = True
        comment.updated_at = timezone.now()
        comment.save()
        
        messages.success(request, f'Comentário de "{comment.author_name}" aprovado com sucesso.')
        return HttpResponseRedirect(reverse('admin:blog_comment_changelist'))
    
    def reject_comment_view(self, request, comment_id):
        comment = Comment.objects.get(id=comment_id)
        comment.is_approved = False
        comment.updated_at = timezone.now()
        comment.save()
        
        messages.warning(request, f'Comentário de "{comment.author_name}" rejeitado.')
        return HttpResponseRedirect(reverse('admin:blog_comment_changelist'))
    
    # Filtros customizados
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        # Estatísticas para o dashboard
        total_comments = Comment.objects.count()
        pending_comments = Comment.objects.filter(is_approved=False).count()
        approved_comments = Comment.objects.filter(is_approved=True).count()
        recent_comments = Comment.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        extra_context.update({
            'total_comments': total_comments,
            'pending_comments': pending_comments,
            'approved_comments': approved_comments,
            'recent_comments': recent_comments,
        })
        
        return super().changelist_view(request, extra_context=extra_context)


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


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['user_display', 'post_title', 'created_at_display']
    list_filter = ['created_at', 'post__category']
    search_fields = ['user__username', 'user__email', 'post__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def user_display(self, obj):
        return format_html(
            '<strong>{}</strong><br><small>📧 {}</small>',
            obj.user.get_full_name() or obj.user.username,
            obj.user.email
        )
    user_display.short_description = 'Usuário'
    user_display.admin_order_field = 'user__username'
    
    def post_title(self, obj):
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            reverse('admin:blog_blogpost_change', args=[obj.post.id]),
            obj.post.title[:60] + '...' if len(obj.post.title) > 60 else obj.post.title
        )
    post_title.short_description = 'Post'
    post_title.admin_order_field = 'post__title'
    
    def created_at_display(self, obj):
        return format_html(
            '{}<br><small>{}</small>',
            obj.created_at.strftime('%d/%m/%Y'),
            obj.created_at.strftime('%H:%M')
        )
    created_at_display.short_description = 'Data da Curtida'
    created_at_display.admin_order_field = 'created_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'post')


@admin.register(Share)
class ShareAdmin(admin.ModelAdmin):
    list_display = ['post_title', 'share_type_display', 'user_display', 'ip_address', 'created_at_display']
    list_filter = ['share_type', 'created_at', 'post__category']
    search_fields = ['post__title', 'user__username', 'ip_address']
    readonly_fields = ['created_at', 'ip_address', 'user_agent']
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    def post_title(self, obj):
        return format_html(
            '<a href="{}" target="_blank">{}</a>',
            reverse('admin:blog_blogpost_change', args=[obj.post.id]),
            obj.post.title[:50] + '...' if len(obj.post.title) > 50 else obj.post.title
        )
    post_title.short_description = 'Post'
    post_title.admin_order_field = 'post__title'
    
    def share_type_display(self, obj):
        type_icons = {
            'facebook': '📘',
            'twitter': '🐦',
            'linkedin': '💼',
            'whatsapp': '💬',
            'email': '📧',
            'copy_link': '🔗',
            'other': '🔄'
        }
        icon = type_icons.get(obj.share_type, '🔄')
        display_name = dict(Share.SHARE_TYPES).get(obj.share_type, obj.share_type)
        
        return format_html(
            '{} <strong>{}</strong>',
            icon,
            display_name
        )
    share_type_display.short_description = 'Tipo de Compartilhamento'
    share_type_display.admin_order_field = 'share_type'
    
    def user_display(self, obj):
        if obj.user:
            return format_html(
                '<strong>{}</strong><br><small>👤 Usuário registrado</small>',
                obj.user.get_full_name() or obj.user.username
            )
        return format_html(
            '<em>Anônimo</em><br><small>🌐 {}</small>',
            obj.ip_address or 'IP desconhecido'
        )
    user_display.short_description = 'Usuário'
    user_display.admin_order_field = 'user__username'
    
    def created_at_display(self, obj):
        return format_html(
            '{}<br><small>{}</small>',
            obj.created_at.strftime('%d/%m/%Y'),
            obj.created_at.strftime('%H:%M')
        )
    created_at_display.short_description = 'Data do Compartilhamento'
    created_at_display.admin_order_field = 'created_at'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'post')
    
    # Estatísticas por tipo
    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        
        # Estatísticas de compartilhamentos
        from django.db.models import Count
        share_stats = Share.objects.values('share_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        total_shares = Share.objects.count()
        recent_shares = Share.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=7)
        ).count()
        
        extra_context.update({
            'share_stats': share_stats,
            'total_shares': total_shares,
            'recent_shares': recent_shares,
        })
        
        return super().changelist_view(request, extra_context=extra_context)


# Customize admin site header
admin.site.site_header = "MOZ SOLIDÁRIA - Administração"
admin.site.site_title = "MOZ SOLIDÁRIA Admin"
admin.site.index_title = "Painel de Administração"
