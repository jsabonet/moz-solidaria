# apps/authentication/management/commands/setup_user_profiles.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.apps import apps

class Command(BaseCommand):
    help = 'Configura os perfis de usuário e suas permissões'

    def handle(self, *args, **options):
        self.stdout.write('Configurando perfis de usuário...')
        
        # Definir perfis e suas permissões
        profiles = {
            'super_admin': {
                'name': 'Super Admin',
                'description': 'Acesso total ao sistema, incluindo gestão de usuários e configurações',
                'permissions': [
                    # Autenticação - gestão completa de usuários
                    'auth.add_user',
                    'auth.change_user', 
                    'auth.delete_user',
                    'auth.view_user',
                    'auth.add_group',
                    'auth.change_group',
                    'auth.delete_group',
                    'auth.view_group',
                    'auth.add_permission',
                    'auth.change_permission',
                    'auth.delete_permission',
                    'auth.view_permission',
                    
                    # Configurações do sistema
                    'admin.add_logentry',
                    'admin.change_logentry',
                    'admin.delete_logentry',
                    'admin.view_logentry',
                    
                    # Sessões
                    'sessions.add_session',
                    'sessions.change_session',
                    'sessions.delete_session',
                    'sessions.view_session',
                    
                    # Content types
                    'contenttypes.add_contenttype',
                    'contenttypes.change_contenttype',
                    'contenttypes.delete_contenttype',
                    'contenttypes.view_contenttype',
                ]
            },
            
            'blog_manager': {
                'name': 'Gestor de Blog',
                'description': 'Acesso apenas ao módulo de Blog (criar, editar, publicar, excluir artigos e categorias)',
                'permissions': [
                    # Visualização básica de usuários para autoria
                    'auth.view_user',
                    
                    # Adicionar permissões específicas quando os models forem criados
                    # 'blog.add_post',
                    # 'blog.change_post',
                    # 'blog.delete_post',
                    # 'blog.view_post',
                ]
            },
            
            'project_manager': {
                'name': 'Gestor de Projetos',
                'description': 'Acesso apenas ao módulo de Projetos (criar, editar, encerrar e gerar relatórios)',
                'permissions': [
                    # Visualização básica de usuários para atribuição
                    'auth.view_user',
                    
                    # Adicionar permissões específicas quando os models forem criados
                    # 'projects.add_project',
                    # 'projects.change_project',
                    # 'projects.delete_project',
                    # 'projects.view_project',
                ]
            },
            
            'community_manager': {
                'name': 'Gestor de Comunidade',
                'description': 'Acesso apenas ao módulo de Comunidade (aprovar/rejeitar voluntários, parcerias, beneficiários e doadores)',
                'permissions': [
                    # Visualização básica de usuários
                    'auth.view_user',
                    
                    # Adicionar permissões específicas quando os models forem criados
                    # 'community.add_volunteer',
                    # 'community.change_volunteer',
                    # 'community.view_volunteer',
                ]
            },
            
            'viewer': {
                'name': 'Visualizador',
                'description': 'Acesso de leitura a todos os módulos, sem possibilidade de alteração',
                'permissions': [
                    # Apenas visualização em todos os módulos
                    'auth.view_user',
                    'auth.view_group',
                    'contenttypes.view_contenttype',
                ]
            }
        }
        
        # Criar grupos e atribuir permissões
        for profile_code, profile_data in profiles.items():
            group, created = Group.objects.get_or_create(name=profile_data['name'])
            
            if created:
                self.stdout.write(f'Criado grupo: {profile_data["name"]}')
            else:
                self.stdout.write(f'Grupo já existe: {profile_data["name"]}')
                # Limpar permissões existentes
                group.permissions.clear()
            
            # Adicionar permissões
            permissions_added = 0
            for perm_code in profile_data['permissions']:
                try:
                    app_label, codename = perm_code.split('.')
                    permission = Permission.objects.get(
                        content_type__app_label=app_label,
                        codename=codename
                    )
                    group.permissions.add(permission)
                    permissions_added += 1
                except Permission.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Permissão não encontrada: {perm_code}')
                    )
                except ValueError:
                    self.stdout.write(
                        self.style.ERROR(f'Formato de permissão inválido: {perm_code}')
                    )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Configurado {profile_data["name"]}: {permissions_added} permissões'
                )
            )
        
        self.stdout.write(self.style.SUCCESS('Configuração de perfis concluída!'))
        
        # Mostrar resumo
        self.stdout.write('\n📋 RESUMO DOS PERFIS:')
        for group in Group.objects.all():
            perm_count = group.permissions.count()
            self.stdout.write(f'  • {group.name}: {perm_count} permissões')
