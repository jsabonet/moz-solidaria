// src/hooks/use-permissions.tsx
import { useAuth } from './use-auth';

export interface UserPermissions {
  // Níveis básicos
  isSuperAdmin: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
  userType: string | null;
  
  // Permissões funcionais
  canManageUsers: boolean;
  canManageProjects: boolean;
  canManageFinances: boolean;
  canManageContent: boolean;
  canManageVolunteers: boolean;
  canManageBeneficiaries: boolean;
  canManagePartners: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
  canViewAdvancedStats: boolean;
  
  // Permissões regionais
  canManageRegionalData: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { user, isAuthenticated, isStaff } = useAuth();
  
  const userType = user?.profile?.user_type || null;
  const isSuperAdmin = user?.is_superuser || false;
  
  // Calcular permissões baseadas no tipo de usuário e níveis de acesso
  const permissions: UserPermissions = {
    // Níveis básicos
    isSuperAdmin,
    isStaff,
    isAuthenticated,
    userType,
    
    // Permissões funcionais
    canManageUsers: isSuperAdmin,
    
    canManageProjects: 
      isSuperAdmin || 
      isStaff || 
      userType === 'project_coordinator' || 
      userType === 'admin_regional',
    
    canManageFinances: 
      isSuperAdmin || 
      userType === 'financial_manager',
    
    canManageContent: 
      isSuperAdmin || 
      userType === 'content_moderator' || 
      userType === 'admin_regional',
    
    canManageVolunteers: 
      isSuperAdmin || 
      isStaff || 
      userType === 'admin_regional' || 
      userType === 'project_coordinator',
    
    canManageBeneficiaries: 
      isSuperAdmin || 
      isStaff || 
      userType === 'admin_regional' || 
      userType === 'project_coordinator',
    
    canManagePartners: 
      isSuperAdmin || 
      userType === 'admin_regional',
    
    canViewReports: 
      isSuperAdmin || 
      isStaff,
    
    canExportData: 
      isSuperAdmin || 
      isStaff,
    
    canManageSettings: 
      isSuperAdmin || 
      userType === 'admin_regional',
    
    canViewAdvancedStats: 
      isSuperAdmin || 
      isStaff,
    
    // Permissões regionais
    canManageRegionalData: 
      isSuperAdmin || 
      userType === 'admin_regional'
  };
  
  return permissions;
};

// Hook para verificar permissão específica
export const useHasPermission = (permission: keyof UserPermissions): boolean => {
  const permissions = usePermissions();
  return permissions[permission] as boolean;
};

// Hook para verificar múltiplas permissões
export const useHasAnyPermission = (permissionList: (keyof UserPermissions)[]): boolean => {
  const permissions = usePermissions();
  return permissionList.some(permission => permissions[permission] as boolean);
};

// Hook para verificar todas as permissões
export const useHasAllPermissions = (permissionList: (keyof UserPermissions)[]): boolean => {
  const permissions = usePermissions();
  return permissionList.every(permission => permissions[permission] as boolean);
};

export default usePermissions;
