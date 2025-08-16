import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AppRole } from "@/lib/permissions";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: AppRole;
  tenantName?: string;
}

export function DashboardLayout({ 
  children, 
  userRole = "operator" as AppRole,
  tenantName = "Rumah Sakit Umum Daerah"
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <Header tenantName={tenantName} userRole={userRole} />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}