// src/components/PermissionGate.tsx
import React, { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface PermissionGateProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  role?: string;
  fallback?: ReactNode;
  requireAll?: boolean; // Se true, requer todas as permissões; se false, requer apenas uma
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  permission,
  permissions,
  role,
  fallback = null,
  requireAll = false,
}) => {
  const { hasPermission, hasAnyPermission, hasRole, user } = useAuth();

  // Se não estiver logado, não mostrar nada
  if (!user) {
    return <>{fallback}</>;
  }

  // Verificar permissão específica
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Verificar lista de permissões
  if (permissions && permissions.length > 0) {
    if (requireAll) {
      // Requer todas as permissões
      const hasAllPermissions = permissions.every(perm => hasPermission(perm));
      if (!hasAllPermissions) {
        return <>{fallback}</>;
      }
    } else {
      // Requer pelo menos uma permissão
      if (!hasAnyPermission(permissions)) {
        return <>{fallback}</>;
      }
    }
  }

  // Verificar papel/grupo
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGate;
