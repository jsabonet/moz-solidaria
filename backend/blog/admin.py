from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import BlogPost, Category, Tag, Comment, Newsletter


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


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'category', 'status', 'is_featured', 
        'views_count', 'read_time', 'created_at', 'published_at'
    ]
    list_filter = [
        'status', 'is_featured', 'category', 'tags', 'created_at', 'published_at'
    ]
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']
    readonly_fields = ['views_count', 'read_time', 'created_at', 'updated_at']
    inlines = [CommentInline]
    
    fieldsets = (
        ('Conteúdo Principal', {
            'fields': ('title', 'slug', 'excerpt', 'content', 'featured_image')
        }),
        ('Classificação', {
            'fields': ('author', 'category', 'tags')
        }),
        ('Status e Visibilidade', {
            'fields': ('status', 'is_featured', 'published_at')
        }),
        ('SEO', {
            'fields': ('meta_description', 'meta_keywords'),
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


# Customize admin site header
admin.site.site_header = "MOZ SOLIDÁRIA - Administração"
admin.site.site_title = "MOZ SOLIDÁRIA Admin"
admin.site.index_title = "Painel de Administração"
