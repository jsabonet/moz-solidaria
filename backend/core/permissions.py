# backend/core/permissions.py
from django.contrib.auth.models import Permission, Group
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import get_user_model

User = get_user_model()

# Definição de todas as permissões do sistema
SYSTEM_PERMISSIONS = {
    # Permissões do Sistema
    'system': [
        ('system.manage_settings', 'Can manage system settings'),
        ('system.view_logs', 'Can view system logs'),
        ('system.backup_restore', 'Can backup and restore system'),
        ('system.maintenance_mode', 'Can enable maintenance mode'),
    ],
    
    # Permissões de Usuários
    'users': [
        ('users.create', 'Can create users'),
        ('users.edit', 'Can edit users'),
        ('users.delete', 'Can delete users'),
        ('users.view_all', 'Can view all users'),
        ('users.change_permissions', 'Can change user permissions'),
        ('users.impersonate', 'Can impersonate users'),
        ('users.view_blog_team_only', 'Can view blog team only'),
        ('users.view_project_team_only', 'Can view project team only'),
        ('users.view_community_team_only', 'Can view community team only'),
        ('users.view_basic_info_only', 'Can view basic user info only'),
    ],
    
    # Permissões do Blog
    'blog': [
        ('blog.create_post', 'Can create blog posts'),
        ('blog.edit_own_post', 'Can edit own blog posts'),
        ('blog.edit_others_post', 'Can edit others blog posts'),
        ('blog.edit_any_post', 'Can edit any blog post'),
        ('blog.delete_own_post', 'Can delete own blog posts'),
        ('blog.delete_others_post', 'Can delete others blog posts'),
        ('blog.delete_any_post', 'Can delete any blog post'),
        ('blog.publish_post', 'Can publish blog posts'),
        ('blog.unpublish_post', 'Can unpublish blog posts'),
        ('blog.schedule_post', 'Can schedule blog posts'),
        ('blog.create_category', 'Can create blog categories'),
        ('blog.edit_category', 'Can edit blog categories'),
        ('blog.delete_category', 'Can delete blog categories'),
        ('blog.manage_tags', 'Can manage blog tags'),
        ('blog.upload_media', 'Can upload blog media'),
        ('blog.manage_seo', 'Can manage blog SEO'),
        ('blog.view_analytics', 'Can view blog analytics'),
        ('blog.moderate_comments', 'Can moderate blog comments'),
        ('blog.approve_comments', 'Can approve blog comments'),
        ('blog.delete_comments', 'Can delete blog comments'),
        ('blog.view_posts', 'Can view blog posts'),
        ('blog.view_categories', 'Can view blog categories'),
        ('blog.view_comments', 'Can view blog comments'),
        ('blog.view_basic_analytics', 'Can view basic blog analytics'),
        ('blog.view_all_posts', 'Can view all blog posts'),
        ('blog.view_own_posts', 'Can view own blog posts'),
    ],
    
    # Permissões de Projetos
    'projects': [
        ('projects.create', 'Can create projects'),
        ('projects.edit_any', 'Can edit any project'),
        ('projects.edit_own', 'Can edit own projects'),
        ('projects.delete_any', 'Can delete any project'),
        ('projects.view_all', 'Can view all projects'),
        ('projects.view_assigned', 'Can view assigned projects'),
        ('projects.approve', 'Can approve projects'),
        ('projects.approve_own', 'Can approve own projects'),
        ('projects.close_project', 'Can close projects'),
        ('projects.archive_project', 'Can archive projects'),
        ('projects.manage_budget', 'Can manage project budget'),
        ('projects.allocate_resources', 'Can allocate project resources'),
        ('projects.track_expenses', 'Can track project expenses'),
        ('projects.approve_expenses', 'Can approve project expenses'),
        ('projects.assign_volunteers', 'Can assign volunteers to projects'),
        ('projects.manage_team', 'Can manage project team'),
        ('projects.view_volunteer_profiles', 'Can view volunteer profiles'),
        ('projects.link_beneficiaries', 'Can link beneficiaries to projects'),
        ('projects.view_project_beneficiaries', 'Can view project beneficiaries'),
        ('projects.generate_reports', 'Can generate project reports'),
        ('projects.view_analytics', 'Can view project analytics'),
        ('projects.export_project_data', 'Can export project data'),
        ('projects.manage_project_partnerships', 'Can manage project partnerships'),
        ('projects.view_basic_reports', 'Can view basic project reports'),
        ('projects.view_team_assignments', 'Can view team assignments'),
        ('projects.view_basic_budget', 'Can view basic budget info'),
    ],
    
    # Permissões da Comunidade
    'community': [
        ('community.view_volunteer_applications', 'Can view volunteer applications'),
        ('community.approve_volunteers', 'Can approve volunteers'),
        ('community.reject_volunteers', 'Can reject volunteers'),
        ('community.edit_volunteer_profiles', 'Can edit volunteer profiles'),
        ('community.deactivate_volunteers', 'Can deactivate volunteers'),
        ('community.assign_volunteer_skills', 'Can assign volunteer skills'),
        ('community.manage_volunteer_training', 'Can manage volunteer training'),
        ('community.register_beneficiaries', 'Can register beneficiaries'),
        ('community.edit_beneficiary_profiles', 'Can edit beneficiary profiles'),
        ('community.approve_beneficiaries', 'Can approve beneficiaries'),
        ('community.view_beneficiary_data', 'Can view beneficiary data'),
        ('community.generate_impact_reports', 'Can generate impact reports'),
        ('community.create_partnerships', 'Can create partnerships'),
        ('community.edit_partnerships', 'Can edit partnerships'),
        ('community.approve_partnerships', 'Can approve partnerships'),
        ('community.manage_partnership_agreements', 'Can manage partnership agreements'),
        ('community.view_donor_profiles', 'Can view donor profiles'),
        ('community.manage_donor_relationships', 'Can manage donor relationships'),
        ('community.process_donations', 'Can process donations'),
        ('community.generate_donor_reports', 'Can generate donor reports'),
        ('community.send_donor_communications', 'Can send donor communications'),
        ('community.send_newsletters', 'Can send newsletters'),
        ('community.manage_communications', 'Can manage communications'),
        ('community.generate_community_reports', 'Can generate community reports'),
        ('community.export_community_data', 'Can export community data'),
        ('community.view_volunteer_list', 'Can view volunteer list'),
        ('community.view_beneficiary_list', 'Can view beneficiary list'),
        ('community.view_partnership_list', 'Can view partnership list'),
        ('community.view_donor_list', 'Can view donor list'),
        ('community.view_basic_community_data', 'Can view basic community data'),
        ('community.view_sensitive_data', 'Can view sensitive community data'),
    ],
    
    # Permissões de Relatórios
    'reports': [
        ('reports.generate_all', 'Can generate all reports'),
        ('reports.export_sensitive', 'Can export sensitive data'),
        ('reports.view_financial', 'Can view financial reports'),
        ('reports.view_summary_reports', 'Can view summary reports'),
        ('reports.view_public_analytics', 'Can view public analytics'),
    ],
}

