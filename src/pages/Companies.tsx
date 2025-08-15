import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
import { AddCompanyModal } from "@/components/companies/add-company-modal";
import { EditCompanyModal } from "@/components/companies/edit-company-modal";

interface Company {
  id: string;
  nama_perusahaan: string;
  company_type: 'IPM' | 'Mitra Kalibrasi' | 'Rumah Sakit / Perusahaan';
  alamat: string | null;
  telepon: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export default function Companies() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);
  const [editCompanyModalOpen, setEditCompanyModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch companies from Supabase
  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('nama_perusahaan');
      
      if (error) throw error;
      return data.map(item => ({
        ...item,
        alamat: item.address || null,
        telepon: item.phone || null
      })) as Company[];
    }
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tenants').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Perusahaan berhasil dihapus" });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal menghapus perusahaan", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const filteredCompanies = companies.filter(company =>
    company.nama_perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.company_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.alamat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatistics = () => {
    const total = companies.length;
    const ipm = companies.filter(c => c.company_type === 'IPM').length;
    const mitra = companies.filter(c => c.company_type === 'Mitra Kalibrasi').length;
    const klien = companies.filter(c => c.company_type === 'Rumah Sakit / Perusahaan').length;
    
    return { total, ipm, mitra, klien };
  };

  const stats = getStatistics();

  // Only super admin can access this page
  if (profile?.role !== 'super_admin') {
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
            <h1 className="text-3xl font-bold">Manajemen Perusahaan</h1>
            <p className="text-muted-foreground mt-1">
              Kelola perusahaan IPM, mitra kalibrasi, dan klien
            </p>
          </div>
          <Button variant="medical" className="gap-2" onClick={() => setAddCompanyModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Tambah Perusahaan
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
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
                <Building2 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.ipm}</p>
                  <p className="text-sm text-muted-foreground">IPM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.mitra}</p>
                  <p className="text-sm text-muted-foreground">Mitra Kalibrasi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{stats.klien}</p>
                  <p className="text-sm text-muted-foreground">Klien</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Cari perusahaan..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Daftar Perusahaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading perusahaan...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Perusahaan</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Alamat</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.nama_perusahaan}</TableCell>
                      <TableCell>{getCompanyTypeBadge(company.company_type)}</TableCell>
                      <TableCell className="text-sm">{company.alamat || '-'}</TableCell>
                      <TableCell className="text-sm">{company.telepon || '-'}</TableCell>
                      <TableCell className="text-sm">{company.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              setSelectedCompany(company);
                              setEditCompanyModalOpen(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="gap-1 text-destructive">
                                <Trash2 className="h-3 w-3" />
                                Hapus
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Perusahaan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus perusahaan "{company.nama_perusahaan}"? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteCompanyMutation.mutate(company.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <AddCompanyModal 
          open={addCompanyModalOpen} 
          onOpenChange={setAddCompanyModalOpen} 
        />
        
        <EditCompanyModal
          open={editCompanyModalOpen}
          onOpenChange={setEditCompanyModalOpen}
          company={selectedCompany}
        />
      </div>
    </DashboardLayout>
  );
}