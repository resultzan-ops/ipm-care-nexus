import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { AppRole, Permission, getRolePermissions, hasPermission, allPermissions, allRoles } from '@/lib/permissions';

// Helper: validasi role
const isValidAppRole = (role: string): role is AppRole => {
  return allRoles.includes(role as AppRole);
};

// Generate canAccess functions dynamically
type CanAccessFunctions = {
  [K in Permission as `canAccess${Capitalize<string & K>}`]: () => boolean;
};

export function useRolePermissions() {
  const { profile } = useAuth();

  const userRole = useMemo(() => {
    if (profile?.role && isValidAppRole(profile.role)) return profile.role;
    return null;
  }, [profile?.role]);

  const permissions = useMemo(() => {
    if (!userRole) return [];
    return getRolePermissions(userRole);
  }, [userRole]);

  const checkPermission = (permission: Permission): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  const isRole = (role: AppRole): boolean => userRole === role;
  const isSuperAdmin = (): boolean => userRole === 'super_admin';

  // Generate canAccessXXX functions dynamically
  const canAccessFunctions = useMemo(() => {
    const result: Partial<CanAccessFunctions> = {};
    allPermissions.forEach((perm) => {
      const key = `canAccess${perm.charAt(0).toUpperCase() + perm.slice(1)}` as keyof CanAccessFunctions;
      result[key] = () => checkPermission(perm);
    });
    return result as CanAccessFunctions;
  }, [userRole]);

  return {
    userRole,
    permissions,
    checkPermission,
    isRole,
    isSuperAdmin,
    ...canAccessFunctions,
  };
}
