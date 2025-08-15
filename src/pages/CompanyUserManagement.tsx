import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building, Users, Search, Plus, Eye, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

interface Company {
  id: string;
  nama_perusahaan: string;
  company_type: 'Mitra Penyedia (Kalibrasi)' | 'Mitra Penyedia (Barang & Jasa)' | 'Klien Rumah Sakit/Perusahaan';
  email?: string;
  phone?: string;
  alamat?: string;
  user_count?: number;
  active_users?: number;
}

interface CompanyUser {
  id: string;
  nama_lengkap: string;
  role: string;
  is_active: boolean;
  company_id: string;
}

export default function CompanyUserManagement() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [companyTypeFilter, setCompanyTypeFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Fetch companies with user counts
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies-with-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select(`
          *,
          profiles:profiles(count)
        `);

      if (error) throw error;

      return data.map(company => ({
        ...company,
        user_count: company.profiles?.[0]?.count || 0,
      })) as Company[];
    },
  });

  // Fetch users for selected company
  const { data: companyUsers = [], isLoading: usersLoading } = useQuery({
    queryKey: ["company-users", selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("company_id", selectedCompany);

      if (error) throw error;
      return data as CompanyUser[];
    },
    enabled: !!selectedCompany,
  });

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.nama_perusahaan.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = companyTypeFilter === "all" || company.company_type === companyTypeFilter;
    return matchesSearch && matchesType;
  });

  const getCompanyTypeInfo = (type: string) => {
    switch (type) {
      case "Mitra Penyedia (Kalibrasi)":
        return {
          badge: <Badge className="bg-blue-100 text-blue-800">Mitra Kalibrasi</Badge>,
          menuAccess: "Menu: Proses Kalibrasi, History Kalibrasi, Assignment Teknisi",
          roles: ["admin_mitra", "teknisi_mitra"]
        };
      case "Mitra Penyedia (Barang & Jasa)":
        return {
          badge: <Badge className="bg-green-100 text-green-800">Mitra Barang & Jasa</Badge>,
          menuAccess: "Menu: Medical Equipment Management, Sales & Inventory",
          roles: ["admin_mitra", "operator_mitra"]
        };
      case "Klien Rumah Sakit/Perusahaan":
        return {
          badge: <Badge className="bg-purple-100 text-purple-800">Klien RS/Perusahaan</Badge>,
          menuAccess: "Menu: Request Kalibrasi, View Equipment, Basic Reports",
          roles: ["admin_klien", "operator_klien"]
        };
      default:
        return {
          badge: <Badge variant="secondary">{type}</Badge>,
          menuAccess: "Menu: Default Access",
          roles: []
        };
    }
  };

  const getStatistics = () => {
    const total = companies.length;
    const kalibrasi = companies.filter(c => c.company_type === 'Mitra Penyedia (Kalibrasi)').length;
    const barangJasa = companies.filter(c => c.company_type === 'Mitra Penyedia (Barang & Jasa)').length;
    const klien = companies.filter(c => c.company_type === 'Klien Rumah Sakit/Perusahaan').length;
    const totalUsers = companies.reduce((sum, c) => sum + (c.user_count || 0), 0);

    return { total, kalibrasi, barangJasa, klien, totalUsers };
  };

  const stats = getStatistics();

  if (profile?.role !== 'super_admin') {
    return (
      <DashboardLayout userRole={profile?.role as any || "operator"} tenantName="IPM Care Nexus">
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
    <DashboardLayout userRole="admin_super" tenantName="IPM Care Nexus">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Perusahaan & User</h1>
            <p className="text-muted-foreground mt-1">
              Kelola perusahaan dan user untuk memastikan akses menu yang sesuai dengan jenis perusahaan
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Perusahaan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.kalibrasi}</p>
                  <p className="text-sm text-muted-foreground">Mitra Kalibrasi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.barangJasa}</p>
                  <p className="text-sm text-muted-foreground">Mitra Barang & Jasa</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.klien}</p>
                  <p className="text-sm text-muted-foreground">Klien RS/Perusahaan</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={companyTypeFilter} onValueChange={setCompanyTypeFilter}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter jenis perusahaan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Jenis</SelectItem>
              <SelectItem value="Mitra Penyedia (Kalibrasi)">Mitra Kalibrasi</SelectItem>
              <SelectItem value="Mitra Penyedia (Barang & Jasa)">Mitra Barang & Jasa</SelectItem>
              <SelectItem value="Klien Rumah Sakit/Perusahaan">Klien RS/Perusahaan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Companies List */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Perusahaan</CardTitle>
              <CardDescription>
                Klik perusahaan untuk melihat user dan akses menu yang tersedia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companiesLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : filteredCompanies.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Tidak ada perusahaan ditemukan
                  </div>
                ) : (
                  filteredCompanies.map((company) => {
                    const typeInfo = getCompanyTypeInfo(company.company_type);
                    const isSelected = selectedCompany === company.id;
                    
                    return (
                      <div
                        key={company.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedCompany(isSelected ? null : company.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{company.nama_perusahaan}</h3>
                            <div className="mt-1">{typeInfo.badge}</div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {typeInfo.menuAccess}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {company.user_count || 0} users
                              </span>
                              <span>Roles: {typeInfo.roles.join(", ")}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/companies`}>
                                <Settings className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company Users */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCompany ? `User di ${filteredCompanies.find(c => c.id === selectedCompany)?.nama_perusahaan}` : 'Pilih Perusahaan'}
              </CardTitle>
              <CardDescription>
                {selectedCompany 
                  ? "Daftar user yang terdaftar di perusahaan ini dan akses menu mereka"
                  : "Pilih perusahaan dari daftar di sebelah kiri untuk melihat user"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCompany ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Pilih perusahaan untuk melihat user</p>
                </div>
              ) : usersLoading ? (
                <div className="text-center py-4">Loading users...</div>
              ) : companyUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada user di perusahaan ini</p>
                  <Button className="mt-4" asChild>
                    <Link to="/users">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah User
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyUsers.map((user) => (
                    <div key={user.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{user.nama_lengkap}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.is_active ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                            <Badge variant={user.is_active ? "default" : "destructive"}>
                              {user.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/users">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline" asChild>
                    <Link to="/users">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah User Baru
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Menu Access Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akses Menu Berdasarkan Jenis Perusahaan</CardTitle>
            <CardDescription>
              Setiap jenis perusahaan memiliki akses menu yang berbeda sesuai dengan fungsi bisnis mereka
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">Mitra Kalibrasi</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Menu yang Tersedia:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Dashboard</li>
                    <li>• Proses Kalibrasi</li>
                    <li>• History Kalibrasi</li>
                    <li>• Assignment Teknisi</li>
                    <li>• Equipment (View All)</li>
                    <li>• Reports</li>
                  </ul>
                  <p className="font-medium mt-3">Roles:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• admin_mitra (Full Access)</li>
                    <li>• teknisi_mitra (Task-based)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Mitra Barang & Jasa</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Menu yang Tersedia:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Dashboard</li>
                    <li>• Equipment Management</li>
                    <li>• Sales & Inventory</li>
                    <li>• Client Management</li>
                    <li>• Reports</li>
                  </ul>
                  <p className="font-medium mt-3">Roles:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• admin_mitra (Full Access)</li>
                    <li>• operator_mitra (Limited)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">Klien RS/Perusahaan</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Menu yang Tersedia:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Dashboard</li>
                    <li>• Request Kalibrasi</li>
                    <li>• View Own Equipment</li>
                    <li>• Maintenance Schedule</li>
                    <li>• Basic Reports</li>
                  </ul>
                  <p className="font-medium mt-3">Roles:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• admin_klien (Full Access)</li>
                    <li>• operator_klien (View Only)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}