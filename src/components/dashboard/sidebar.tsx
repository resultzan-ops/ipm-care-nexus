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
  Download,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

interface SidebarProps {
  userRole: "super_admin" | "admin_mitra" | "admin_klien" | "teknisi_mitra" | "operator_klien" | "owner";
}

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  children?: MenuItem[];
}

const menuItems = {
  super_admin: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
    { icon: Calendar, label: "Maintenance", href: "/maintenance" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Wrench, label: "Calibrations", href: "/calibrations" },
    { icon: FileText, label: "Global Reports", href: "/global-reports" },
    { icon: Monitor, label: "Monitoring", href: "/monitoring" },
    { icon: Wrench, label: "Tools", href: "/tools" },
    { icon: Download, label: "Download", href: "/download" },
    { 
      icon: Building, 
      label: "Perusahaan & User",
      children: [
        { icon: Building, label: "Manajemen Perusahaan", href: "/companies" },
        { icon: Users, label: "Manajemen User", href: "/users" },
      ]
    },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  admin_mitra: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
    { icon: Calendar, label: "Maintenance", href: "/maintenance" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Wrench, label: "Calibrations", href: "/calibrations" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  admin_klien: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
    { icon: Calendar, label: "Maintenance", href: "/maintenance" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Wrench, label: "Calibrations", href: "/calibrations" },
  ],
  teknisi_mitra: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Calendar, label: "My Tasks", href: "/tasks" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
  ],
  operator_klien: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
    { icon: Calendar, label: "Maintenance", href: "/maintenance" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Wrench, label: "Calibrations", href: "/calibrations" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
};

export function Sidebar({ userRole }: SidebarProps) {
  const items = menuItems[userRole] || menuItems.operator_klien;
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Debug log for role
  console.log("Sidebar userRole:", userRole, "Available items:", items.length);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = item.href && location.pathname === item.href;

    if (hasChildren) {
      return (
        <div key={item.label}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left h-10 px-3 py-2",
              "hover:bg-muted/50"
            )}
            onClick={() => toggleExpanded(item.label)}
          >
            <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </Button>
          
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-2 space-y-1 mt-1">
              {item.children?.map((child) => (
                <Link key={child.href} to={child.href || '#'} className="block">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-left h-9 px-3 py-2 text-sm",
                      location.pathname === child.href && "bg-primary/10 text-primary"
                    )}
                  >
                    <child.icon className="h-3 w-3 mr-3 flex-shrink-0" />
                    <span className="truncate">{child.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.href} to={item.href || '#'} className="block">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-left h-10 px-3 py-2",
            isActive && "bg-primary/10 text-primary"
          )}
        >
          <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </Button>
      </Link>
    );
  };

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
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {items.map(renderMenuItem)}
        </div>
      </nav>
    </div>
  );
}