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

export interface MenuItem {
  icon: any;
  label: string;
  href: string;
  submenu?: MenuItem[];
}

// Super Admin Menu Structure - FIXED and CONSISTENT
export const SUPER_ADMIN_MENU_STRUCTURE: MenuItem[] = [
  {
    icon: Gauge,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Activity,
    label: "Equipment",
    href: "/equipment",
  },
  {
    icon: Calendar,
    label: "Maintenance",
    href: "/maintenance",
  },
  {
    icon: ClipboardCheck,
    label: "Inspections",
    href: "/inspections",
  },
  {
    icon: Wrench,
    label: "Calibrations",
    href: "#",
    submenu: [
      {
        icon: FileText,
        label: "Permintaan Kalibrasi",
        href: "/calibrations/requests",
      },
      {
        icon: Clock,
        label: "Proses Kalibrasi",
        href: "/calibrations/process",
      },
      {
        icon: TrendingUp,
        label: "History Kalibrasi",
        href: "/calibrations/history",
      }
    ]
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: "/reports",
  },
  {
    icon: Monitor,
    label: "Monitoring",
    href: "/monitoring",
  },
  {
    icon: Cog,
    label: "Tools",
    href: "/tools",
  },
  {
    icon: Download,
    label: "Download",
    href: "/download",
  },
  {
    icon: CheckSquare,
    label: "Tasks / Jadwal Kalibrasi",
    href: "/tasks",
  },
  {
    icon: Building,
    label: "Perusahaan & User",
    href: "#",
    submenu: [
      {
        icon: Building2,
        label: "Companies",
        href: "/companies",
      },
      {
        icon: Users,
        label: "Users",
        href: "/users",
      },
      {
        icon: UserCheck,
        label: "User Management",
        href: "/user-management",
      },
      {
        icon: Shield,
        label: "Company User Management",
        href: "/company-user-management",
      },
      {
        icon: FileText,
        label: "Global Reports",
        href: "/global-reports",
      }
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
];