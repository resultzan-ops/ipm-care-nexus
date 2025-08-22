import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users as UsersIcon, Plus, Search, Filter, Shield, User, Settings, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: string;
  tenant_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  tenants?: {
    name: string;
  } | null;
}

export default function UserManagement() {
  const { profile } = useAuth();
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants!profiles_company_id_fkey (
            name, nama_perusahaan
          )
        `)
        .order('name');
      
      if (error) throw error;
      return data.map(item => ({
        ...item,
        nama_lengkap: item.nama_lengkap || item.name,
        no_hp: item.no_hp || item.phone,
        tenants: item.tenants ? {
          name: item.tenants.name || item.tenants.nama_perusahaan,
          nama_perusahaan: item.tenants.nama_perusahaan || item.tenants.name
        } : null
      })) as Profile[];
    }
  });

  const filteredUsers = profiles.filter(user => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.is_active) ||
      (statusFilter === "inactive" && !user.is_active);
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.tenants?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        );
      case "admin_rs":
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin RS
          </Badge>
        );
      case "admin_kalibrasi":
        return (
          <Badge variant="default" className="gap-1">
            <Shield className="h-3 w-3" />
            Admin Kalibrasi
          </Badge>
        );
      case "spv":
      case "spv_rs":
        return (
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            SPV
          </Badge>
        );
      case "operator":
      case "operator_rs":
        return (
          <Badge variant="outline" className="gap-1">
            <User className="h-3 w-3" />
            Operator
          </Badge>
        );
      case "teknisi":
      case "teknisi_rs":
        return (
          <Badge variant="secondary" className="gap-1">
            <Settings className="h-3 w-3" />
            Teknisi
          </Badge>
        );
      case "kalibrator":
        return (
          <Badge variant="secondary" className="gap-1">
            <Settings className="h-3 w-3" />
            Kalibrator
          </Badge>
        );
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (profile?.role !== 'super_admin') {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getStatistics = () => {
    const total = profiles.length;
    const admins = profiles.filter(p => 
      p.role.includes('admin') || p.role === 'super_admin'
    ).length;
    const operators = profiles.filter(p => 
      p.role.includes('operator')
    ).length;
    const technicians = profiles.filter(p => 
      p.role.includes('teknisi') || p.role === 'kalibrator'
    ).length;
    
    return { total, admins, operators, technicians };
  };

  const stats = getStatistics();

  return (
    <DashboardLayout userRole="super_admin" tenantName="IPM Care Nexus">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage users and their roles within the system
            </p>
          </div>
          <Button variant="medical" className="gap-2">
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-8 w-8 text-primary" />
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
                <Shield className="h-8 w-8 text-success" />
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
                <User className="h-8 w-8 text-warning" />
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
                <Settings className="h-8 w-8 text-secondary" />
                <div>
                  <p className="text-2xl font-bold">{stats.technicians}</p>
                  <p className="text-sm text-muted-foreground">Technicians</p>
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
                  <SelectItem value="admin_rs">Admin RS</SelectItem>
                  <SelectItem value="admin_kalibrasi">Admin Kalibrasi</SelectItem>
                  <SelectItem value="spv">SPV</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="teknisi">Teknisi</SelectItem>
                  <SelectItem value="kalibrator">Kalibrator</SelectItem>
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
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
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
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.user_id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{user.tenants?.name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                      <TableCell className="text-sm">{user.phone || "-"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-3 w-3" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}