import { Button } from "@/components/ui/button";
import { 
  Bell, 
  ChevronDown, 
  Hospital, 
  User
} from "lucide-react";

interface HeaderProps {
  tenantName: string;
  userRole: "admin_super" | "admin_tenant" | "operator" | "teknisi" | "owner";
}

const roleLabels = {
  admin_super: "Super Administrator",
  admin_tenant: "Hospital Administrator", 
  operator: "Equipment Operator",
  teknisi: "Maintenance Technician",
  owner: "Hospital Owner",
};

export function Header({ tenantName, userRole }: HeaderProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Hospital className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">{tenantName}</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-danger rounded-full text-xs"></span>
        </Button>
        
        <div className="flex items-center space-x-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">{roleLabels[userRole]}</p>
          </div>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </header>
  );
}