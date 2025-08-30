// src/constants/permissions.ts

export const PERMISSIONS = {
  // Sistema
  SYSTEM: {
    MANAGE_SETTINGS: 'system_manage_settings',
    VIEW_LOGS: 'system_view_logs',
    BACKUP_RESTORE: 'system_backup_restore',
    MAINTENANCE_MODE: 'system_maintenance_mode',
  },

  // Usuários
  USERS: {
    CREATE: 'users_create',
    EDIT: 'users_edit',
    DELETE: 'users_delete',
    VIEW_ALL: 'users_view_all',
    CHANGE_PERMISSIONS: 'users_change_permissions',
    IMPERSONATE: 'users_impersonate',
    VIEW_BLOG_TEAM_ONLY: 'users_view_blog_team_only',
    VIEW_PROJECT_TEAM_ONLY: 'users_view_project_team_only',
    VIEW_COMMUNITY_TEAM_ONLY: 'users_view_community_team_only',
    VIEW_BASIC_INFO_ONLY: 'users_view_basic_info_only',
  },

  // Blog
  BLOG: {
    CREATE_POST: 'blog_create_post',
    EDIT_OWN_POST: 'blog_edit_own_post',
    EDIT_OTHERS_POST: 'blog_edit_others_post',
    EDIT_ANY_POST: 'blog_edit_any_post',
    DELETE_OWN_POST: 'blog_delete_own_post',
    DELETE_OTHERS_POST: 'blog_delete_others_post',
    DELETE_ANY_POST: 'blog_delete_any_post',
    PUBLISH_POST: 'blog_publish_post',
    UNPUBLISH_POST: 'blog_unpublish_post',
    SCHEDULE_POST: 'blog_schedule_post',
    CREATE_CATEGORY: 'blog_create_category',
    EDIT_CATEGORY: 'blog_edit_category',
    DELETE_CATEGORY: 'blog_delete_category',
    MANAGE_TAGS: 'blog_manage_tags',
    UPLOAD_MEDIA: 'blog_upload_media',
    MANAGE_SEO: 'blog_manage_seo',
    VIEW_ANALYTICS: 'blog_view_analytics',
    MODERATE_COMMENTS: 'blog_moderate_comments',
    APPROVE_COMMENTS: 'blog_approve_comments',
    DELETE_COMMENTS: 'blog_delete_comments',
    VIEW_POSTS: 'blog_view_posts',
    VIEW_CATEGORIES: 'blog_view_categories',
    VIEW_COMMENTS: 'blog_view_comments',
    VIEW_BASIC_ANALYTICS: 'blog_view_basic_analytics',
    VIEW_ALL_POSTS: 'blog_view_all_posts',
    VIEW_OWN_POSTS: 'blog_view_own_posts',
  },

  // Projetos
  PROJECTS: {
    CREATE: 'projects_create',
    EDIT_ANY: 'projects_edit_any',
    EDIT_OWN: 'projects_edit_own',
    DELETE_ANY: 'projects_delete_any',
    VIEW_ALL: 'projects_view_all',
    VIEW_ASSIGNED: 'projects_view_assigned',
    APPROVE: 'projects_approve',
    APPROVE_OWN: 'projects_approve_own',
    CLOSE_PROJECT: 'projects_close_project',
    ARCHIVE: 'projects_archive',
    MANAGE_BUDGET: 'projects_manage_budget',
    ALLOCATE_RESOURCES: 'projects_allocate_resources',
    TRACK_EXPENSES: 'projects_track_expenses',
    APPROVE_EXPENSES: 'projects_approve_expenses',
    ASSIGN_VOLUNTEERS: 'projects_assign_volunteers',
    MANAGE_TEAM: 'projects_manage_team',
    VIEW_VOLUNTEER_PROFILES: 'projects_view_volunteer_profiles',
    LINK_BENEFICIARIES: 'projects_link_beneficiaries',
    VIEW_BENEFICIARIES: 'projects_view_beneficiaries',
    GENERATE_REPORTS: 'projects_generate_reports',
    VIEW_ANALYTICS: 'projects_view_analytics',
    EXPORT_DATA: 'projects_export_data',
    MANAGE_PARTNERSHIPS: 'projects_manage_partnerships',
    VIEW_BASIC_REPORTS: 'projects_view_basic_reports',
    VIEW_TEAM_ASSIGNMENTS: 'projects_view_team_assignments',
    VIEW_BASIC_BUDGET: 'projects_view_basic_budget',
  },

  // Comunidade
  COMMUNITY: {
    VIEW_VOLUNTEER_APPLICATIONS: 'community_view_volunteer_applications',
    APPROVE_VOLUNTEERS: 'community_approve_volunteers',
    REJECT_VOLUNTEERS: 'community_reject_volunteers',
    EDIT_VOLUNTEER_PROFILES: 'community_edit_volunteer_profiles',
    DEACTIVATE_VOLUNTEERS: 'community_deactivate_volunteers',
    ASSIGN_VOLUNTEER_SKILLS: 'community_assign_volunteer_skills',
    MANAGE_VOLUNTEER_TRAINING: 'community_manage_volunteer_training',
    REGISTER_BENEFICIARIES: 'community_register_beneficiaries',
    EDIT_BENEFICIARY_PROFILES: 'community_edit_beneficiary_profiles',
    APPROVE_BENEFICIARIES: 'community_approve_beneficiaries',
    VIEW_BENEFICIARY_DATA: 'community_view_beneficiary_data',
    GENERATE_IMPACT_REPORTS: 'community_generate_impact_reports',
    CREATE_PARTNERSHIPS: 'community_create_partnerships',
    EDIT_PARTNERSHIPS: 'community_edit_partnerships',
    APPROVE_PARTNERSHIPS: 'community_approve_partnerships',
    MANAGE_PARTNERSHIP_AGREEMENTS: 'community_manage_partnership_agreements',
    VIEW_DONOR_PROFILES: 'community_view_donor_profiles',
    MANAGE_DONOR_RELATIONSHIPS: 'community_manage_donor_relationships',
    PROCESS_DONATIONS: 'community_process_donations',
    GENERATE_DONOR_REPORTS: 'community_generate_donor_reports',
    SEND_DONOR_COMMUNICATIONS: 'community_send_donor_communications',
    SEND_NEWSLETTERS: 'community_send_newsletters',
    MANAGE_COMMUNICATIONS: 'community_manage_communications',
    GENERATE_COMMUNITY_REPORTS: 'community_generate_community_reports',
    EXPORT_COMMUNITY_DATA: 'community_export_community_data',
    VIEW_VOLUNTEER_LIST: 'community_view_volunteer_list',
    VIEW_BENEFICIARY_LIST: 'community_view_beneficiary_list',
    VIEW_PARTNERSHIP_LIST: 'community_view_partnership_list',
    VIEW_DONOR_LIST: 'community_view_donor_list',
    VIEW_BASIC_COMMUNITY_DATA: 'community_view_basic_community_data',
    VIEW_SENSITIVE_COMMUNITY_DATA: 'community_view_sensitive_community_data',
  },

  // Relatórios
  REPORTS: {
    GENERATE_ALL: 'reports_generate_all',
    EXPORT_SENSITIVE: 'reports_export_sensitive',
    VIEW_FINANCIAL: 'reports_view_financial',
    VIEW_SUMMARY: 'reports_view_summary_reports',
    VIEW_PUBLIC_ANALYTICS: 'reports_view_public_analytics',
  },
} as const;

