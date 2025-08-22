// Role-Based Access Control (RBAC) System
export type AppRole = 
  | "super_admin"
  | "admin_kalibrasi" 
  | "admin_penyedia"
  | "admin_klien"
  | "operator_klien"
  | "teknisi_mitra"
  | "kalibrator"
  | "teknisi"
  | "operator"
  | "spv";

export type Permission = 
  | "dashboard"
  | "equipment"
  | "maintenance" 
  | "inspections"
  | "calibrations"
  | "reports"
  | "global_reports"
  | "monitoring"
  | "tools"
  | "download"
  | "company_management"
  | "user_management"
  | "settings"
  | "tasks";

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  super_admin: [
    "dashboard",
    "equipment", 
    "maintenance",
    "inspections",
    "calibrations",
    "reports",
    "global_reports",
    "monitoring",
    "tools",
    "download",
    "company_management",
    "user_management",
    "settings",
    "tasks"
  ],
  admin_mitra: [
    "dashboard",
    "equipment",
    "maintenance",
    "inspections",
    "calibrations",
    "reports",
    "monitoring",
    "tools",
    "download",
    "user_management",
    "settings", 
    "tasks"
  ],
  teknisi_mitra: [
    "dashboard",
    "equipment",
    "maintenance",
    "inspections",
    "calibrations",
    "tasks"
  ],
  admin_klien: [
    "dashboard",
    "equipment",
    "maintenance",
    "inspections", 
    "calibrations",
    "reports",
    "user_management",
    "settings"
  ],
  operator_klien: [
    "dashboard",
    "equipment"
  ],
};

export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin_mitra: "Admin Mitra",
  teknisi_mitra: "Teknisi Mitra",
  admin_klien: "Admin Klien",
  operator_klien: "Operator Klien",
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getRolePermissions(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function canAccessCompanyManagement(role: AppRole): boolean {
  return hasPermission(role, "company_management");
}

export function canAccessUserManagement(role: AppRole): boolean {
  return hasPermission(role, "user_management");
}

// Export all permissions array for dynamic access
export const allPermissions: Permission[] = [
  "dashboard",
  "equipment",
  "maintenance",
  "inspections", 
  "calibrations",
  "reports",
  "global_reports",
  "monitoring",
  "tools",
  "download",
  "company_management",
  "user_management",
  "settings",
  "tasks"
];

// Export all roles array for validation
export const allRoles: AppRole[] = [
  "super_admin",
  "admin_mitra",
  "teknisi_mitra",
  "admin_klien",
  "operator_klien",
];