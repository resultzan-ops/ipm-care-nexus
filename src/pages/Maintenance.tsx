import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  CalendarDays, 
  Search, 
  Filter,
  Plus,
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Pencil,
  Trash2,
  Eye,
  Building2
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { AddMaintenanceModal } from "@/components/maintenance/add-maintenance-modal";
import { EditMaintenanceModal } from "@/components/maintenance/edit-maintenance-modal";
import { TechnicianDetailPopup } from "@/components/popups/technician-detail-popup";
import { HospitalDetailPopup } from "@/components/popups/hospital-detail-popup";

export default function Maintenance() {
  const { profile } = useAuth();
  const userRole = (profile?.role as any) || "teknisi";
  const tenantName = "RS Umum Daerah Bantul";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [technicianFilter, setTechnicianFilter] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [technicianPopupOpen, setTechnicianPopupOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [hospitalPopupOpen, setHospitalPopupOpen] = useState(false);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  // Check if user can manage schedules
  const canManage = ['super_admin', 'spv', 'spv_rs'].includes(userRole);

  // Fetch technicians for filtering
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id, 
          name, 
          role,
          tenants(id, name, type)
        `)
        .in('role', ['teknisi', 'teknisi_rs'])
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  // Fetch hospitals/companies for filtering
  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospitals-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, type')
        .order('name');
      if (error) throw error;
      return data;
    }
  });
  const { data: pmSchedules = [], isLoading } = useQuery({
    queryKey: ['pm_schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pm_schedules')
        .select(`
          *,
          equipment(name, location),
          profiles!pm_schedules_assigned_to_fkey(name),
          created_by_profile:profiles!pm_schedules_created_by_fkey(name),
          equipment!inner(tenants(id, name, type))
        `)
        .order('scheduled_date', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredMaintenance = pmSchedules.filter(item => {
    const matchesSearch = 
      (item.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.equipment?.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (item.equipment?.tenants?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = !statusFilter || statusFilter === "all" || item.status === statusFilter;
    const matchesPriority = !priorityFilter || priorityFilter === "all" || item.priority.toString() === priorityFilter;
    const matchesTechnician = !technicianFilter || technicianFilter === "all" || item.assigned_to === technicianFilter;
    const matchesHospital = !hospitalFilter || hospitalFilter === "all" || item.equipment?.tenants?.id === hospitalFilter;
    const matchesDate = !selectedDate || 
                       format(new Date(item.scheduled_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTechnician && matchesHospital && matchesDate;
  });

  const deleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from('pm_schedules')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Success", description: "Maintenance schedule deleted" });
      queryClient.invalidateQueries({ queryKey: ['pm_schedules'] });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'warning';  
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'destructive'; // High
      case 2: return 'warning';     // Medium
      case 1: return 'secondary';   // Low
      default: return 'secondary';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'HIGH';
      case 2: return 'MEDIUM';
      case 1: return 'LOW';
      default: return 'LOW';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const statusCounts = {
    pending: pmSchedules.filter(item => item.status === 'pending').length,
    in_progress: pmSchedules.filter(item => item.status === 'in_progress').length,
    completed: pmSchedules.filter(item => item.status === 'completed').length,
    cancelled: pmSchedules.filter(item => item.status === 'cancelled').length,
  };

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Schedule</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all equipment maintenance activities
            </p>
          </div>
          <Button 
            variant="medical" 
            className="gap-2"
            onClick={() => setAddModalOpen(true)}
            disabled={!canManage}
          >
            <Plus className="h-4 w-4" />
            Schedule Maintenance
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Clock className="h-4 w-4 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{statusCounts.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Wrench className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{statusCounts.in_progress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{statusCounts.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cancelled</p>
                  <p className="text-2xl font-bold">{statusCounts.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search by equipment, technician, or location..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 flex-wrap">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="3">High</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="1">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Technicians</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.user_id} value={tech.user_id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hospitals</SelectItem>
                  {hospitals.map((hospital) => (
                    <SelectItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-40 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Button 
                variant="outline" 
                size="icon"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setTechnicianFilter("all");
                setHospitalFilter("all");
                setSelectedDate(undefined);
              }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Maintenance Schedule List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading maintenance schedules...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMaintenance.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{item.equipment?.name || 'Unknown Equipment'}</h3>
                        <Badge variant={getStatusColor(item.status) as any} className="gap-1">
                          {getStatusIcon(item.status)}
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant={getPriorityColor(item.priority) as any}>
                          {getPriorityLabel(item.priority)} PRIORITY
                        </Badge>
                      </div>
                      
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                         <div className="flex items-center gap-2">
                           <CalendarDays className="h-4 w-4 text-muted-foreground" />
                           <div>
                             <p className="text-muted-foreground">Scheduled</p>
                             <p className="font-medium">{format(new Date(item.scheduled_date), "PPP")}</p>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-2">
                           <User className="h-4 w-4 text-muted-foreground" />
                           <div>
                             <p className="text-muted-foreground">Assigned To</p>
                             <button 
                               className="font-medium text-primary hover:underline text-left"
                               onClick={() => {
                                 if (item.assigned_to) {
                                   setSelectedTechnicianId(item.assigned_to);
                                   setTechnicianPopupOpen(true);
                                 }
                               }}
                             >
                               {item.profiles?.name || 'Unassigned'}
                             </button>
                           </div>
                         </div>

                         <div className="flex items-center gap-2">
                           <Building2 className="h-4 w-4 text-muted-foreground" />
                           <div>
                             <p className="text-muted-foreground">Hospital/Company</p>
                             <button 
                               className="font-medium text-primary hover:underline text-left"
                               onClick={() => {
                                 if (item.equipment?.tenants?.id) {
                                   setSelectedHospitalId(item.equipment.tenants.id);
                                   setHospitalPopupOpen(true);
                                 }
                               }}
                             >
                               {item.equipment?.tenants?.name || 'Unknown'}
                             </button>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-2">
                           <Clock className="h-4 w-4 text-muted-foreground" />
                           <div>
                             <p className="text-muted-foreground">Frequency</p>
                             <p className="font-medium">{item.frequency_months} months</p>
                           </div>
                         </div>
                         
                         <div className="flex items-center gap-2">
                           <Wrench className="h-4 w-4 text-muted-foreground" />
                           <div>
                             <p className="text-muted-foreground">Created By</p>
                             <p className="font-medium">{item.created_by_profile?.name || 'Unknown'}</p>
                           </div>
                         </div>
                       </div>
                      
                      <div className="text-sm text-muted-foreground">
                        Location: {item.equipment?.location || 'Unknown'} 
                        {item.notes && ` • Notes: ${item.notes}`}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      {canManage && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-1"
                            onClick={() => {
                              setSelectedSchedule(item);
                              setEditModalOpen(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-1 text-destructive">
                                <Trash2 className="h-3 w-3" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete maintenance schedule?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. The maintenance schedule will be permanently deleted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSchedule(item.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredMaintenance.length === 0 && !isLoading && (
          <Card className="p-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No maintenance schedules found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
              setTechnicianFilter("all");
              setHospitalFilter("all");
              setSelectedDate(undefined);
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
        
        <AddMaintenanceModal 
          open={addModalOpen} 
          onOpenChange={setAddModalOpen} 
        />
        <EditMaintenanceModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          schedule={selectedSchedule}
        />
        <TechnicianDetailPopup
          open={technicianPopupOpen}
          onOpenChange={setTechnicianPopupOpen}
          technicianId={selectedTechnicianId}
        />
        <HospitalDetailPopup
          open={hospitalPopupOpen}
          onOpenChange={setHospitalPopupOpen}
          hospitalId={selectedHospitalId}
        />
      </div>
    </DashboardLayout>
  );
}