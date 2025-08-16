import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Shield, Users, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Types for RBAC system
export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  company_type?: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  module: string;
}

export interface CompanyType {
  id: string;
  name: string;
  display_name: string;
  description: string;
}

const AVAILABLE_PERMISSIONS = [
  { id: "dashboard", name: "dashboard", display_name: "Dashboard", description: "Access to dashboard", module: "core" },
  { id: "equipment", name: "equipment", display_name: "Equipment Management", description: "Manage equipment", module: "equipment" },
  { id: "maintenance", name: "maintenance", display_name: "Maintenance", description: "Maintenance operations", module: "maintenance" },
  { id: "inspections", name: "inspections", display_name: "Inspections", description: "Equipment inspections", module: "inspection" },
  { id: "calibrations", name: "calibrations", display_name: "Calibrations", description: "Calibration management", module: "calibration" },
  { id: "reports", name: "reports", display_name: "Reports", description: "Generate reports", module: "reporting" },
  { id: "global_reports", name: "global_reports", display_name: "Global Reports", description: "Access all reports", module: "reporting" },
  { id: "monitoring", name: "monitoring", display_name: "Monitoring", description: "System monitoring", module: "monitoring" },
  { id: "tools", name: "tools", display_name: "Tools", description: "System tools", module: "tools" },
  { id: "download", name: "download", display_name: "Download", description: "Download capabilities", module: "download" },
  { id: "company_management", name: "company_management", display_name: "Company Management", description: "Manage companies", module: "company" },
  { id: "user_management", name: "user_management", display_name: "User Management", description: "Manage users", module: "user" },
  { id: "settings", name: "settings", display_name: "Settings", description: "System settings", module: "settings" },
  { id: "tasks", name: "tasks", display_name: "Tasks", description: "Task management", module: "tasks" },
];

const COMPANY_TYPES = [
  { id: "klien", name: "klien", display_name: "Klien Rumah Sakit/Perusahaan", description: "Client hospitals/companies" },
  { id: "mitra", name: "mitra", display_name: "Mitra Penyedia (Kalibrasi)", description: "Calibration service providers" },
  { id: "internal", name: "internal", display_name: "Internal System", description: "Internal system management" },
];

export function RolePermissionManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    display_name: "",
    description: "",
    company_type: "",
    permissions: [] as string[]
  });
  const { toast } = useToast();

  // Mock data - in real app, fetch from database
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: "1",
        name: "super_admin",
        display_name: "Super Admin",
        description: "Full system access",
        permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "2",
        name: "admin_klien",
        display_name: "Admin Klien",
        description: "Client admin access",
        company_type: "klien",
        permissions: ["dashboard", "equipment", "maintenance", "inspections", "calibrations", "user_management", "settings"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "3",
        name: "admin_mitra",
        display_name: "Admin Mitra",
        description: "Service provider admin",
        company_type: "mitra",
        permissions: ["dashboard", "calibrations", "equipment", "user_management", "settings", "tasks"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    setRoles(mockRoles);
  }, []);

  const handleCreateRole = () => {
    const role: Role = {
      id: Date.now().toString(),
      ...newRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setRoles([...roles, role]);
    setNewRole({ name: "", display_name: "", description: "", company_type: "", permissions: [] });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Role Created",
      description: `Role "${role.display_name}" has been created successfully.`,
    });
  };

  const handleEditRole = () => {
    if (!selectedRole) return;
    
    const updatedRoles = roles.map(role => 
      role.id === selectedRole.id 
        ? { ...selectedRole, updated_at: new Date().toISOString() }
        : role
    );
    
    setRoles(updatedRoles);
    setSelectedRole(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Role Updated",
      description: `Role "${selectedRole.display_name}" has been updated successfully.`,
    });
  };

  const handleDeleteRole = (roleId: string) => {
    setRoles(roles.filter(role => role.id !== roleId));
    toast({
      title: "Role Deleted",
      description: "Role has been deleted successfully.",
      variant: "destructive",
    });
  };

  const getPermissionDisplay = (permissionId: string) => {
    const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
    return permission?.display_name || permissionId;
  };

  const getCompanyTypeDisplay = (companyType?: string) => {
    if (!companyType) return "All";
    const type = COMPANY_TYPES.find(t => t.name === companyType);
    return type?.display_name || companyType;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Role & Permission Management</h2>
          <p className="text-muted-foreground">Manage roles and their permissions for different company types</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role with specific permissions for a company type
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    placeholder="e.g., admin_klien"
                  />
                </div>
                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={newRole.display_name}
                    onChange={(e) => setNewRole({...newRole, display_name: e.target.value})}
                    placeholder="e.g., Admin Klien"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  placeholder="Role description"
                />
              </div>
              <div>
                <Label htmlFor="company-type">Company Type</Label>
                <Select value={newRole.company_type} onValueChange={(value) => setNewRole({...newRole, company_type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Company Types</SelectItem>
                    {COMPANY_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={newRole.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewRole({...newRole, permissions: [...newRole.permissions, permission.id]});
                          } else {
                            setNewRole({...newRole, permissions: newRole.permissions.filter(p => p !== permission.id)});
                          }
                        }}
                      />
                      <Label htmlFor={permission.id} className="text-sm">
                        {permission.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole}>
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Permissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{AVAILABLE_PERMISSIONS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Types</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{COMPANY_TYPES.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Manage system roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Company Type</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.display_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCompanyTypeDisplay(role.company_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {getPermissionDisplay(permission)}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.name === "super_admin"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Modify role permissions and settings
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role-name">Role Name</Label>
                  <Input
                    id="edit-role-name"
                    value={selectedRole.name}
                    onChange={(e) => setSelectedRole({...selectedRole, name: e.target.value})}
                    disabled={selectedRole.name === "super_admin"}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-display-name">Display Name</Label>
                  <Input
                    id="edit-display-name"
                    value={selectedRole.display_name}
                    onChange={(e) => setSelectedRole({...selectedRole, display_name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-64 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${permission.id}`}
                        checked={selectedRole.permissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRole({
                              ...selectedRole,
                              permissions: [...selectedRole.permissions, permission.id]
                            });
                          } else {
                            setSelectedRole({
                              ...selectedRole,
                              permissions: selectedRole.permissions.filter(p => p !== permission.id)
                            });
                          }
                        }}
                        disabled={selectedRole.name === "super_admin"}
                      />
                      <Label htmlFor={`edit-${permission.id}`} className="text-sm">
                        {permission.display_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditRole}>
                  Update Role
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}