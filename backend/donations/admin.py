# backend/donations/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import Donation, DonationComment, DonationMethod, DonationStats

@admin.register(DonationMethod)
class DonationMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name', 'description']

class DonationCommentInline(admin.TabularInline):
    model = DonationComment
    extra = 0
    readonly_fields = ['author', 'created_at']

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'donor_link', 'formatted_amount', 'payment_method', 
        'status_badge', 'submission_date', 'reviewed_by'
    ]
    list_filter = ['status', 'payment_method', 'is_anonymous', 'submission_date']
    search_fields = ['donor__username', 'donor__email', 'payment_reference', 'purpose']
    readonly_fields = ['submission_date', 'review_date', 'approval_date', 'created_at', 'updated_at']
    inlines = [DonationCommentInline]
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('donor', 'amount', 'currency', 'purpose', 'is_anonymous')
        }),
        ('Pagamento', {
            'fields': ('payment_method', 'payment_reference', 'payment_proof')
        }),
        ('Status e Aprovação', {
            'fields': ('status', 'reviewed_by', 'admin_notes', 'rejection_reason')
        }),
        ('Datas', {
            'fields': ('submission_date', 'review_date', 'approval_date', 'created_at', 'updated_at')
        }),
        ('Mensagens', {
            'fields': ('donor_message',)
        })
    )
    
    def donor_link(self, obj):
        url = reverse('admin:auth_user_change', args=[obj.donor.id])
        return format_html('<a href="{}">{}</a>', url, obj.donor.username)
    donor_link.short_description = 'Doador'
    
    def status_badge(self, obj):
        colors = {
            'pending': 'orange',
            'submitted': 'blue',
            'under_review': 'purple',
            'approved': 'green',
            'rejected': 'red',
            'completed': 'darkgreen'
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def save_model(self, request, obj, form, change):
        if change and 'status' in form.changed_data:
            obj.reviewed_by = request.user
            obj.review_date = timezone.now()
            
            if obj.status == 'approved' and not obj.approval_date:
                obj.approval_date = timezone.now()
        
        super().save_model(request, obj, form, change)

@admin.register(DonationComment)
class DonationCommentAdmin(admin.ModelAdmin):
    list_display = ['donation', 'author', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']
    search_fields = ['message', 'author__username']

@admin.register(DonationStats)
class DonationStatsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_donations', 'total_donors', 'approved_count', 'pending_count']
    list_filter = ['date']
    readonly_fields = ['date']
