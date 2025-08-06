from django.contrib import admin
from django.utils.html import format_html
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    Contact, Program, TeamMember, Project, Testimonial, SiteSettings,
    UserProfile, Cause, Skill, Certification, Donor, Beneficiary, 
    Volunteer, VolunteerCertification, Partner, ProjectCategory,
    ProjectUpdate, ProjectGallery
)


# =====================================
# SISTEMA DE PERFIS DE USUÁRIO
# =====================================

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Perfil'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'phone', 'is_verified', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_verified', 'is_active', 'created_at']
    search_fields = ['user__username', 'user__first_name', 'user__last_name', 'user__email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações do Usuário', {
            'fields': ('user', 'user_type')
        }),
        ('Informações Pessoais', {
            'fields': ('phone', 'address', 'date_of_birth', 'profile_picture')
        }),
        ('Status', {
            'fields': ('is_verified', 'is_active', 'last_activity')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Cause)
class CauseAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon', 'color', 'is_active']
    list_filter = ['is_active', 'color']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name', 'category']


@admin.register(Certification)
class CertificationAdmin(admin.ModelAdmin):
    list_display = ['name', 'issuer', 'validity_period', 'is_active']
    list_filter = ['issuer', 'is_active']
    search_fields = ['name', 'issuer']


@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'total_donated', 'preferred_frequency', 'first_donation_date', 'last_donation_date']
    list_filter = ['preferred_frequency', 'anonymous_donations', 'public_recognition', 'receive_updates']
    search_fields = ['user_profile__user__username', 'user_profile__user__first_name', 'user_profile__user__last_name']
    readonly_fields = ['total_donated', 'first_donation_date', 'last_donation_date']
    filter_horizontal = ['preferred_causes']
    
    fieldsets = (
        ('Informações do Doador', {
            'fields': ('user_profile',)
        }),
        ('Estatísticas de Doação', {
            'fields': ('total_donated', 'first_donation_date', 'last_donation_date', 'preferred_frequency')
        }),
        ('Preferências', {
            'fields': ('preferred_causes', 'communication_preferences')
        }),
        ('Configurações de Comunicação', {
            'fields': ('receive_updates', 'receive_receipts', 'anonymous_donations', 'public_recognition')
        }),
    )


@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'community', 'family_size', 'verification_status', 'verified_by']
    list_filter = ['verification_status', 'family_status', 'district', 'province']
    search_fields = ['user_profile__user__username', 'user_profile__user__first_name', 'community', 'district']
    readonly_fields = ['verification_date']
    
    fieldsets = (
        ('Informações do Beneficiário', {
            'fields': ('user_profile',)
        }),
        ('Família', {
            'fields': ('family_size', 'children_count', 'family_status')
        }),
        ('Localização', {
            'fields': ('community', 'district', 'province')
        }),
        ('Verificação', {
            'fields': ('verification_status', 'verified_by', 'verification_date', 'needs_assessment')
        }),
        ('Documentação', {
            'fields': ('identity_document', 'proof_of_residence')
        }),
    )


class VolunteerCertificationInline(admin.TabularInline):
    model = VolunteerCertification
    extra = 0


@admin.register(Volunteer)
class VolunteerAdmin(admin.ModelAdmin):
    list_display = ['user_profile', 'total_hours', 'projects_completed', 'rating', 'availability_type']
    list_filter = ['availability_type', 'transportation_available', 'remote_work_available']
    search_fields = ['user_profile__user__username', 'user_profile__user__first_name']
    filter_horizontal = ['skills', 'preferred_causes']
    inlines = [VolunteerCertificationInline]
    
    fieldsets = (
        ('Informações do Voluntário', {
            'fields': ('user_profile',)
        }),
        ('Habilidades e Certificações', {
            'fields': ('skills',)
        }),
        ('Disponibilidade', {
            'fields': ('availability_type', 'availability', 'max_hours_per_week')
        }),
        ('Estatísticas', {
            'fields': ('total_hours', 'projects_completed', 'rating')
        }),
        ('Preferências', {
            'fields': ('preferred_causes', 'transportation_available', 'remote_work_available')
        }),
    )


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ['organization_name', 'organization_type', 'partnership_level', 'contact_person', 'partnership_start_date']
    list_filter = ['organization_type', 'partnership_level']
    search_fields = ['organization_name', 'contact_person', 'contact_email']
    filter_horizontal = ['areas_of_expertise']
    
    fieldsets = (
        ('Informações do Usuário', {
            'fields': ('user_profile',)
        }),
        ('Organização', {
            'fields': ('organization_name', 'organization_type', 'tax_id', 'website', 'established_date')
        }),
        ('Contato', {
            'fields': ('contact_person', 'contact_email', 'contact_phone')
        }),
        ('Parceria', {
            'fields': ('partnership_level', 'partnership_start_date', 'partnership_agreement')
        }),
        ('Capacidades', {
            'fields': ('areas_of_expertise', 'resources_available')
        }),
    )