# Definição dos grupos e suas permissões
GROUPS_PERMISSIONS = {
    'Super Admin': [
        # Sistema
        'system.manage_settings', 'system.view_logs', 'system.backup_restore', 'system.maintenance_mode',
        # Usuários
        'users.create', 'users.edit', 'users.delete', 'users.view_all', 'users.change_permissions', 'users.impersonate',
        # Blog
        'blog.create_post', 'blog.edit_any_post', 'blog.delete_any_post', 'blog.publish_post', 
        'blog.manage_categories', 'blog.moderate_comments', 'blog.view_analytics',
        # Projetos
        'projects.create', 'projects.edit_any', 'projects.delete_any', 'projects.approve', 
        'projects.close_project', 'projects.generate_reports', 'projects.manage_budget', 'projects.assign_team',
        # Comunidade
        'community.approve_volunteers', 'community.reject_volunteers', 'community.manage_partnerships',
        'community.approve_beneficiaries', 'community.manage_donor_relationships', 'community.view_sensitive_data',
        'community.export_community_data',
        # Relatórios
        'reports.generate_all', 'reports.export_sensitive', 'reports.view_financial',
    ],
    
    'Gestor de Blog': [
        'blog.create_post', 'blog.edit_own_post', 'blog.edit_others_post', 'blog.delete_own_post',
        'blog.delete_others_post', 'blog.publish_post', 'blog.unpublish_post', 'blog.schedule_post',
        'blog.create_category', 'blog.edit_category', 'blog.delete_category', 'blog.manage_tags',
        'blog.upload_media', 'blog.manage_seo', 'blog.view_analytics', 'blog.moderate_comments',
        'blog.approve_comments', 'blog.delete_comments', 'users.view_blog_team_only',
    ],
    
    'Gestor de Projetos': [
        'projects.create', 'projects.edit_any', 'projects.view_all', 'projects.approve_own',
        'projects.close_project', 'projects.archive_project', 'projects.manage_budget',
        'projects.allocate_resources', 'projects.track_expenses', 'projects.approve_expenses',
        'projects.assign_volunteers', 'projects.manage_team', 'projects.view_volunteer_profiles',
        'projects.link_beneficiaries', 'projects.view_project_beneficiaries', 'projects.generate_reports',
        'projects.view_analytics', 'projects.export_project_data', 'projects.manage_project_partnerships',
        'users.view_project_team_only',
    ],
    
    'Gestor de Comunidade': [
        'community.view_volunteer_applications', 'community.approve_volunteers', 'community.reject_volunteers',
        'community.edit_volunteer_profiles', 'community.deactivate_volunteers', 'community.assign_volunteer_skills',
        'community.manage_volunteer_training', 'community.register_beneficiaries', 'community.edit_beneficiary_profiles',
        'community.approve_beneficiaries', 'community.view_beneficiary_data', 'community.generate_impact_reports',
        'community.create_partnerships', 'community.edit_partnerships', 'community.approve_partnerships',
        'community.manage_partnership_agreements', 'community.view_donor_profiles', 'community.manage_donor_relationships',
        'community.process_donations', 'community.generate_donor_reports', 'community.send_donor_communications',
        'community.send_newsletters', 'community.manage_communications', 'community.generate_community_reports',
        'community.export_community_data', 'users.view_community_team_only',
    ],
    
    'Visualizador': [
        'blog.view_posts', 'blog.view_categories', 'blog.view_comments', 'blog.view_basic_analytics',
        'projects.view_all', 'projects.view_basic_reports', 'projects.view_team_assignments', 'projects.view_basic_budget',
        'community.view_volunteer_list', 'community.view_beneficiary_list', 'community.view_partnership_list',
        'community.view_donor_list', 'community.view_basic_community_data', 'reports.view_summary_reports',
        'reports.view_public_analytics', 'users.view_basic_info_only',
    ],
}

