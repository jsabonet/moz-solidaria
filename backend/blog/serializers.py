import requests
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import BlogPost, Category, Tag, Comment, Newsletter, ImageCredit


class AuthorSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'full_name', 'email']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username


class CategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'posts_count', 'created_at']
        extra_kwargs = {
            'slug': {'required': False},
        }
    
    def get_posts_count(self, obj):
        return obj.blogpost_set.count()
    
    def validate_name(self, value):
        """Ensure category name is unique"""
        instance = getattr(self, 'instance', None)
        if instance and instance.name == value:
            return value
        if Category.objects.filter(name=value).exists():
            raise serializers.ValidationError("Uma categoria com este nome já existe.")
        return value
    
    def validate_slug(self, value):
        """Ensure slug is unique"""
        if value:
            instance = getattr(self, 'instance', None)
            if instance and instance.slug == value:
                return value
            if Category.objects.filter(slug=value).exists():
                raise serializers.ValidationError("Uma categoria com este slug já existe.")
        return value


class TagSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'posts_count', 'created_at']
    
    def get_posts_count(self, obj):
        return obj.blogpost_set.filter(status='published').count()


class ImageCreditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageCredit
        fields = [
            'id', 'image_url', 'image_filename', 'caption', 'credit', 
            'source_url', 'photographer', 'license_type', 'alt_text', 'created_at'
        ]


class BlogPostListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()
    absolute_url = serializers.SerializerMethodField()
    is_published = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author', 'category', 'tags',
            'featured_image_url', 'status', 'is_published', 'is_featured', 'created_at', 
            'updated_at', 'published_at', 'views_count', 'read_time',
            'absolute_url'
        ]
    
    def get_is_published(self, obj):
        return obj.status == 'published'
    
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None
    
    def get_absolute_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.get_absolute_url())
        return obj.get_absolute_url()


class BlogPostDetailSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()
    absolute_url = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_published = serializers.SerializerMethodField()
    image_credits = ImageCreditSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'author', 'category', 
            'tags', 'featured_image_url', 'featured_image_caption', 'featured_image_credit',
            'featured_image_source_url', 'status', 'is_published', 'is_featured', 'meta_description',
            'meta_keywords', 'created_at', 'updated_at', 'published_at', 
            'views_count', 'read_time', 'absolute_url', 'comments_count', 'image_credits'
        ]
    
    def get_is_published(self, obj):
        return obj.status == 'published'
    
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None
    
    def get_absolute_url(self, obj):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.get_absolute_url())
        return obj.get_absolute_url()
    
    def get_comments_count(self, obj):
        return obj.comments.filter(is_approved=True).count()


