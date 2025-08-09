"""
Serializers para o sistema de categorias de projetos
"""

from rest_framework import serializers
from core.models import ProjectCategory, Project, ProjectUpdate, ProjectGallery, Program


class ProgramSimpleSerializer(serializers.ModelSerializer):
    """Serializer simplificado para programas"""
    class Meta:
        model = Program
        fields = ['id', 'name', 'slug', 'color']


class ProjectCategorySerializer(serializers.ModelSerializer):
    """Serializer para categorias de projetos"""
    program = ProgramSimpleSerializer(read_only=True)
    program_id = serializers.IntegerField(write_only=True)
    projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectCategory
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'icon',
            'program', 'program_id', 'is_active', 'order', 'projects_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_projects_count(self, obj):
        """Retorna o número de projetos nesta categoria"""
        return obj.project_set.count()
    
    def validate_program_id(self, value):
        """Valida se o programa existe"""
        try:
            Program.objects.get(id=value)
            return value
        except Program.DoesNotExist:
            raise serializers.ValidationError("Programa não encontrado.")


class ProjectCategoryListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de categorias"""
    program_name = serializers.CharField(source='program.name', read_only=True)
    projects_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectCategory
        fields = [
            'id', 'name', 'slug', 'description', 'color', 'icon',
            'program_name', 'is_active', 'order', 'projects_count'
        ]
    
    def get_projects_count(self, obj):
        return obj.project_set.count()


class ProjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer para atualizações de projetos"""
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ProjectUpdate
        fields = [
            'id', 'project', 'title', 'content', 'image', 'is_milestone',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']


class ProjectGallerySerializer(serializers.ModelSerializer):
    """Serializer para galeria de projetos"""
    
    class Meta:
        model = ProjectGallery
        fields = [
            'id', 'project', 'title', 'description', 'image',
            'order', 'is_featured', 'created_at'
        ]
        read_only_fields = ['created_at']


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Serializer detalhado para projetos"""
    program = ProgramSimpleSerializer(read_only=True)
    category = ProjectCategoryListSerializer(read_only=True)
    updates = ProjectUpdateSerializer(many=True, read_only=True)
    gallery = ProjectGallerySerializer(many=True, read_only=True)
    progress_status = serializers.CharField(read_only=True)
    funding_percentage = serializers.FloatField(read_only=True)
    featured_image = serializers.SerializerMethodField()
    
    def get_featured_image(self, obj):
        """Retorna URL absoluta da imagem principal"""
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'content',
            'program', 'category', 'location', 'district', 'province', 'status', 'priority', 'start_date', 'end_date',
            'progress_percentage', 'progress_status', 'current_beneficiaries', 'target_beneficiaries',
            'featured_image', 'budget', 'raised_amount', 'funding_percentage',
            'meta_title', 'meta_description', 'meta_keywords',
            'is_featured', 'is_public', 'accepts_donations',
            'updates', 'gallery', 'created_at', 'updated_at'
        ]


class ProjectListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagem de projetos"""
    program = ProgramSimpleSerializer(read_only=True)
    category = ProjectCategoryListSerializer(read_only=True)
    progress_status = serializers.CharField(read_only=True)
    funding_percentage = serializers.FloatField(read_only=True)
    featured_image = serializers.SerializerMethodField()
    
    def get_featured_image(self, obj):
        """Retorna URL absoluta da imagem principal"""
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'slug', 'short_description', 'program', 'category',
            'location', 'district', 'province', 'status', 'progress_percentage', 'progress_status',
            'current_beneficiaries', 'target_beneficiaries', 'featured_image',
            'budget', 'raised_amount', 'funding_percentage',
            'is_featured', 'is_public', 'start_date', 'created_at'
        ]


class ProjectCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer para criação/atualização de projetos"""
    program_id = serializers.IntegerField(write_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Project
        fields = [
            'name', 'description', 'short_description', 'content',
            'program_id', 'category_id', 'location', 'district', 'province', 'status', 'priority',
            'start_date', 'end_date', 'progress_percentage',
            'current_beneficiaries', 'target_beneficiaries',
            'featured_image', 'budget', 'raised_amount',
            'meta_title', 'meta_description', 'meta_keywords',
            'is_featured', 'is_public', 'accepts_donations'
        ]
    
    def validate_program_id(self, value):
        """Valida se o programa existe"""
        try:
            Program.objects.get(id=value)
            return value
        except Program.DoesNotExist:
            raise serializers.ValidationError("Programa não encontrado.")
    
    def validate_category_id(self, value):
        """Valida se a categoria existe"""
        if value is not None:
            try:
                ProjectCategory.objects.get(id=value)
                return value
            except ProjectCategory.DoesNotExist:
                raise serializers.ValidationError("Categoria não encontrada.")
        return value
    
    def validate(self, data):
        """Validação cruzada entre programa e categoria"""
        program_id = data.get('program_id')
        category_id = data.get('category_id')
        
        if category_id and program_id:
            try:
                category = ProjectCategory.objects.get(id=category_id)
                if category.program.id != program_id:
                    raise serializers.ValidationError({
                        'category_id': 'A categoria deve pertencer ao programa selecionado.'
                    })
            except ProjectCategory.DoesNotExist:
                pass  # Já validado em validate_category_id
        
        return data
