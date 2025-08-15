import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Calendar, 
  ClipboardCheck, 
  Gauge, 
  Hospital, 
  Settings, 
  Users, 
  Wrench,
  FileText,
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  userRole: "admin_super" | "admin_tenant" | "operator" | "teknisi" | "owner";
}

const menuItems = {
  admin_super: [
    { icon: Shield, label: "Super Admin", href: "/admin-super" },
    { icon: Hospital, label: "Manage Tenants", href: "/tenants" },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: FileText, label: "Global Reports", href: "/global-reports" },
  ],
  admin_tenant: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
    { icon: Calendar, label: "Maintenance", href: "/maintenance" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Wrench, label: "Calibrations", href: "/calibrations" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
  operator: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
    { icon: Calendar, label: "Maintenance", href: "/maintenance" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Wrench, label: "Calibrations", href: "/calibrations" },
  ],
  teknisi: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Calendar, label: "My Tasks", href: "/tasks" },
    { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
  ],
  owner: [
    { icon: Gauge, label: "Dashboard", href: "/" },
    { icon: Activity, label: "Equipment", href: "/equipment" },
    { icon: FileText, label: "Reports", href: "/reports" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ],
};

export function Sidebar({ userRole }: SidebarProps) {
  const items = menuItems[userRole] || menuItems.owner;
  const location = useLocation();

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
        {items.map((item) => (
          <Link key={item.href} to={item.href}>
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
        ))}
      </nav>
    </div>
  );
}