import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Building,
  Calendar,
  ClipboardCheck,
  Gauge,
  Hospital,
  Settings,
  Users,
  Wrench,
  FileText,
  Shield,
  Monitor,
  Tool,
  Download,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  userRole:
    | "super_admin"
    | "admin_mitra"
    | "admin_klien"
    | "teknisi_mitra"
    | "operator_klien"
    | "owner";
}

const menuItems = [
  {
    icon: Gauge,
    label: "Dashboard",
    href: "/",
    allowedRoles: ["super_admin", "admin_mitra", "admin_klien", "teknisi_mitra", "operator_klien", "owner"],
  },
  {
    icon: Activity,
    label: "Equipment",
    href: "/equipment",
    allowedRoles: ["super_admin", "admin_mitra", "admin_klien", "teknisi_mitra", "operator_klien"],
  },
  {
    icon: Calendar,
    label: "Maintenance",
    href: "/maintenance",
    allowedRoles: ["super_admin", "admin_mitra", "admin_klien", "operator_klien"],
  },
  {
    icon: ClipboardCheck,
    label: "Inspections",
    href: "/inspections",
    allowedRoles: ["super_admin", "admin_mitra", "admin_klien", "teknisi_mitra", "operator_klien"],
  },
  {
    icon: Wrench,
    label: "Calibrations",
    href: "/calibrations",
    allowedRoles: ["super_admin", "admin_mitra", "admin_klien", "operator_klien"],
  },
  {
    icon: FileText,
    label: "Reports",
    href: "/reports",
    allowedRoles: ["super_admin", "admin_mitra", "operator_klien"],
  },
  {
    icon: Monitor,
    label: "Monitoring",
    href: "/monitoring",
    allowedRoles: ["super_admin"],
  },
  {
    icon: Tool,
    label: "Tools",
    href: "/tools",
    allowedRoles: ["super_admin", "admin_mitra"],
  },
  {
    icon: Download,
    label: "Download",
    href: "/download",
    allowedRoles: ["super_admin"],
  },
  {
    icon: Building,
    label: "Perusahaan & User",
    href: "#",
    allowedRoles: ["super_admin", "admin_mitra"],
    submenu: [
      {
        icon: Building,
        label: "Manajemen Perusahaan",
        href: "/companies",
        allowedRoles: ["super_admin", "admin_mitra"],
      },
      {
        icon: Users,
        label: "Manajemen User",
        href: "/users",
        allowedRoles: ["super_admin", "admin_mitra"],
      },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    allowedRoles: ["super_admin", "admin_mitra", "operator_klien"],
  },
];

export function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const handleSubmenuToggle = (itemLabel: string) => {
    setExpandedSubmenu(expandedSubmenu === itemLabel ? null : itemLabel);
  };

  const isSubmenuItemActive = (submenuItems: any[]) => {
    return submenuItems.some((subItem) => location.pathname === subItem.href);
  };

  const filteredMenu = menuItems
    .filter((item) => item.allowedRoles.includes(userRole))
    .map((item) => ({
      ...item,
      submenu: item.submenu?.filter((sub) => sub.allowedRoles.includes(userRole)),
    }));

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Hospital className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">IPM System</h2>
            <p className="text-sm text-muted-foreground">Medical Equipment</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => (
          <div key={item.label}>
            {item.submenu && item.submenu.length > 0 ? (
              <div>
                <Button
                  variant="ghost"
                  onClick={() => handleSubmenuToggle(item.label)}
                  className={cn(
                    "w-full justify-start text-left",
                    isSubmenuItemActive(item.submenu) && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                  {expandedSubmenu === item.label ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </Button>
                {expandedSubmenu === item.label && (
                  <div className="ml-6 mt-2 space-y-2">
                    {item.submenu.map((subItem) => (
                      <Link key={subItem.href} to={subItem.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-full justify-start text-left",
                            location.pathname === subItem.href && "bg-primary/10 text-primary"
                          )}
                        >
                          <subItem.icon className="h-4 w-4 mr-3" />
                          {subItem.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left",
                    location.pathname === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}
