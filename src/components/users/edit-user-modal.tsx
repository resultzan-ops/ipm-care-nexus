import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    phone: string | null;
    role: string;
    is_active: boolean;
  } | null;
}

type AppRole =
  | "teknisi"
  | "operator"
  | "super_admin"
  | "spv"
  | "admin_kalibrasi"
  | "kalibrator"
  | "admin_rs"
  | "spv_rs"
  | "operator_rs"
  | "teknisi_rs"
  | "admin_tenant";

export function EditUserModal({ open, onOpenChange, user }: EditUserModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<AppRole>("teknisi");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
      setRole(user.role ?? "teknisi");
      setIsActive(!!user.is_active);
    }
  }, [open, user]);

  const onSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        phone: phone || null,
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
            <Label htmlFor="name">Nama</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Peran</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin_rs">Admin RS</SelectItem>
                <SelectItem value="admin_tenant">Administrator</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="operator_rs">Operator RS</SelectItem>
                <SelectItem value="spv_rs">SPV RS</SelectItem>
                <SelectItem value="kalibrator">Kalibrator</SelectItem>
                <SelectItem value="admin_kalibrasi">Admin Kalibrasi</SelectItem>
                <SelectItem value="teknisi">Teknisi</SelectItem>
                <SelectItem value="teknisi_rs">Teknisi RS</SelectItem>
                <SelectItem value="spv">SPV</SelectItem>
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
