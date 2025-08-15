import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, Mail, MapPin, Calendar, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TechnicianDetailPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  technicianId: string | null;
}

export function TechnicianDetailPopup({ open, onOpenChange, technicianId }: TechnicianDetailPopupProps) {
  const { data: technician, isLoading } = useQuery({
    queryKey: ['technician-detail', technicianId],
    queryFn: async () => {
      if (!technicianId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants!profiles_company_id_fkey(nama_perusahaan, company_type)
        `)
        .eq('user_id', technicianId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!technicianId && open
  });

  // Get technician's recent maintenance activities
  const { data: recentActivities = [] } = useQuery({
    queryKey: ['technician-activities', technicianId],
    queryFn: async () => {
      if (!technicianId) return [];
      
      const { data, error } = await supabase
        .from('pm_schedules')
        .select(`
          id,
          scheduled_date,
          status,
          equipment(name, location)
        `)
        .eq('assigned_to', technicianId)
        .order('scheduled_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!technicianId && open
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'teknisi': return 'Technician';
      case 'teknisi_rs': return 'Hospital Technician';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Technician Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading technician details...</div>
          </div>
        ) : technician ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{technician.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getRoleLabel(technician.role)}
                      </Badge>
                      <Badge variant={technician.is_active ? "default" : "destructive"}>
                        {technician.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {technician.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{technician.phone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {new Date(technician.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {technician.tenants && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{technician.tenants?.nama_perusahaan}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wrench className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">Recent Maintenance Activities</h4>
                </div>

                {recentActivities.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{activity.equipment?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.equipment?.location} • {new Date(activity.scheduled_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(activity.status) as any}>
                          {activity.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent maintenance activities
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Technician details not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}