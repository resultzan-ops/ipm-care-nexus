import { SuperAdminLayout } from "@/components/layouts/SuperAdminLayout";
import { RolePermissionManager } from "@/components/super-admin/RolePermissionManager";

export default function SuperAdminRoleManagement() {
  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">
            Manage system roles, permissions, and access control for different company types
          </p>
        </div>
        <RolePermissionManager />
      </div>
    </SuperAdminLayout>
  );
}