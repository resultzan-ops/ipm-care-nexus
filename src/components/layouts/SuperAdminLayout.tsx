import { ReactNode } from "react";
import { SuperAdminSidebar } from "./SuperAdminSidebar";
import { Header } from "@/components/dashboard/header";
import { AppRole } from "@/lib/permissions";

interface SuperAdminLayoutProps {
  children: ReactNode;
  tenantName?: string;
}

export function SuperAdminLayout({ 
  children, 
  tenantName = "IPM System - Super Admin Panel"
}: SuperAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <SuperAdminSidebar />
        <div className="flex-1 flex flex-col">
          <Header tenantName={tenantName} userRole="super_admin" />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}