import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { AppRole, hasPermission, getRolePermissions, Permission } from '@/lib/permissions';

export function useRolePermissions() {
  const { profile } = useAuth();
  
  const userRole = profile?.role as AppRole;
  const permissions = useMemo(() => {
    if (!userRole) return [];
    return getRolePermissions(userRole);
  }, [userRole]);

  const checkPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  const isRole = (role: AppRole): boolean => {
    return userRole === role;
  };

  const isSuperAdmin = (): boolean => {
    return userRole === 'super_admin';
  };

  const canAccessCompanyManagement = (): boolean => {
    return checkPermission('company_management');
  };

  const canAccessUserManagement = (): boolean => {
    return checkPermission('user_management');
  };

  const canAccessGlobalReports = (): boolean => {
    return checkPermission('global_reports');
  };

  return {
    userRole,
    permissions,
    checkPermission,
    isRole,
    isSuperAdmin,
    canAccessCompanyManagement,
    canAccessUserManagement,
    canAccessGlobalReports
  };
}