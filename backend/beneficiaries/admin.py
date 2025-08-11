# backend/beneficiaries/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import BeneficiaryProfile, SupportRequest, BeneficiaryCommunication, BeneficiaryDocument


@admin.register(BeneficiaryProfile)
class BeneficiaryProfileAdmin(admin.ModelAdmin):
    list_display = [
        'full_name', 'age', 'district', 'employment_status', 
        'vulnerability_score', 'is_verified', 'created_at'
    ]
    list_filter = [
        'is_verified', 'province', 'district', 'employment_status', 
        'education_level', 'is_displaced', 'has_chronic_illness'
    ]
    search_fields = ['full_name', 'phone_number', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'age', 'vulnerability_score']
    
    fieldsets = (
        ('Informações do Usuário', {
            'fields': ('user',)
        }),
        ('Informações Pessoais', {
            'fields': ('full_name', 'date_of_birth', 'age', 'gender', 'phone_number', 'alternative_phone')
        }),
        ('Localização', {
            'fields': ('province', 'district', 'administrative_post', 'locality', 'neighborhood', 'address_details')
        }),
        ('Informações Socioeconômicas', {
            'fields': ('education_level', 'employment_status', 'monthly_income', 'family_status')
        }),
        ('Composição Familiar', {
            'fields': ('family_members_count', 'children_count', 'elderly_count', 'disabled_count')
        }),
        ('Vulnerabilidades', {
            'fields': ('is_displaced', 'displacement_reason', 'has_chronic_illness', 'chronic_illness_details', 'vulnerability_score')
        }),
        ('Necessidades', {
            'fields': ('priority_needs', 'additional_information')
        }),
        ('Verificação', {
            'fields': ('is_verified', 'verification_date', 'verified_by')
        }),
        ('Metadados', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )

    def age(self, obj):
        return obj.age
    age.short_description = 'Idade'

    def vulnerability_score(self, obj):
        score = obj.vulnerability_score
        if score >= 7:
            color = 'red'
        elif score >= 4:
            color = 'orange'
        else:
            color = 'green'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}/10</span>',
            color, score
        )
    vulnerability_score.short_description = 'Score de Vulnerabilidade'


@admin.register(SupportRequest)
class SupportRequestAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'beneficiary', 'request_type', 'urgency', 'status', 
        'is_overdue', 'requested_date', 'assigned_to'
    ]
    list_filter = [
        'request_type', 'urgency', 'status', 'requested_date', 
        'assigned_to', 'reviewed_by'
    ]
    search_fields = ['title', 'description', 'beneficiary__full_name']
    readonly_fields = ['requested_date', 'is_overdue']
    date_hierarchy = 'requested_date'
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('beneficiary', 'request_type', 'title', 'description', 'urgency')
        }),
        ('Estimativas', {
            'fields': ('estimated_beneficiaries', 'estimated_cost', 'needed_by_date')
        }),
        ('Revisão', {
            'fields': ('status', 'reviewed_by', 'reviewed_at', 'admin_notes')
        }),
        ('Execução', {
            'fields': ('assigned_to', 'started_at', 'completed_at', 'actual_cost', 'actual_beneficiaries')
        }),
        ('Metadados', {
            'fields': ('requested_date', 'is_overdue'),
            'classes': ('collapse',)
        })
    )

    def is_overdue(self, obj):
        if obj.is_overdue:
            return format_html('<span style="color: red; font-weight: bold;">Atrasada</span>')
        return 'No prazo'
    is_overdue.short_description = 'Prazo'

    actions = ['mark_as_approved', 'mark_as_in_progress', 'mark_as_completed']

    def mark_as_approved(self, request, queryset):
        updated = queryset.update(
            status='aprovada',
            reviewed_by=request.user,
            reviewed_at=timezone.now()
        )
        self.message_user(request, f'{updated} solicitações aprovadas.')
    mark_as_approved.short_description = 'Marcar como aprovada'

    def mark_as_in_progress(self, request, queryset):
        updated = queryset.update(
            status='em_andamento',
            started_at=timezone.now()
        )
        self.message_user(request, f'{updated} solicitações marcadas como em andamento.')
    mark_as_in_progress.short_description = 'Marcar como em andamento'

    def mark_as_completed(self, request, queryset):
        updated = queryset.update(
            status='concluida',
            completed_at=timezone.now()
        )
        self.message_user(request, f'{updated} solicitações concluídas.')
    mark_as_completed.short_description = 'Marcar como concluída'


@admin.register(BeneficiaryCommunication)
class BeneficiaryCommunicationAdmin(admin.ModelAdmin):
    list_display = ['subject', 'support_request', 'sender', 'message_type', 'is_read', 'created_at']
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['subject', 'message', 'sender__username', 'support_request__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(BeneficiaryDocument)
class BeneficiaryDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'beneficiary', 'document_type', 'verified', 'uploaded_at']
    list_filter = ['document_type', 'verified', 'uploaded_at']
    search_fields = ['title', 'beneficiary__full_name', 'description']
    readonly_fields = ['uploaded_at']
    date_hierarchy = 'uploaded_at'

    actions = ['mark_as_verified']

    def mark_as_verified(self, request, queryset):
        updated = queryset.update(
            verified=True,
            verified_by=request.user,
            verified_at=timezone.now()
        )
        self.message_user(request, f'{updated} documentos verificados.')
    mark_as_verified.short_description = 'Marcar como verificado'