class BlogPostCreateUpdateSerializer(serializers.ModelSerializer):
    author = serializers.HiddenField(default=serializers.CurrentUserDefault())
    tags = serializers.PrimaryKeyRelatedField(queryset=Tag.objects.all(), many=True, required=False)
    featured_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = BlogPost
        fields = [
            'title', 'slug', 'excerpt', 'content', 'author', 'category', 'tags',
            'featured_image', 'featured_image_caption', 'featured_image_credit',
            'featured_image_source_url', 'status', 'is_featured', 'meta_description',
            'meta_keywords', 'published_at'
        ]
        extra_kwargs = {
            'slug': {'required': False},
        }

    def validate_slug(self, value):
        """Ensure slug is unique"""
        if value:
            instance = getattr(self, 'instance', None)
            if instance and instance.slug == value:
                return value
            if BlogPost.objects.filter(slug=value).exists():
                raise serializers.ValidationError("Um post com este slug já existe.")
        return value

    def to_internal_value(self, data):
        # Permitir URL string para featured_image com tratamento de erro robusto
        if isinstance(data, dict) and 'featured_image' in data:
            value = data['featured_image']
            if isinstance(value, str) and value.startswith('http'):
                try:
                    # Importações movidas para dentro do try para evitar UnboundLocalError
                    import requests
                    from django.core.files.base import ContentFile
                    import uuid
                    import mimetypes
                    from urllib.parse import urlparse
                    
                    # Headers para simular um browser real
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                    
                    print(f"📥 Baixando imagem de: {value}")
                    resp = requests.get(value, timeout=30, headers=headers)
                    
                    if resp.status_code == 200:
                        # Tenta obter extensão do mimetype
                        content_type = resp.headers.get('content-type', '')
                        ext = mimetypes.guess_extension(content_type.split(';')[0])
                        
                        if not ext:
                            # fallback: tenta pegar da url
                            parsed_url = urlparse(value)
                            path_ext = parsed_url.path.split('.')[-1].lower()
                            if path_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                                ext = '.' + path_ext
                            else:
                                ext = '.jpg'  # default
                        
                        # Gerar nome único para o arquivo
                        file_name = f"downloaded_{uuid.uuid4()}{ext}"
                        
                        # Criar arquivo Django a partir do conteúdo baixado
                        data['featured_image'] = ContentFile(resp.content, name=file_name)
                        
                        print(f"✅ Imagem baixada com sucesso: {file_name} ({len(resp.content)} bytes)")
                    else:
                        print(f"❌ Falha ao baixar imagem: HTTP {resp.status_code}")
                        # Manter a URL original se o download falhar
                        
                except ImportError as e:
                    print(f"❌ Biblioteca requests não disponível: {e}")
                    # Manter a URL original se requests não estiver disponível
                except Exception as e:
                    print(f"❌ Erro inesperado ao baixar imagem: {e}")
                    # Manter a URL original se houver qualquer erro
                    
        return super().to_internal_value(data)

    def create(self, validated_data):
        # Definir published_at quando status é 'published'
        if validated_data.get('status') == 'published' and not validated_data.get('published_at'):
            from django.utils import timezone
            validated_data['published_at'] = timezone.now()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Definir published_at quando status muda para 'published'
        if validated_data.get('status') == 'published' and not instance.published_at:
            from django.utils import timezone
            validated_data['published_at'] = timezone.now()
        elif validated_data.get('status') != 'published':
            validated_data['published_at'] = None
        return super().update(instance, validated_data)


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'author_email', 'content', 'is_approved', 'created_at']
        read_only_fields = ['is_approved']


class NewsletterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ['id', 'email', 'name', 'is_active', 'subscribed_at']
        read_only_fields = ['is_active', 'subscribed_at']
    
    def validate_email(self, value):
        """Check if email is already subscribed"""
        if Newsletter.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError("Este email já está inscrito na newsletter.")
        return value

    def to_internal_value(self, data):
        # Permitir URL string para featured_image (apenas se requests estiver instalado)
        if isinstance(data, dict) and 'featured_image' in data:
            value = data['featured_image']
            if isinstance(value, str) and value.startswith('http'):
                try:
                    import requests
                    from django.core.files.base import ContentFile
                    import uuid
                    import mimetypes
                    from urllib.parse import urlparse
                    
                    # Headers para simular um browser real
                    headers = {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                    
                    print(f"📥 Baixando imagem de: {value}")
                    resp = requests.get(value, timeout=30, headers=headers)
                    
                    if resp.status_code == 200:
                        # Tenta obter extensão do mimetype
                        content_type = resp.headers.get('content-type', '')
                        ext = mimetypes.guess_extension(content_type.split(';')[0])
                        
                        if not ext:
                            # fallback: tenta pegar da url
                            parsed_url = urlparse(value)
                            path_ext = parsed_url.path.split('.')[-1].lower()
                            if path_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp']:
                                ext = '.' + path_ext
                            else:
                                ext = '.jpg'  # default
                        
                        # Gerar nome único para o arquivo
                        file_name = f"downloaded_{uuid.uuid4()}{ext}"
                        
                        # Criar arquivo Django a partir do conteúdo baixado
                        data['featured_image'] = ContentFile(resp.content, name=file_name)
                        
                        print(f"✅ Imagem baixada com sucesso: {file_name} ({len(resp.content)} bytes)")
                    else:
                        print(f"❌ Falha ao baixar imagem: HTTP {resp.status_code}")
                        
                except requests.RequestException as e:
                    print(f"❌ Erro de rede ao baixar imagem: {e}")
                except Exception as e:
                    print(f"❌ Erro inesperado ao baixar imagem: {e}")
                    
        return super().to_internal_value(data)