export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  BLOG_MANAGER: 'Gestor de Blog',
  PROJECT_MANAGER: 'Gestor de Projetos',
  COMMUNITY_MANAGER: 'Gestor de Comunidade',
  VIEWER: 'Visualizador',
} as const;

// Utilitários para verificação de permissões
export const checkPermission = (userPermissions: string[], permission: string): boolean => {
  return userPermissions.includes(permission);
};

export const checkAnyPermission = (userPermissions: string[], permissions: string[]): boolean => {
  return permissions.some(permission => userPermissions.includes(permission));
};

export const checkAllPermissions = (userPermissions: string[], permissions: string[]): boolean => {
  return permissions.every(permission => userPermissions.includes(permission));
};

export const checkRole = (userGroups: string[], role: string): boolean => {
  return userGroups.includes(role);
};

// Grupos de permissões comuns
export const PERMISSION_GROUPS = {
  // Permissões de administração geral
  ADMIN: [
    PERMISSIONS.SYSTEM.MANAGE_SETTINGS,
    PERMISSIONS.SYSTEM.VIEW_LOGS,
    PERMISSIONS.USERS.VIEW_ALL,
    PERMISSIONS.USERS.CREATE,
    PERMISSIONS.USERS.EDIT,
  ],

  // Permissões básicas de blog
  BLOG_BASIC: [
    PERMISSIONS.BLOG.VIEW_POSTS,
    PERMISSIONS.BLOG.VIEW_CATEGORIES,
    PERMISSIONS.BLOG.VIEW_COMMENTS,
  ],

  // Permissões de gestão de blog
  BLOG_MANAGEMENT: [
    PERMISSIONS.BLOG.CREATE_POST,
    PERMISSIONS.BLOG.EDIT_OWN_POST,
    PERMISSIONS.BLOG.PUBLISH_POST,
    PERMISSIONS.BLOG.MANAGE_TAGS,
    PERMISSIONS.BLOG.MODERATE_COMMENTS,
  ],

  // Permissões básicas de projetos
  PROJECTS_BASIC: [
    PERMISSIONS.PROJECTS.VIEW_ALL,
    PERMISSIONS.PROJECTS.VIEW_BASIC_REPORTS,
    PERMISSIONS.PROJECTS.VIEW_TEAM_ASSIGNMENTS,
  ],

  // Permissões de gestão de projetos
  PROJECTS_MANAGEMENT: [
    PERMISSIONS.PROJECTS.CREATE,
    PERMISSIONS.PROJECTS.EDIT_OWN,
    PERMISSIONS.PROJECTS.APPROVE_OWN,
    PERMISSIONS.PROJECTS.MANAGE_BUDGET,
    PERMISSIONS.PROJECTS.ASSIGN_VOLUNTEERS,
  ],

  // Permissões básicas de comunidade
  COMMUNITY_BASIC: [
    PERMISSIONS.COMMUNITY.VIEW_VOLUNTEER_LIST,
    PERMISSIONS.COMMUNITY.VIEW_BENEFICIARY_LIST,
    PERMISSIONS.COMMUNITY.VIEW_BASIC_COMMUNITY_DATA,
  ],

  // Permissões de gestão de comunidade
  COMMUNITY_MANAGEMENT: [
    PERMISSIONS.COMMUNITY.APPROVE_VOLUNTEERS,
    PERMISSIONS.COMMUNITY.REGISTER_BENEFICIARIES,
    PERMISSIONS.COMMUNITY.CREATE_PARTNERSHIPS,
    PERMISSIONS.COMMUNITY.MANAGE_DONOR_RELATIONSHIPS,
  ],

  // Permissões básicas de relatórios
  REPORTS_BASIC: [
    PERMISSIONS.REPORTS.VIEW_SUMMARY,
    PERMISSIONS.REPORTS.VIEW_PUBLIC_ANALYTICS,
  ],

  // Permissões avançadas de relatórios
  REPORTS_ADVANCED: [
    PERMISSIONS.REPORTS.GENERATE_ALL,
    PERMISSIONS.REPORTS.VIEW_FINANCIAL,
    PERMISSIONS.REPORTS.EXPORT_SENSITIVE,
  ],
} as const;
