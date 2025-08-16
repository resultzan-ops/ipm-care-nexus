import {
  Activity,
  Building,
  Calendar,
  ClipboardCheck,
  Gauge,
  Settings,
  Users,
  Wrench,
  FileText,
  BarChart3,
  Monitor,
  Cog,
  Download,
  CheckSquare,
  Clock,
  UserCheck,
  Building2,
  TrendingUp,
  Shield
} from "lucide-react";
import { Permission } from "./permissions";

export interface MenuItem {
  icon: any;
  label: string;
  href: string;
  permission: Permission;
  submenu?: MenuItem[];
}

// Global menu structure - NEVER changes based on role
export const MENU_STRUCTURE: MenuItem[] = [
  {
    icon: Gauge,
    label: "Dashboard",
    href: "/",
    permission: "dashboard",
  },
  {
    icon: Activity,
    label: "Equipment",
    href: "/equipment",
    permission: "equipment",
  },
  {
    icon: Calendar,
    label: "Maintenance",
    href: "/maintenance",
    permission: "maintenance",
  },
  {
    icon: ClipboardCheck,
    label: "Inspections",
    href: "/inspections",
    permission: "inspections",
  },
  {
    icon: Wrench,
    label: "Calibrations",
    href: "#",
    permission: "calibrations",
    submenu: [
      {
        icon: FileText,
        label: "Permintaan Kalibrasi",
        href: "/calibrations/requests",
        permission: "calibrations",
      },
      {
        icon: Clock,
        label: "Proses Kalibrasi",
        href: "/calibrations/process",
        permission: "calibrations",
      },
      {
        icon: TrendingUp,
        label: "History Kalibrasi",
        href: "/calibrations/history",
        permission: "calibrations",
      }
    ]
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: "/reports",
    permission: "reports",
  },
  {
    icon: Monitor,
    label: "Monitoring",
    href: "/monitoring",
    permission: "monitoring",
  },
  {
    icon: Cog,
    label: "Tools",
    href: "/tools",
    permission: "tools",
  },
  {
    icon: Download,
    label: "Download",
    href: "/download",
    permission: "download",
  },
  {
    icon: CheckSquare,
    label: "Tasks / Jadwal Kalibrasi",
    href: "/tasks",
    permission: "tasks",
  },
  {
    icon: Building,
    label: "Perusahaan & User",
    href: "#",
    permission: "company_management",
    submenu: [
      {
        icon: Building2,
        label: "Companies",
        href: "/companies",
        permission: "company_management",
      },
      {
        icon: Users,
        label: "Users",
        href: "/users",
        permission: "user_management",
      },
      {
        icon: UserCheck,
        label: "User Management",
        href: "/user-management",
        permission: "user_management",
      },
      {
        icon: Shield,
        label: "Company User Management",
        href: "/company-user-management",
        permission: "user_management",
      },
      {
        icon: FileText,
        label: "Global Reports",
        href: "/global-reports",
        permission: "user_management",
      }
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    permission: "settings",
  },
];

// Helper function to check if menu item should be visible
export const isMenuItemVisible = (
  item: MenuItem,
  userPermissions: Permission[]
): boolean => {
  // Check if user has direct permission for this menu
  const hasDirectPermission = userPermissions.includes(item.permission);
  
  // If has submenu, check if any submenu item is accessible
  if (item.submenu && item.submenu.length > 0) {
    const hasAccessibleSubmenu = item.submenu.some(subItem => 
      userPermissions.includes(subItem.permission)
    );
    return hasDirectPermission || hasAccessibleSubmenu;
  }
  
  return hasDirectPermission;
};

// Helper function to get visible submenu items
export const getVisibleSubmenuItems = (
  submenu: MenuItem[],
  userPermissions: Permission[]
): MenuItem[] => {
  return submenu.filter(subItem => 
    userPermissions.includes(subItem.permission)
  );
};