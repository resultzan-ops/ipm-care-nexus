// Role-Based Access Control (RBAC) System
export type AppRole = 
  | "super_admin"
  | "admin_kalibrasi" 
  | "admin_penyedia"
  | "admin_klien"
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
    "settings"
  ],
  admin_kalibrasi: [
    "dashboard",
    "calibrations",
    "equipment",
    "user_management",
    "settings"
  ],
  admin_penyedia: [
    "dashboard",
    "equipment",
    "user_management", 
    "settings"
  ],
  admin_klien: [
    "dashboard",
    "equipment",
    "maintenance",
    "inspections", 
    "calibrations",
    "user_management",
    "settings"
  ],
  kalibrator: [
    "dashboard",
    "calibrations",
    "tasks"
  ],
  teknisi: [
    "dashboard",
    "maintenance",
    "inspections",
    "equipment"
  ],
  operator: [
    "dashboard",
    "equipment"
  ],
  spv: [
    "dashboard",
    "monitoring",
    "reports"
  ],
};

export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin_kalibrasi: "Admin Kalibrasi", 
  admin_penyedia: "Admin Penyedia",
  admin_klien: "Admin Klien",
  kalibrator: "Kalibrator",
  teknisi: "Teknisi",
  operator: "Operator",
  spv: "SPV (Supervisor)",
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