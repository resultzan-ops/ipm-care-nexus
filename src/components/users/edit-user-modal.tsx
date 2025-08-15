import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface Profile {
  id: string;
  nama_lengkap: string;
  no_hp: string | null;
  role: 'super_admin' | 'admin_mitra' | 'teknisi_mitra' | 'admin_klien' | 'operator_klien';
  is_active: boolean;
}

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile | null;
}

type AppRole = 'super_admin' | 'admin_mitra' | 'teknisi_mitra' | 'admin_klien' | 'operator_klien';

export function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [namaLengkap, setNamaLengkap] = useState("");
  const [noHp, setNoHp] = useState<string>("");
  const [role, setRole] = useState<AppRole>("operator_klien");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setNamaLengkap(user.nama_lengkap ?? "");
      setNoHp(user.no_hp ?? "");
      setRole(user.role);
      setIsActive(!!user.is_active);
    }
  }, [open, user]);

  const onSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        nama_lengkap: namaLengkap,
        no_hp: noHp || null,
        role: role as any,
        is_active: isActive,
      })
      .eq("id", user.id);

    setLoading(false);
    if (error) {
      toast({ title: "Gagal menyimpan", description: error.message });
      return;
    }
    toast({ title: "Perubahan disimpan" });
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Perbarui data pengguna.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="namaLengkap">Nama Lengkap</Label>
            <Input id="namaLengkap" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="noHp">Nomor HP</Label>
            <Input id="noHp" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Peran</Label>
            <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin_mitra">Admin Mitra</SelectItem>
                <SelectItem value="teknisi_mitra">Teknisi Mitra</SelectItem>
                <SelectItem value="admin_klien">Admin Klien</SelectItem>
                <SelectItem value="operator_klien">Operator Klien</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Aktif</Label>
            <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button onClick={onSave} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}