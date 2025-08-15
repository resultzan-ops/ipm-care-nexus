import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users as UsersIcon, Plus, Search, Filter, Shield, User, Settings, Eye, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AddUserModal } from "@/components/users/add-user-modal";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditUserModal } from "@/components/users/edit-user-modal";

interface Profile {
  id: string;
  user_id: string;
  nama_lengkap: string;
  role: 'super_admin' | 'admin_mitra' | 'teknisi_mitra' | 'admin_klien' | 'operator_klien';
  company_id: string | null;
  no_hp: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenants?: {
    nama_perusahaan: string;
    company_type: string;
  } | null;
}

export default function Users() {
  const { profile } = useAuth();
  const [companyFilter, setCompanyFilter] = useState("all");
  const [companyTypeFilter, setCompanyTypeFilter] = useState("all"); // Filter by company type
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user profiles from Supabase
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants!profiles_company_id_fkey(nama_perusahaan, company_type)
        `);
      
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Fetch companies for filter
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, nama_perusahaan, company_type')
        .order('nama_perusahaan');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredUsers = profiles.filter(user => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    const matchesCompany = companyFilter === "all" || user.company_id === companyFilter;
    const matchesCompanyType = companyTypeFilter === "all" ||
      (companyTypeFilter === "mitra" && (user.tenants?.company_type === "Mitra Penyedia (Kalibrasi)" || user.tenants?.company_type === "Mitra Penyedia (Barang & Jasa)")) ||
      (companyTypeFilter === "klien" && user.tenants?.company_type === "Klien Rumah Sakit/Perusahaan");
    const matchesSearch = user.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tenants?.nama_perusahaan?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesCompany && matchesCompanyType && matchesSearch;
  });

  const getStatistics = () => {
    const total = profiles.length;
    const admins = profiles.filter(p => p.role === 'super_admin' || p.role === 'admin_mitra' || p.role === 'admin_klien').length;
    const operators = profiles.filter(p => p.role === 'operator_klien').length;
    const technicians = profiles.filter(p => p.role === 'teknisi_mitra').length;
    
    // Filter by company type
    const mitraUsers = profiles.filter(p => 
      p.tenants?.company_type === "Mitra Penyedia (Kalibrasi)" || 
      p.tenants?.company_type === "Mitra Penyedia (Barang & Jasa)" ||
      p.role === "admin_mitra" || 
      p.role === "teknisi_mitra"
    ).length;
    
    const klienUsers = profiles.filter(p => 
      p.tenants?.company_type === "Klien Rumah Sakit/Perusahaan" ||
      p.role === "admin_klien" || 
      p.role === "operator_klien"
    ).length;
    
    return { total, admins, operators, technicians, mitraUsers, klienUsers };
  };

  const stats = getStatistics();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <Badge variant="destructive" className="gap-1">
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      case "admin_mitra":
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Mitra
          </Badge>
        );
      case "teknisi_mitra":
        return (
          <Badge variant="secondary" className="gap-1">
            <Settings className="h-3 w-3" />
            Teknisi Mitra
          </Badge>
        );
      case "admin_klien":
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Klien
          </Badge>
        );
      case "operator_klien":
        return (
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            Operator Klien
          </Badge>
        );
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };
  const deleteProfile = async (id: string) => {
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Gagal menghapus', description: error.message });
    } else {
      toast({ title: 'User terhapus' });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    }
  };

  const getCompanyTypeBadge = (type: string) => {
    switch (type) {
      case "IPM":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">IPM</Badge>;
      case "Mitra Kalibrasi":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Mitra Kalibrasi</Badge>;
      case "Rumah Sakit / Perusahaan":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Klien</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  // Show access denied if not authorized
  if (profile?.role !== 'super_admin' && profile?.role !== 'admin_mitra' && profile?.role !== 'admin_klien') {
    return (
      <DashboardLayout userRole={profile?.role as any || "operator_klien"} tenantName="IPM Care Nexus">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Akses Ditolak</h2>
              <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={profile?.role as any || "operator_klien"} tenantName="IPM Care Nexus">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage users and their roles within the system
            </p>
          </div>
          <Button variant="medical" className="gap-2" onClick={() => setAddUserModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-sm text-muted-foreground">Administrators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.operators}</p>
                  <p className="text-sm text-muted-foreground">Operators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Settings className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.technicians}</p>
                  <p className="text-sm text-muted-foreground">Technicians</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.mitraUsers}</p>
                  <p className="text-sm text-muted-foreground">Mitra Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.klienUsers}</p>
                  <p className="text-sm text-muted-foreground">Klien Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search users..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin_mitra">Admin Mitra</SelectItem>
                  <SelectItem value="teknisi_mitra">Teknisi Mitra</SelectItem>
                  <SelectItem value="admin_klien">Admin Klien</SelectItem>
                  <SelectItem value="operator_klien">Operator Klien</SelectItem>
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.nama_perusahaan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={companyTypeFilter} onValueChange={setCompanyTypeFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mitra">Mitra (Kalibrasi & Barang Jasa)</SelectItem>
                  <SelectItem value="klien">Klien (Rumah Sakit)</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              System Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading users...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {user.nama_lengkap.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.nama_lengkap}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.role}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.tenants?.nama_perusahaan || 'N/A'}</span>
                          {user.tenants?.company_type && (
                            <span className="text-xs">{getCompanyTypeBadge(user.tenants.company_type)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell className="text-sm">{user.no_hp || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                          {profile?.role === 'super_admin' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                                onClick={() => {
                                  setSelectedUser(user as Profile);
                                  setEditUserModalOpen(true);
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus user ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tindakan ini tidak dapat dibatalkan. User akan dihapus permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteProfile(user.id)}>Hapus</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <AddUserModal 
          open={addUserModalOpen} 
          onOpenChange={setAddUserModalOpen} 
        />
        <EditUserModal
          open={editUserModalOpen}
          onOpenChange={setEditUserModalOpen}
          user={selectedUser ? {
            id: selectedUser.id,
            nama_lengkap: selectedUser.nama_lengkap,
            no_hp: selectedUser.no_hp,
            role: selectedUser.role,
            is_active: selectedUser.is_active
          } : null}
        />
      </div>
    </DashboardLayout>
  );
}