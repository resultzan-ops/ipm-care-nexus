import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function PromoteSuperAdmin() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const targetEmail = "dayax19@gmail.com";

  const promote = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      console.log('Promoting user:', { id: user.id, email: user.email });
      
      // Call edge function for promotion
      const { data, error } = await supabase.functions.invoke('promote-super-admin', {
        body: { 
          user_id: user.id, 
          email: user.email 
        }
      });

      console.log('Promotion response:', { data, error });

      if (error) throw new Error(error.message || 'Failed to promote user');
      if (!data?.success) throw new Error(data?.error || 'Promotion failed');

      toast({ title: "Berhasil", description: "Akun Anda sekarang super_admin" });
      
      // Force refresh auth state after delay
      setTimeout(() => {
        window.location.href = '/users';
      }, 2000);
      
    } catch (error: any) {
      console.error('Promotion error:', error);
      toast({ 
        title: "Gagal mempromosikan", 
        description: `Error: ${error.message}`,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const canPromote = !!user && user.email?.toLowerCase() === targetEmail.toLowerCase();

  return (
    <DashboardLayout userRole={(profile?.role as any) || "operator_klien"} tenantName="IPM Care Nexus">
      <div className="max-w-xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Promote Super Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user ? (
              <p className="text-muted-foreground">Silakan login terlebih dahulu.</p>
            ) : canPromote ? (
              <>
                <p>Anda login sebagai <b>{user.email}</b>. Klik tombol di bawah untuk menjadikan akun ini sebagai <b>super_admin</b>.</p>
                <Button onClick={promote} disabled={loading} className="gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Jadikan Super Admin
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Halaman ini hanya untuk <b>{targetEmail}</b>.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
