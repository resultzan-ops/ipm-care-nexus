import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Mail, Phone, MessageCircle, MapPin, FileImage, Edit, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CompanyProfile {
  id: string;
  nama_perusahaan: string;
  company_type: 'Mitra Penyedia (Kalibrasi)' | 'Mitra Penyedia (Barang & Jasa)' | 'Klien Rumah Sakit/Perusahaan';
  email?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  alamat?: string;
  description?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export default function CompanyProfile() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyProfile>>({});

  // Fetch current user's company profile
  const { data: company, isLoading } = useQuery({
    queryKey: ["company-profile"],
    queryFn: async () => {
      if (!profile?.tenant_id) return null;
      
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .eq("id", profile.tenant_id)
        .single();

      if (error) throw error;
      return data as CompanyProfile;
    },
    enabled: !!profile?.tenant_id,
  });

  // Initialize form data when company data loads
  useEffect(() => {
    if (company && !isEditing) {
      setFormData(company);
    }
  }, [company, isEditing]);

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (updatedData: Partial<CompanyProfile>) => {
      if (!company?.id) throw new Error("No company ID");

      const { error } = await supabase
        .from("tenants")
        .update(updatedData)
        .eq("id", company.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profil perusahaan berhasil diperbarui!");
      queryClient.invalidateQueries({ queryKey: ["company-profile"] });
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error("Gagal memperbarui profil perusahaan: " + error.message);
    },
  });

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateCompanyMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(company || {});
    setIsEditing(false);
  };

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'Mitra Penyedia (Kalibrasi)': return 'bg-blue-100 text-blue-800';
      case 'Mitra Penyedia (Barang & Jasa)': return 'bg-green-100 text-green-800';
      case 'Klien Rumah Sakit/Perusahaan': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = profile?.role === 'super_admin' || 
                 profile?.role === 'admin_mitra' || 
                 profile?.role === 'admin_klien';

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Building className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Profil Perusahaan</h1>
          </div>
          <div className="animate-pulse">
            <Card>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Building className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Profil Perusahaan</h1>
          </div>
          <Card>
            <CardContent className="p-6 text-center">
              <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Tidak ada profil perusahaan</h3>
              <p className="text-muted-foreground">
                Anda belum terhubung dengan perusahaan manapun. Hubungi administrator untuk mendapatkan akses.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Profil Perusahaan</h1>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={updateCompanyMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={updateCompanyMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateCompanyMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profil
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Company Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>
                Informasi dasar tentang perusahaan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama_perusahaan">Nama Perusahaan</Label>
                {isEditing ? (
                  <Input
                    id="nama_perusahaan"
                    value={formData.nama_perusahaan || ""}
                    onChange={(e) => handleInputChange("nama_perusahaan", e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-medium">{company.nama_perusahaan}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Jenis Perusahaan</Label>
                {isEditing && profile?.role === 'super_admin' ? (
                  <Select
                    value={formData.company_type || company.company_type}
                    onValueChange={(value) => handleInputChange("company_type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mitra Penyedia (Kalibrasi)">
                        Mitra Penyedia (Kalibrasi)
                      </SelectItem>
                      <SelectItem value="Mitra Penyedia (Barang & Jasa)">
                        Mitra Penyedia (Barang & Jasa)
                      </SelectItem>
                      <SelectItem value="Klien Rumah Sakit/Perusahaan">
                        Klien Rumah Sakit/Perusahaan
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getCompanyTypeColor(company.company_type)}>
                    {company.company_type}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                {isEditing ? (
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Deskripsi singkat tentang perusahaan..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {company.description || "Belum ada deskripsi"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Kontak</CardTitle>
              <CardDescription>
                Informasi kontak perusahaan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={formData.email || ""}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@perusahaan.com"
                    />
                  </div>
                ) : (
                  <p className="text-sm">{company.email || "Belum diisi"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10"
                      value={formData.phone || ""}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="021-1234567"
                    />
                  </div>
                ) : (
                  <p className="text-sm">{company.phone || "Belum diisi"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                {isEditing ? (
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="whatsapp"
                      className="pl-10"
                      value={formData.whatsapp || ""}
                      onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                      placeholder="08123456789"
                    />
                  </div>
                ) : (
                  <p className="text-sm">{company.whatsapp || "Belum diisi"}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat">Alamat</Label>
                {isEditing ? (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="alamat"
                      className="pl-10"
                      value={formData.alamat || formData.address || ""}
                      onChange={(e) => handleInputChange("alamat", e.target.value)}
                      placeholder="Alamat lengkap perusahaan..."
                      rows={3}
                    />
                  </div>
                ) : (
                  <p className="text-sm">{company.alamat || company.address || "Belum diisi"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logo Section */}
        <Card>
          <CardHeader>
            <CardTitle>Logo Perusahaan</CardTitle>
            <CardDescription>
              Upload dan kelola logo perusahaan (opsional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                {company.logo_url ? (
                  <img 
                    src={company.logo_url} 
                    alt="Logo perusahaan" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <FileImage className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-2">
                  Format: JPG, PNG, SVG. Maksimal 2MB.
                </p>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      type="url"
                      value={formData.logo_url || ""}
                      onChange={(e) => handleInputChange("logo_url", e.target.value)}
                      placeholder="URL logo perusahaan..."
                    />
                    <Button variant="outline" size="sm">
                      <FileImage className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm">
                    {company.logo_url ? "Logo tersedia" : "Belum ada logo"}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}