# =====================================
# MODELOS EXISTENTES
# =====================================

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'is_replied', 'created_at']
    list_filter = ['subject', 'is_read', 'is_replied', 'created_at']
    search_fields = ['name', 'email', 'message']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Informações de Contato', {
            'fields': ('name', 'email', 'phone', 'subject')
        }),
        ('Mensagem', {
            'fields': ('message',)
        }),
        ('Status', {
            'fields': ('is_read', 'is_replied')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_read', 'mark_as_replied']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
    mark_as_read.short_description = "Marcar como lida"
    
    def mark_as_replied(self, request, queryset):
        queryset.update(is_replied=True)
    mark_as_replied.short_description = "Marcar como respondida"


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'order', 'beneficiaries_count', 'communities_reached']
    list_filter = ['is_active', 'color']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'slug', 'description', 'short_description')
        }),
        ('Aparência', {
            'fields': ('icon', 'color', 'image')
        }),
        ('Configurações', {
            'fields': ('is_active', 'order')
        }),
        ('Estatísticas', {
            'fields': ('beneficiaries_count', 'communities_reached')
        }),
    )


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'email', 'order', 'is_active']
    list_filter = ['is_active', 'role']
    search_fields = ['name', 'role', 'email']


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'program', 'color', 'is_active', 'order', 'projects_count']
    list_filter = ['program', 'color', 'is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['order', 'is_active']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'slug', 'description', 'program')
        }),
        ('Aparência', {
            'fields': ('color', 'icon')
        }),
        ('Configurações', {
            'fields': ('is_active', 'order')
        }),
    )
    
    def projects_count(self, obj):
        """Retorna o número de projetos nesta categoria"""
        return obj.project_set.count()
    projects_count.short_description = 'Projetos'
    projects_count.admin_order_field = 'project_count'


class ProjectUpdateInline(admin.TabularInline):
    model = ProjectUpdate
    extra = 0
    fields = ['title', 'content', 'is_milestone', 'created_at']
    readonly_fields = ['created_at']


class ProjectGalleryInline(admin.TabularInline):
    model = ProjectGallery
    extra = 0
    fields = ['title', 'image', 'order', 'is_featured']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'program', 'category', 'location', 'status', 'priority',
        'progress_percentage', 'current_beneficiaries', 'is_featured', 'is_public'
    ]
    list_filter = [
        'status', 'priority', 'program', 'category', 'is_featured', 
        'is_public', 'accepts_donations', 'start_date'
    ]
    search_fields = ['name', 'description', 'location', 'meta_keywords']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['status', 'priority', 'progress_percentage', 'is_featured', 'is_public']
    inlines = [ProjectUpdateInline, ProjectGalleryInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('name', 'slug', 'short_description', 'program', 'category')
        }),
        ('Conteúdo', {
            'fields': ('description', 'content')
        }),
        ('Detalhes do Projeto', {
            'fields': (
                'location', 'status', 'priority', 'start_date', 'end_date'
            )
        }),
        ('Progresso e Beneficiários', {
            'fields': (
                'progress_percentage', 'current_beneficiaries', 'target_beneficiaries'
            )
        }),
        ('Financeiro', {
            'fields': ('budget', 'raised_amount')
        }),
        ('Mídia', {
            'fields': ('featured_image',)
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('Configurações', {
            'fields': ('is_featured', 'is_public', 'accepts_donations')
        }),
    )
    
    def get_queryset(self, request):
        """Otimiza consultas incluindo relacionamentos"""
        return super().get_queryset(request).select_related('program', 'category')


@admin.register(ProjectUpdate)
class ProjectUpdateAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'is_milestone', 'created_by', 'created_at']
    list_filter = ['is_milestone', 'project__program', 'created_at']
    search_fields = ['title', 'content', 'project__name']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('project', 'title', 'content')
        }),
        ('Mídia', {
            'fields': ('image',)
        }),
        ('Configurações', {
            'fields': ('is_milestone', 'created_by')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        """Define automaticamente o usuário que criou a atualização"""
        if not change:  # Se é um novo objeto
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ProjectGallery)
class ProjectGalleryAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'is_featured', 'order', 'created_at']
    list_filter = ['is_featured', 'project__program', 'created_at']
    search_fields = ['title', 'description', 'project__name']
    list_editable = ['order', 'is_featured']
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('project', 'title', 'description')
        }),
        ('Mídia', {
            'fields': ('image',)
        }),
        ('Configurações', {
            'fields': ('order', 'is_featured')
        }),
    )


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'location', 'program', 'is_featured', 'is_active', 'order']
    list_filter = ['is_featured', 'is_active', 'program']
    search_fields = ['name', 'role', 'location', 'content']


@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    fieldsets = (
        ('Informações do Site', {
            'fields': ('site_name', 'site_description')
        }),
        ('Contato', {
            'fields': ('contact_email', 'contact_phone', 'address')
        }),
        ('Redes Sociais', {
            'fields': ('facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url')
        }),
        ('Analytics', {
            'fields': ('google_analytics_id',)
        }),
        ('Mídia', {
            'fields': ('logo', 'favicon')
        }),
    )
    
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False
