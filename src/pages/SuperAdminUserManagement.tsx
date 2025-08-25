import { DashboardLayout } from "@/components/dashboard/layout";
import { EnhancedUserManagement } from "@/components/super-admin/EnhancedUserManagement";

export default function SuperAdminUserManagement() {
  return (
    <DashboardLayout userRole="super_admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user management with company assignments and role-based access control
          </p>
        </div>
        <EnhancedUserManagement />
      </div>
    </DashboardLayout>
  );
}