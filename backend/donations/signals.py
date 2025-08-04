# backend/donations/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum, Count
from .models import Donation

@receiver(post_save, sender=Donation)
def update_donor_stats_on_donation_change(sender, instance, **kwargs):
    """Atualizar estatísticas quando uma doação é modificada"""
    # Só atualizar se a doação foi aprovada ou rejeitada
    if instance.status in ['approved', 'rejected']:
        update_donor_stats(instance.donor)

@receiver(post_delete, sender=Donation)
def update_donor_stats_on_donation_delete(sender, instance, **kwargs):
    """Atualizar estatísticas quando uma doação é deletada"""
    update_donor_stats(instance.donor)

def update_donor_stats(user):
    """Atualizar estatísticas de um doador específico"""
    try:
        from core.models import Donor as CoreDonor
        from datetime import datetime
        
        # Buscar ou criar perfil de doador no core
        core_donor, created = CoreDonor.objects.get_or_create(
            user_profile__user=user,
            defaults={
                'user_profile_id': getattr(user, 'client_profile', None) and user.client_profile.id
            }
        )
        
        # Calcular estatísticas atualizadas
        approved_donations = Donation.objects.filter(
            donor=user, 
            status='approved'
        )
        
        stats = approved_donations.aggregate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        # Atualizar o perfil do doador
        core_donor.total_donated = stats['total'] or 0
        
        # Atualizar datas de primeira e última doação
        first_donation = approved_donations.order_by('approval_date').first()
        last_donation = approved_donations.order_by('-approval_date').first()
        
        if first_donation:
            core_donor.first_donation_date = first_donation.approval_date or first_donation.submission_date
        
        if last_donation:
            core_donor.last_donation_date = last_donation.approval_date or last_donation.submission_date
            
        core_donor.save()
        
        print(f"✅ Estatísticas atualizadas para {user.username}: Total={core_donor.total_donated}, Count={stats['count']}")
        
    except Exception as e:
        print(f"❌ Erro ao atualizar estatísticas do doador {user.username}: {e}")
