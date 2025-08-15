import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  nama_perusahaan: string;
  company_type: 'IPM' | 'Mitra Kalibrasi' | 'Rumah Sakit / Perusahaan';
  alamat: string | null;
  telepon: string | null;
  email: string | null;
}

interface EditCompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
}

export function EditCompanyModal({ open, onOpenChange, company }: EditCompanyModalProps) {
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [companyType, setCompanyType] = useState<'IPM' | 'Mitra Kalibrasi' | 'Rumah Sakit / Perusahaan'>('Rumah Sakit / Perusahaan');
  const [alamat, setAlamat] = useState("");
  const [telepon, setTelepon] = useState("");
  const [email, setEmail] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Populate form when company changes
  useEffect(() => {
    if (company && open) {
      setNamaPerusahaan(company.nama_perusahaan);
      setCompanyType(company.company_type);
      setAlamat(company.alamat || "");
      setTelepon(company.telepon || "");
      setEmail(company.email || "");
    }
  }, [company, open]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (companyData: {
      id: string;
      nama_perusahaan: string;
      company_type: string;
      alamat: string;
      telepon: string;
      email: string;
    }) => {
      const { data, error } = await supabase
        .from('tenants')
        .update({
          nama_perusahaan: companyData.nama_perusahaan,
          name: companyData.nama_perusahaan, // Keep legacy name field
          company_type: companyData.company_type as any,
          alamat: companyData.alamat || null,
          address: companyData.alamat || null, // Keep legacy address field
          telepon: companyData.telepon || null,
          phone: companyData.telepon || null, // Keep legacy phone field
          email: companyData.email || null,
          type: companyData.company_type === 'Rumah Sakit / Perusahaan' ? 'rumah_sakit' : 'perusahaan'
        })
        .eq('id', companyData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Perusahaan berhasil diperbarui" });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Gagal memperbarui perusahaan", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!company) return;
    
    if (!namaPerusahaan.trim()) {
      toast({ 
        title: "Error", 
        description: "Nama perusahaan harus diisi",
        variant: "destructive"
      });
      return;
    }

    updateCompanyMutation.mutate({
      id: company.id,
      nama_perusahaan: namaPerusahaan.trim(),
      company_type: companyType,
      alamat: alamat.trim(),
      telepon: telepon.trim(),
      email: email.trim()
    });
  };

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Perusahaan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="namaPerusahaan">Nama Perusahaan *</Label>
            <Input
              id="namaPerusahaan"
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
              placeholder="Masukkan nama perusahaan"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyType">Tipe Perusahaan *</Label>
            <Select value={companyType} onValueChange={(value: any) => setCompanyType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe perusahaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IPM">IPM</SelectItem>
                <SelectItem value="Mitra Kalibrasi">Mitra Kalibrasi</SelectItem>
                <SelectItem value="Rumah Sakit / Perusahaan">Rumah Sakit / Perusahaan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              placeholder="Masukkan alamat perusahaan"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telepon">Telepon</Label>
            <Input
              id="telepon"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="Masukkan nomor telepon"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email perusahaan"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={updateCompanyMutation.isPending}
            >
              {updateCompanyMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}