import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";

interface EditMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: {
    id: string;
    equipment_id: string;
    scheduled_date: string;
    frequency_months: number;
    assigned_to: string | null;
    priority: number;
    notes: string | null;
    status: string;
  } | null;
}

export function EditMaintenanceModal({ open, onOpenChange, schedule }: EditMaintenanceModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const [equipmentId, setEquipmentId] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [frequencyMonths, setFrequencyMonths] = useState("3");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("1");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  // Populate form when schedule changes
  useEffect(() => {
    if (open && schedule) {
      setEquipmentId(schedule.equipment_id);
      setScheduledDate(new Date(schedule.scheduled_date));
      setFrequencyMonths(schedule.frequency_months.toString());
      setAssignedTo(schedule.assigned_to || "");
      setPriority(schedule.priority.toString());
      setNotes(schedule.notes || "");
      setStatus(schedule.status);
    }
  }, [open, schedule]);

  // Fetch equipment list with hospital/company info
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id, 
          name, 
          location,
          tenants(id, name, type)
        `)
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  // Fetch technicians for assignment with hospital/company info
  const { data: technicians = [] } = useQuery({
    queryKey: ['technicians'],
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

  const onSubmit = async () => {
    if (!schedule || !equipmentId || !scheduledDate) {
      toast({ title: "Error", description: "Please fill all required fields" });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('pm_schedules')
      .update({
        equipment_id: equipmentId,
        scheduled_date: format(scheduledDate, 'yyyy-MM-dd'),
        frequency_months: parseInt(frequencyMonths),
        assigned_to: assignedTo || null,
        priority: parseInt(priority),
        notes: notes || null,
        status: status as any
      })
      .eq('id', schedule.id);

    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    toast({ title: "Success", description: "Maintenance schedule updated successfully" });
    queryClient.invalidateQueries({ queryKey: ['pm_schedules'] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Maintenance Schedule</DialogTitle>
          <DialogDescription>Update the maintenance schedule details.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="equipment">Equipment *</Label>
            <Select value={equipmentId} onValueChange={setEquipmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - {item.location} ({item.tenants?.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Scheduled Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Frequency (Months)</Label>
            <Select value={frequencyMonths} onValueChange={setFrequencyMonths}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Month</SelectItem>
                <SelectItem value="3">3 Months</SelectItem>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assigned">Assign To</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician (optional)" />
              </SelectTrigger>
              <SelectContent>
                {technicians.map((tech) => (
                  <SelectItem key={tech.user_id} value={tech.user_id}>
                    {tech.name} - {tech.role === 'teknisi_rs' ? tech.tenants?.name : 'General'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Low</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for this maintenance..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Updating..." : "Update Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}