def create_custom_permissions():
    """Cria todas as permissões customizadas do sistema"""
    content_type = ContentType.objects.get_for_model(User)
    
    for module, permissions in SYSTEM_PERMISSIONS.items():
        for codename, name in permissions:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                defaults={
                    'name': name,
                    'content_type': content_type,
                }
            )
            if created:
                print(f'Permissão criada: {codename}')

def create_groups_and_assign_permissions():
    """Cria os grupos e atribui as permissões"""
    for group_name, permission_codenames in GROUPS_PERMISSIONS.items():
        group, created = Group.objects.get_or_create(name=group_name)
        
        if created:
            print(f'Grupo criado: {group_name}')
        
        # Limpar permissões existentes
        group.permissions.clear()
        
        # Adicionar novas permissões
        for codename in permission_codenames:
            try:
                permission = Permission.objects.get(codename=codename)
                group.permissions.add(permission)
            except Permission.DoesNotExist:
                print(f'Permissão não encontrada: {codename}')
        
        print(f'Permissões atribuídas ao grupo {group_name}: {len(permission_codenames)}')

def assign_user_to_group(user, group_name):
    """Atribui um usuário a um grupo específico"""
    try:
        group = Group.objects.get(name=group_name)
        user.groups.add(group)
        print(f'Usuário {user.username} adicionado ao grupo {group_name}')
        return True
    except Group.DoesNotExist:
        print(f'Grupo {group_name} não encontrado')
        return False
