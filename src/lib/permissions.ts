// Role-Based Access Control (RBAC) System
export type AppRole = 
  | "super_admin"
  | "admin_mitra"
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
  admin_kalibrasi: [
    "dashboard",
    "equipment",
    "maintenance",
    "inspections",
    "calibrations",
    "reports",
    "monitoring",
    "tools",
    "download",
    "settings",
    "tasks"
  ],
  admin_penyedia: [
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
  kalibrator: [
    "dashboard",
    "equipment",
    "calibrations",
    "tasks"
  ],
  teknisi: [
    "dashboard",
    "equipment",
    "maintenance",
    "inspections",
    "tasks"
  ],
  operator: [
    "dashboard",
    "equipment"
  ],
  spv: [
    "dashboard",
    "equipment",
    "maintenance",
    "inspections",
    "reports"
  ]
};

export const ROLE_DISPLAY_NAMES: Record<AppRole, string> = {
  super_admin: "Super Admin",
  admin_mitra: "Admin Mitra",
  admin_kalibrasi: "Admin Kalibrasi",
  admin_penyedia: "Admin Penyedia",
  teknisi_mitra: "Teknisi Mitra",
  admin_klien: "Admin Klien",
  operator_klien: "Operator Klien",
  kalibrator: "Kalibrator",
  teknisi: "Teknisi",
  operator: "Operator",
  spv: "SPV"
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
  "admin_kalibrasi",
  "admin_penyedia",
  "teknisi_mitra",
  "admin_klien",
  "operator_klien",
  "kalibrator",
  "teknisi",
  "operator",
  "spv"
];