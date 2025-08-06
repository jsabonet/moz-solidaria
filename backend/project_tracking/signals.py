# backend/project_tracking/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone

from .models import ProjectUpdate, ProjectMilestone, ProjectGalleryImage, ProjectMetricsEntry
from core.models import Project

@receiver(post_save, sender=ProjectUpdate)
def update_project_metrics_on_update_save(sender, instance, created, **kwargs):
    """Atualiza métricas do projeto quando uma atualização é criada"""
    if created and instance.status == 'published':
        try:
            metrics = instance.project.metrics
            if not hasattr(metrics, '_updating'):
                metrics._updating = True
                
                # Lógica melhorada para atualizar métricas
                
                # 1. Pessoas impactadas: adicionar apenas o incremento desta atualização
                if instance.people_impacted:
                    metrics.people_impacted = (metrics.people_impacted or 0) + instance.people_impacted
                
                # 2. Orçamento: adicionar apenas o gasto desta atualização
                if instance.budget_spent:
                    current_budget = float(metrics.budget_used or 0)
                    new_spending = float(instance.budget_spent)
                    metrics.budget_used = str(current_budget + new_spending)
                
                # 3. Progresso: LÓGICA MELHORADA com validação
                if instance.progress_percentage is not None:
                    # Validar valores de entrada
                    if instance.progress_percentage > 100:
                        print(f"⚠️ Progresso > 100% detectado: {instance.progress_percentage}% - usando 100%")
                        validated_progress = 100
                    elif instance.progress_percentage < 0:
                        print(f"⚠️ Progresso negativo detectado: {instance.progress_percentage}% - usando 0%")
                        validated_progress = 0
                    else:
                        validated_progress = instance.progress_percentage
                    
                    # Usar último valor válido (não mais "maior valor")
                    current_progress = metrics.progress_percentage or 0
                    
                    # Permitir regressão se o novo valor for significativamente diferente
                    if abs(validated_progress - current_progress) > 5:  # Mudança > 5%
                        metrics.progress_percentage = validated_progress
                        print(f"📊 Progresso atualizado: {current_progress}% → {validated_progress}%")
                    elif validated_progress > current_progress:
                        # Sempre aceitar progresso positivo
                        metrics.progress_percentage = validated_progress
                        print(f"📈 Progresso incrementado: {current_progress}% → {validated_progress}%")
                
                metrics.last_updated = timezone.now()
                metrics.save()
                delattr(metrics, '_updating')
                
                print(f"✅ Métricas atualizadas para projeto {instance.project.name}:")
                print(f"   Pessoas impactadas: +{instance.people_impacted or 0} = {metrics.people_impacted}")
                print(f"   Orçamento usado: +{instance.budget_spent or 0} = {metrics.budget_used}")
                print(f"   Progresso: {metrics.progress_percentage}%")
        except Exception as e:
            print(f"❌ Erro ao atualizar métricas: {e}")
            pass

@receiver(post_save, sender=ProjectMilestone)
def update_project_metrics_on_milestone_save(sender, instance, created, **kwargs):
    """Atualiza métricas do projeto quando um milestone é modificado"""
    try:
        metrics = instance.project.metrics
        if not hasattr(metrics, '_updating'):
            metrics._updating = True
            
            # Recalcula milestones
            total_milestones = instance.project.milestones.count()
            completed_milestones = instance.project.milestones.filter(status='completed').count()
            
            metrics.total_milestones = total_milestones
            metrics.completed_milestones = completed_milestones
            metrics.last_updated = timezone.now()
            metrics.save()
            
            delattr(metrics, '_updating')
    except:
        pass

@receiver(post_save, sender=ProjectGalleryImage)
def update_project_on_image_save(sender, instance, created, **kwargs):
    """Atualiza timestamp do projeto quando uma imagem é adicionada"""
    if created:
        try:
            metrics = instance.project.metrics
            if not hasattr(metrics, '_updating'):
                metrics._updating = True
                metrics.last_updated = timezone.now()
                metrics.save()
                delattr(metrics, '_updating')
        except:
            pass

@receiver(post_save, sender=ProjectMetricsEntry)
def update_project_on_metrics_entry_save(sender, instance, created, **kwargs):
    """Atualiza métricas agregadas quando uma entrada de métrica é criada/atualizada"""
    if instance.verified:
        try:
            metrics = instance.project.metrics
            if not hasattr(metrics, '_updating'):
                metrics._updating = True
                
                # Recalcula métricas baseadas nas entradas verificadas
                entries = instance.project.metrics_entries.filter(verified=True)
                
                # Beneficiários diretos
                direct_beneficiaries_entries = entries.filter(
                    category='beneficiaries', 
                    metric_name='direct_beneficiaries'
                )
                if direct_beneficiaries_entries.exists():
                    total_direct = sum(entry.value for entry in direct_beneficiaries_entries)
                    metrics.direct_beneficiaries = int(total_direct)
                
                # Beneficiários indiretos
                indirect_beneficiaries_entries = entries.filter(
                    category='beneficiaries', 
                    metric_name='indirect_beneficiaries'
                )
                if indirect_beneficiaries_entries.exists():
                    total_indirect = sum(entry.value for entry in indirect_beneficiaries_entries)
                    metrics.indirect_beneficiaries = int(total_indirect)
                
                # Taxa de sucesso
                success_rate_entries = entries.filter(
                    category='performance',
                    metric_name='success_rate'
                )
                if success_rate_entries.exists():
                    avg_success_rate = sum(entry.value for entry in success_rate_entries) / len(success_rate_entries)
                    metrics.success_rate = round(avg_success_rate, 2)
                
                metrics.last_updated = timezone.now()
                metrics.save()
                
                delattr(metrics, '_updating')
        except:
            pass

@receiver(post_save, sender=Project)
def create_project_metrics(sender, instance, created, **kwargs):
    """Cria ProjectMetrics automaticamente quando um projeto é criado"""
    if created:
        from .models import ProjectMetrics
        ProjectMetrics.objects.get_or_create(
            project=instance,
            defaults={
                'people_impacted': instance.current_beneficiaries or 0,
                'budget_used': 0,
                'budget_total': instance.budget or 0,
                'progress_percentage': instance.progress_percentage or 0,
                'completed_milestones': 0,
                'total_milestones': 0,
                'start_date': instance.start_date,
                'end_date': instance.end_date
            }
        )
