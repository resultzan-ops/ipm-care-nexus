import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Plus, Search, CheckSquare, Clock, Calendar, User, Building, Eye } from "lucide-react";
import { format } from "date-fns";
import { AppRole } from "@/lib/permissions";

const taskFormSchema = z.object({
  equipment_id: z.string().min(1, "Equipment harus dipilih"),
  assigned_to: z.string().min(1, "Kalibrator harus dipilih"),
  scheduled_date: z.string().min(1, "Tanggal harus dipilih"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type TaskFormData = z.infer<typeof taskFormSchema>;

interface CalibrationTask {
  id: string;
  equipment_id: string;
  assigned_to: string;
  scheduled_date: string;
  status: "pending" | "approved" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  description?: string;
  approved_by?: string;
  approved_at?: string;
  completed_at?: string;
  created_at: string;
  equipment?: {
    name: string;
    location: string;
    tenants?: {
      nama_perusahaan: string;
    };
  };
  assigned_technician?: {
    nama_lengkap: string;
  };
  approver?: {
    nama_lengkap: string;
  };
}

interface Equipment {
  id: string;
  name: string;
  location: string;
  tenants: {
    nama_perusahaan: string;
  };
}

interface Technician {
  user_id: string;
  nama_lengkap: string;
}

export default function Tasks() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      priority: "medium",
    },
  });

  // Determine user role and access
  const userRole = profile?.role as string;
  const isKalibrator = userRole === "kalibrator";
  const canCreateTasks = ["super_admin", "admin_kalibrasi"].includes(userRole);

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["calibration-tasks", profile?.user_id],
    queryFn: async () => {
      let query = supabase
        .from("pm_schedules") // Using existing maintenance schedule table for tasks
        .select(`
          *,
          equipment (
            name,
            location,
            tenants (
              nama_perusahaan
            )
          ),
          profiles!pm_schedules_assigned_to_fkey (
            nama_lengkap
          ),
          created_by_profile:profiles!pm_schedules_created_by_fkey (
            nama_lengkap
          )
        `)
        .order("scheduled_date", { ascending: true });

      // If kalibrator, only show their tasks
      if (isKalibrator && profile?.user_id) {
        query = query.eq("assigned_to", profile.user_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform data to match CalibrationTask interface
      const transformedData = data?.map(item => ({
        ...item,
        priority: item.priority === 1 ? "low" : item.priority === 2 ? "medium" : "high",
        assigned_technician: item.profiles,
      })) || [];
      
      return transformedData as CalibrationTask[];
    },
    enabled: !!profile?.user_id,
  });

  // Fetch equipment for task creation
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment-for-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select(`
          id,
          name,
          location,
          tenants (
            nama_perusahaan
          )
        `)
        .eq("status", "active");

      if (error) throw error;
      return data as Equipment[];
    },
    enabled: canCreateTasks,
  });

  // Fetch technicians (kalibrator role)
  const { data: technicians = [] } = useQuery({
    queryKey: ["kalibrator-technicians"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, nama_lengkap")
        .eq("role", "kalibrator")
        .eq("is_active", true);

      if (error) throw error;
      return data as Technician[];
    },
    enabled: canCreateTasks,
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: TaskFormData) => {
      const { data, error } = await supabase
        .from("pm_schedules")
        .insert({
          equipment_id: taskData.equipment_id,
          assigned_to: taskData.assigned_to,
          scheduled_date: taskData.scheduled_date,
          description: taskData.description,
          status: "pending",
          created_by: profile?.user_id,
          task_type: "calibration",
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calibration-tasks"] });
      setDialogOpen(false);
      form.reset();
      toast.success("Task berhasil dibuat");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      const updateData: any = { status };
      
      if (status === "approved") {
        updateData.approved_by = profile?.user_id;
        updateData.approved_at = new Date().toISOString();
      }
      
      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("pm_schedules")
        .update(updateData)
        .eq("id", taskId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calibration-tasks"] });
      toast.success("Status task berhasil diupdate");
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assigned_technician?.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    
    const labels = {
      pending: "Pending",
      approved: "Approved",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-red-100 text-red-800",
    };
    
    const labels = {
      low: "Low",
      medium: "Medium", 
      high: "High",
    };
    
    return (
      <Badge className={variants[priority as keyof typeof variants]}>
        {labels[priority as keyof typeof labels]}
      </Badge>
    );
  };

  const getStatistics = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === "pending").length;
    const approved = tasks.filter(t => t.status === "approved").length;
    const completed = tasks.filter(t => t.status === "completed").length;
    
    return { total, pending, approved, completed };
  };

  const stats = getStatistics();

  return (
    <DashboardLayout userRole={userRole as AppRole} tenantName="IPM System">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isKalibrator ? "My Calibration Tasks" : "Task / Jadwal Kalibrasi"}
            </h1>
            <p className="text-muted-foreground">
              {isKalibrator 
                ? "Lihat dan kelola jadwal kalibrasi yang ditugaskan kepada Anda"
                : "Kelola jadwal dan assignment kalibrasi equipment"
              }
            </p>
          </div>
          {canCreateTasks && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Task Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buat Task Kalibrasi Baru</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="equipment_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipment</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih equipment" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {equipment.map((eq) => (
                                  <SelectItem key={eq.id} value={eq.id}>
                                    {eq.name} - {eq.location}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="assigned_to"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assign ke Kalibrator</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih kalibrator" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {technicians.map((tech) => (
                                  <SelectItem key={tech.user_id} value={tech.user_id}>
                                    {tech.nama_lengkap}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="scheduled_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tanggal Jadwal</FormLabel>
                            <FormControl>
                              <Input {...field} type="datetime-local" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deskripsi</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Detail pekerjaan kalibrasi..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setDialogOpen(false);
                          form.reset();
                        }}
                      >
                        Batal
                      </Button>
                      <Button type="submit" disabled={createTaskMutation.isPending}>
                        {createTaskMutation.isPending ? "Membuat..." : "Buat Task"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari equipment atau technician..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Tasks</CardTitle>
            <CardDescription>
              Total {filteredTasks.length} tasks ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Scheduled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Perusahaan</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <CheckSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p>Tidak ada tasks ditemukan</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{task.equipment?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {task.equipment?.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          {task.assigned_technician?.nama_lengkap}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {format(new Date(task.scheduled_date), "dd MMM yyyy HH:mm", { locale: id })}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        {task.equipment?.tenants ? (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                            {task.equipment.tenants.nama_perusahaan}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {/* Actions based on role and status */}
                          {canCreateTasks && task.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTaskStatusMutation.mutate({ 
                                taskId: task.id, 
                                status: "approved" 
                              })}
                            >
                              Approve
                            </Button>
                          )}
                          {isKalibrator && task.status === "approved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTaskStatusMutation.mutate({ 
                                taskId: task.id, 
                                status: "in_progress" 
                              })}
                            >
                              Start
                            </Button>
                          )}
                          {isKalibrator && task.status === "in_progress" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateTaskStatusMutation.mutate({ 
                                taskId: task.id, 
                                status: "completed" 
                              })}
                            >
                              Complete
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}