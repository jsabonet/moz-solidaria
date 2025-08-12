#!/usr/bin/env python3
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'moz_solidaria_api.settings')
django.setup()

from core.models import Project

print('📊 ANÁLISE DOS PROJETOS:')
print(f'Total de projetos: {Project.objects.count()}')

print('\nStatus dos projetos:')
for status in Project.objects.values_list('status', flat=True).distinct():
    count = Project.objects.filter(status=status).count()
    print(f'  {status}: {count}')

print('\nCampos dos projetos:')
if Project.objects.count() > 0:
    first_project = Project.objects.first()
    project_fields = [f.name for f in first_project._meta.fields]
    print(f'  Campos: {project_fields}')

print('\nDetalhes dos projetos:')
for project in Project.objects.all():
    created_date = project.created_at.date() if project.created_at else "N/A"
    print(f'  {project.name}: status={project.status}, criado={created_date}')
    
    # Verificar se tem end_date
    if hasattr(project, 'end_date'):
        print(f'    end_date: {project.end_date}')
    
    # Verificar outros campos de data
    for field in ['deadline', 'target_date', 'completion_date']:
        if hasattr(project, field):
            value = getattr(project, field, None)
            if value:
                print(f'    {field}: {value}')

# Verificar se há projetos finalizados
print('\nProjetos finalizados (completed ou cancelled):')
finished_projects = Project.objects.filter(status__in=['completed', 'cancelled'])
print(f'Total: {finished_projects.count()}')

# Verificar se há projetos completos
completed_projects = Project.objects.filter(status='completed')
print(f'Completos: {completed_projects.count()}')

# Calcular taxa de sucesso
if finished_projects.count() > 0:
    success_rate = (completed_projects.count() / finished_projects.count()) * 100
    print(f'Taxa de sucesso atual: {success_rate:.1f}%')
else:
    print('Taxa de sucesso: 0% (nenhum projeto finalizado)')
