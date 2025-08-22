import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AppRole } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: AppRole; 
  tenantName?: string;
}

export function DashboardLayout({ 
  children, 
  userRole,
  tenantName = "Rumah Sakit Umum Daerah"
}: DashboardLayoutProps) {
  const { profile } = useAuth();
  const actualUserRole = userRole || (profile?.role as AppRole) || "operator_klien";
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar userRole={actualUserRole} />
        <div className="flex-1 flex flex-col">
          <Header tenantName={tenantName} userRole={actualUserRole} />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}