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
  Shield
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  userRole: "super_admin" | "admin_mitra" | "admin_klien" | "teknisi_mitra" | "operator_klien" | "owner";
}

const menuItems = {
  super_admin: [
    { icon: Shield, label: "Dashboard", href: "/" },
    { icon: Building, label: "Perusahaan & User", href: "/company-user-management" },
    { icon: Building, label: "Manajemen Perusahaan", href: "/companies" },
    { icon: Users, label: "Manajemen User", href: "/users" },
    { icon: FileText, label: "Global Reports", href: "/global-reports" },
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

  // Debug log for role
  console.log("Sidebar userRole:", userRole, "Available items:", items.length);

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