import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Users, Building, Shield, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AppRole, ROLE_DISPLAY_NAMES } from "@/lib/permissions";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: AppRole;
  company_id?: string;
  company_name?: string;
  company_type?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface Company {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
  users_count: number;
}

const COMPANY_TYPES = [
  { value: "klien", label: "Klien Rumah Sakit/Perusahaan" },
  { value: "mitra", label: "Mitra Penyedia (Kalibrasi)" },
  { value: "internal", label: "Internal System" },
];

export function EnhancedUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "operator" as AppRole,
    company_id: "",
    is_active: true
  });

  const { toast } = useToast();

  // Mock data - in real app, fetch from Supabase
  useEffect(() => {
    const mockCompanies: Company[] = [
      {
        id: "1",
        name: "RS Umum Daerah Jakarta",
        type: "klien",
        email: "info@rsudjakarta.com",
        phone: "+62-21-1234567",
        address: "Jakarta Pusat",
        users_count: 25
      },
      {
        id: "2", 
        name: "PT Kalibrasi Medis Indonesia",
        type: "mitra",
        email: "admin@kalmed.co.id",
        phone: "+62-21-7654321",
        address: "Jakarta Selatan",
        users_count: 12
      },
      {
        id: "3",
        name: "System Internal",
        type: "internal",
        email: "system@ipmsystem.com",
        users_count: 5
      }
    ];

    const mockUsers: User[] = [
      {
        id: "1",
        name: "Super Administrator",
        email: "superadmin@system.com",
        role: "super_admin",
        company_id: "3",
        company_name: "System Internal",
        company_type: "internal",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        last_login: "2024-01-15T10:30:00Z"
      },
      {
        id: "2",
        name: "Dr. Ahmad Wijaya",
        email: "ahmad.wijaya@rsudjakarta.com",
        phone: "+62-812-3456789",
        role: "admin_klien",
        company_id: "1",
        company_name: "RS Umum Daerah Jakarta",
        company_type: "klien",
        is_active: true,
        created_at: "2024-01-02T00:00:00Z",
        last_login: "2024-01-15T09:15:00Z"
      },
      {
        id: "3",
        name: "Siti Nurhaliza",
        email: "siti@kalmed.co.id",
        phone: "+62-811-7654321",
        role: "admin_penyedia",
        company_id: "2",
        company_name: "PT Kalibrasi Medis Indonesia",
        company_type: "mitra",
        is_active: true,
        created_at: "2024-01-03T00:00:00Z",
        last_login: "2024-01-15T08:45:00Z"
      },
      {
        id: "4",
        name: "Budi Santoso",
        email: "budi@kalmed.co.id",
        role: "teknisi",
        company_id: "2",
        company_name: "PT Kalibrasi Medis Indonesia",
        company_type: "mitra",
        is_active: true,
        created_at: "2024-01-04T00:00:00Z"
      },
      {
        id: "5",
        name: "Rina Kusuma",
        email: "rina@rsudjakarta.com",
        role: "operator",
        company_id: "1",
        company_name: "RS Umum Daerah Jakarta",
        company_type: "klien",
        is_active: false,
        created_at: "2024-01-05T00:00:00Z"
      }
    ];

    setCompanies(mockCompanies);
    setUsers(mockUsers);
  }, []);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.company_name && user.company_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesCompany = companyFilter === "all" || 
                          (user.company_type === companyFilter) ||
                          (user.company_id === companyFilter);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && user.is_active) ||
                         (statusFilter === "inactive" && !user.is_active);

    return matchesSearch && matchesRole && matchesCompany && matchesStatus;
  });

  const handleCreateUser = () => {
    const selectedCompany = companies.find(c => c.id === newUser.company_id);
    const user: User = {
      id: Date.now().toString(),
      ...newUser,
      company_name: selectedCompany?.name,
      company_type: selectedCompany?.type,
      created_at: new Date().toISOString()
    };
    
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", phone: "", role: "operator", company_id: "", is_active: true });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "User Created",
      description: `User "${user.name}" has been created successfully.`,
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === selectedUser.id ? selectedUser : user
    );
    
    setUsers(updatedUsers);
    setSelectedUser(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "User Updated",
      description: `User "${selectedUser.name}" has been updated successfully.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.role === "super_admin") {
      toast({
        title: "Cannot Delete",
        description: "Super Admin user cannot be deleted.",
        variant: "destructive",
      });
      return;
    }
    
    setUsers(users.filter(user => user.id !== userId));
    toast({
      title: "User Deleted",
      description: "User has been deleted successfully.",
      variant: "destructive",
    });
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin_klien":
      case "admin_penyedia":
        return "default";
      case "teknisi":
      case "kalibrator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getCompanyTypeBadge = (type?: string) => {
    switch (type) {
      case "klien":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Klien</Badge>;
      case "mitra":
        return <Badge variant="outline" className="bg-green-50 text-green-700">Mitra</Badge>;
      case "internal":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Internal</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatistics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const totalCompanies = companies.length;
    const adminUsers = users.filter(u => u.role.includes("admin")).length;

    return { totalUsers, activeUsers, totalCompanies, adminUsers };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced User Management</h2>
          <p className="text-muted-foreground">Manage users, companies, and role assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with company and role assignment
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-name">Full Name</Label>
                  <Input
                    id="user-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="user-email">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="user-phone">Phone Number</Label>
                <Input
                  id="user-phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-company">Company</Label>
                  <Select value={newUser.company_id} onValueChange={(value) => setNewUser({...newUser, company_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value as AppRole})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_DISPLAY_NAMES).map(([role, displayName]) => (
                        <SelectItem key={role} value={role} disabled={role === "super_admin"}>
                          {displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompanies}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_DISPLAY_NAMES).map(([role, displayName]) => (
                    <SelectItem key={role} value={role}>
                      {displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="company-filter">Company Type</Label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {COMPANY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setCompanyFilter("all");
                setStatusFilter("all");
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and company assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {ROLE_DISPLAY_NAMES[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{user.company_name}</p>
                      {getCompanyTypeBadge(user.company_type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "secondary"}>
                      {user.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.last_login ? (
                      <p className="text-sm">
                        {new Date(user.last_login).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Never</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === "super_admin"}
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

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user information, role, and company assignment
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-user-name">Full Name</Label>
                  <Input
                    id="edit-user-name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-user-email">Email</Label>
                  <Input
                    id="edit-user-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-user-phone">Phone Number</Label>
                <Input
                  id="edit-user-phone"
                  value={selectedUser.phone || ""}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-user-company">Company</Label>
                  <Select 
                    value={selectedUser.company_id || ""} 
                    onValueChange={(value) => {
                      const company = companies.find(c => c.id === value);
                      setSelectedUser({
                        ...selectedUser, 
                        company_id: value,
                        company_name: company?.name,
                        company_type: company?.type
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-user-role">Role</Label>
                  <Select 
                    value={selectedUser.role} 
                    onValueChange={(value) => setSelectedUser({...selectedUser, role: value as AppRole})}
                    disabled={selectedUser.role === "super_admin"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLE_DISPLAY_NAMES).map(([role, displayName]) => (
                        <SelectItem key={role} value={role}>
                          {displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-user-active"
                  checked={selectedUser.is_active}
                  onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.checked})}
                  disabled={selectedUser.role === "super_admin"}
                />
                <Label htmlFor="edit-user-active">Active User</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditUser}>
                  Update User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}