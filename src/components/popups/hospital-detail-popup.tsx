import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Phone, Mail, MapPin, Calendar, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HospitalDetailPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospitalId: string | null;
}

export function HospitalDetailPopup({ open, onOpenChange, hospitalId }: HospitalDetailPopupProps) {
  const { data: hospital, isLoading } = useQuery({
    queryKey: ['hospital-detail', hospitalId],
    queryFn: async () => {
      if (!hospitalId) return null;
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', hospitalId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId && open
  });

  // Get hospital's equipment count
  const { data: equipmentStats } = useQuery({
    queryKey: ['hospital-equipment-stats', hospitalId],
    queryFn: async () => {
      if (!hospitalId) return null;
      
      const { data, error } = await supabase
        .from('equipment')
        .select('status')
        .eq('tenant_id', hospitalId);
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        active: data.filter(e => e.status === 'active').length,
        maintenance: data.filter(e => e.status === 'maintenance').length,
        inactive: data.filter(e => e.status === 'inactive').length
      };
      
      return stats;
    },
    enabled: !!hospitalId && open
  });

  // Get recent maintenance activities for this hospital
  const { data: recentActivities = [] } = useQuery({
    queryKey: ['hospital-maintenance-activities', hospitalId],
    queryFn: async () => {
      if (!hospitalId) return [];
      
      const { data, error } = await supabase
        .from('pm_schedules')
        .select(`
          id,
          scheduled_date,
          status,
          equipment!inner(name, location, tenant_id)
        `)
        .eq('equipment.tenant_id', hospitalId)
        .order('scheduled_date', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!hospitalId && open
  });

  const getTenantTypeLabel = (type: string) => {
    switch (type) {
      case 'hospital': return 'Hospital';
      case 'clinic': return 'Clinic';
      case 'company': return 'Company';
      default: return type;
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
            <Building2 className="h-5 w-5" />
            Hospital/Company Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading details...</div>
          </div>
        ) : hospital ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{hospital.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getTenantTypeLabel(hospital.type)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {hospital.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{hospital.phone}</span>
                    </div>
                  )}
                  
                  {hospital.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{hospital.email}</span>
                    </div>
                  )}

                  {hospital.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{hospital.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Registered {new Date(hospital.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {hospital.contact && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Contact: {hospital.contact}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Statistics */}
            {equipmentStats && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold">Equipment Statistics</h4>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-secondary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{equipmentStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total Equipment</p>
                    </div>
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">{equipmentStats.active}</p>
                      <p className="text-sm text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{equipmentStats.maintenance}</p>
                      <p className="text-sm text-muted-foreground">Maintenance</p>
                    </div>
                    <div className="text-center p-3 bg-destructive/10 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{equipmentStats.inactive}</p>
                      <p className="text-sm text-muted-foreground">Inactive</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Maintenance Activities */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
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
            <p className="text-muted-foreground">Hospital/Company details not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}