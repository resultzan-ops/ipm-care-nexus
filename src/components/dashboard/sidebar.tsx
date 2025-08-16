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
  BarChart3,
  Monitor,
  Cog,
  Download,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Clock,
  UserCheck,
  Building2,
  TrendingUp,
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AppRole, hasPermission } from "@/lib/permissions";

interface SidebarProps {
  userRole: AppRole;
}

const menuItems = [
  {
    icon: Gauge,
    label: "Dashboard",
    href: "/",
    permission: "dashboard" as const,
  },
  {
    icon: Activity,
    label: "Equipment",
    href: "/equipment",
    permission: "equipment" as const,
  },
  {
    icon: Calendar,
    label: "Maintenance",
    href: "/maintenance",
    permission: "maintenance" as const,
  },
  {
    icon: ClipboardCheck,
    label: "Inspections",
    href: "/inspections",
    permission: "inspections" as const,
  },
  {
    icon: Wrench,  
    label: "Calibrations",
    href: "#",
    permission: "calibrations" as const,
    submenu: [
      {
        icon: FileText,
        label: "Permintaan Kalibrasi",
        href: "/calibrations/requests",
        permission: "calibrations" as const,
      },
      {
        icon: Clock,
        label: "Proses Kalibrasi", 
        href: "/calibrations/process",
        permission: "calibrations" as const,
      },
      {
        icon: TrendingUp,
        label: "History Kalibrasi",
        href: "/calibrations/history",
        permission: "calibrations" as const,
      }
    ]
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: "/reports",
    permission: "reports" as const,
  },
  {
    icon: Monitor,
    label: "Monitoring",
    href: "/monitoring",
    permission: "monitoring" as const,
  },
  {
    icon: Cog,
    label: "Tools",
    href: "/tools",
    permission: "tools" as const,
  },
  {
    icon: Download,
    label: "Download",
    href: "/download",
    permission: "download" as const,
  },
  {
    icon: CheckSquare,
    label: "Tasks / Jadwal Kalibrasi",
    href: "/tasks",
    permission: "tasks" as const,
  },
  {
    icon: Building,
    label: "Perusahaan & User",
    href: "#",
    permission: "company_management" as const,
    submenu: [
      {
        icon: Building2,
        label: "Companies",
        href: "/companies",
        permission: "company_management" as const,
      },
      {
        icon: Users,
        label: "Users",
        href: "/users",
        permission: "user_management" as const,
      },
      {
        icon: UserCheck,
        label: "User Management",
        href: "/user-management",
        permission: "user_management" as const,
      },
      {
        icon: Shield,
        label: "Company User Management",
        href: "/company-user-management",
        permission: "user_management" as const,
      },
      {
        icon: FileText,
        label: "Global Reports",
        href: "/global-reports",
        permission: "user_management" as const,
      }
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
    permission: "settings" as const,
  },
];

export function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const [expandedSubmenus, setExpandedSubmenus] = useState<Set<string>>(new Set());

  console.log("Sidebar userRole:", userRole); // Debug log to verify role

  // Initialize expanded submenus from localStorage or set all submenus as expanded by default
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-expanded-submenus');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setExpandedSubmenus(new Set(parsed));
      } catch (error) {
        // If parsing fails, default to all submenus expanded
        const hasSubmenus = menuItems
          .filter(item => item.submenu && item.submenu.length > 0)
          .map(item => item.label);
        setExpandedSubmenus(new Set(hasSubmenus));
      }
    } else {
      // Default: expand all submenus on first visit
      const hasSubmenus = menuItems
        .filter(item => item.submenu && item.submenu.length > 0)
        .map(item => item.label);
      setExpandedSubmenus(new Set(hasSubmenus));
    }
  }, []);

  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebar-expanded-submenus', JSON.stringify(Array.from(expandedSubmenus)));
  }, [expandedSubmenus]);

  const handleSubmenuToggle = (itemLabel: string) => {
    setExpandedSubmenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemLabel)) {
        newSet.delete(itemLabel);
      } else {
        newSet.add(itemLabel);
      }
      return newSet;
    });
  };

  const isSubmenuItemActive = (submenuItems: any[]) => {
    return submenuItems.some((subItem) => location.pathname === subItem.href);
  };

  // Process menu items - maintain structure consistency, only control visibility
  const processedMenu = menuItems.map((item) => {
    const hasDirectPermission = hasPermission(userRole, item.permission);
    const visibleSubmenus = item.submenu?.map(sub => ({
      ...sub,
      isVisible: hasPermission(userRole, sub.permission)
    })) || [];
    const hasVisibleSubmenu = visibleSubmenus.some(sub => sub.isVisible);
    
    return {
      ...item,
      isVisible: hasDirectPermission || hasVisibleSubmenu,
      submenu: visibleSubmenus,
    };
  });

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

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {processedMenu.map((item) => {
          // Always render item structure to maintain consistency, but control visibility
          return (
            <div key={item.label} className={cn(!item.isVisible && "hidden")}>
              {item.submenu && item.submenu.length > 0 ? (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => item.isVisible ? handleSubmenuToggle(item.label) : undefined}
                    disabled={!item.isVisible}
                    className={cn(
                      "w-full justify-start text-left",
                      !item.isVisible && "opacity-50 cursor-not-allowed",
                      item.isVisible && isSubmenuItemActive(item.submenu.filter(sub => sub.isVisible)) && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                    {item.isVisible && (
                      expandedSubmenus.has(item.label) ? (
                        <ChevronDown className="h-4 w-4 ml-auto" />
                      ) : (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )
                    )}
                  </Button>
                  {expandedSubmenus.has(item.label) && item.isVisible && (
                    <div className="ml-6 mt-2 space-y-2">
                      {item.submenu.map((subItem) => {
                        if (!subItem.isVisible) return null;
                        return (
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
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link to={item.isVisible ? item.href : "#"} className={cn(!item.isVisible && "pointer-events-none")}>
                  <Button
                    variant="ghost"
                    disabled={!item.isVisible}
                    className={cn(
                      "w-full justify-start text-left",
                      !item.isVisible && "opacity-50 cursor-not-allowed",
                      item.isVisible && location.pathname === item.href && "bg-primary/10 text-primary"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
