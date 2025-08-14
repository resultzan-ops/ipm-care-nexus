import { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "admin_super" | "admin_tenant" | "operator" | "teknisi" | "owner";
  tenantName?: string;
}

export function DashboardLayout({ 
  children, 
  userRole = "owner",
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