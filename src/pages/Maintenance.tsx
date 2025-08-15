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
  User
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Mock maintenance data
const maintenanceSchedule = [
  {
    id: "1",
    equipment_name: "MRI Machine Siemens",
    equipment_id: "1",
    location: "Radiology Room 1",
    scheduled_date: new Date("2024-03-15"),
    type: "Preventive Maintenance",
    priority: "high",
    status: "scheduled",
    technician: "Ahmad Hidayat",
    duration: "4 hours",
    last_maintenance: "2024-01-15"
  },
  {
    id: "2",
    equipment_name: "Ultrasound GE",
    equipment_id: "2", 
    location: "Emergency Room",
    scheduled_date: new Date("2024-03-18"),
    type: "Repair",
    priority: "high",
    status: "in_progress",
    technician: "Siti Nurhaliza",
    duration: "2 hours",
    last_maintenance: "2023-12-28"
  },
  {
    id: "3",
    equipment_name: "X-Ray Digital",
    equipment_id: "3",
    location: "X-Ray Room A", 
    scheduled_date: new Date("2024-03-20"),
    type: "Preventive Maintenance",
    priority: "medium",
    status: "scheduled",
    technician: "Budi Santoso",
    duration: "3 hours",
    last_maintenance: "2024-02-05"
  },
  {
    id: "4",
    equipment_name: "CT Scan Philips",
    equipment_id: "4",
    location: "CT Room 1",
    scheduled_date: new Date("2024-03-22"),
    type: "Calibration Check",
    priority: "medium",
    status: "completed",
    technician: "Ahmad Hidayat",
    duration: "2 hours",
    last_maintenance: "2024-01-20"
  }
];

const technicians = [
  "Ahmad Hidayat",
  "Siti Nurhaliza", 
  "Budi Santoso",
  "Dewi Sartika",
  "Andi Wijaya"
];

export default function Maintenance() {
  const userRole = "owner";
  const tenantName = "RS Umum Daerah Bantul";
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();

  const filteredMaintenance = maintenanceSchedule.filter(item => {
    const matchesSearch = item.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesPriority = !priorityFilter || item.priority === priorityFilter;
    const matchesDate = !selectedDate || 
                       format(item.scheduled_date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
    
    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'secondary';
      case 'in_progress': return 'warning';  
      case 'completed': return 'success';
      case 'overdue': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Wrench className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const statusCounts = {
    scheduled: maintenanceSchedule.filter(item => item.status === 'scheduled').length,
    in_progress: maintenanceSchedule.filter(item => item.status === 'in_progress').length,
    completed: maintenanceSchedule.filter(item => item.status === 'completed').length,
    overdue: maintenanceSchedule.filter(item => item.status === 'overdue').length,
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
          <Button variant="medical" className="gap-2">
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
                  <p className="text-sm text-muted-foreground">Scheduled</p>
                  <p className="text-2xl font-bold">{statusCounts.scheduled}</p>
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
                <div className="p-2 bg-danger/10 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-danger" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{statusCounts.overdue}</p>
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
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
                  setStatusFilter("");
                  setPriorityFilter("");
                  setSelectedDate(undefined);
                }}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Maintenance Schedule List */}
        <div className="space-y-4">
          {filteredMaintenance.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{item.equipment_name}</h3>
                      <Badge variant={getStatusColor(item.status) as any} className="gap-1">
                        {getStatusIcon(item.status)}
                        {item.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant={getPriorityColor(item.priority) as any}>
                        {item.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Scheduled</p>
                          <p className="font-medium">{format(item.scheduled_date, "PPP")}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Technician</p>
                          <p className="font-medium">{item.technician}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium">{item.duration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <p className="font-medium">{item.type}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Location: {item.location} • Last maintenance: {item.last_maintenance}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {item.status === 'scheduled' && (
                      <Button variant="medical" size="sm">
                        Start Work
                      </Button>
                    )}
                    {item.status === 'in_progress' && (
                      <Button variant="success" size="sm">
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaintenance.length === 0 && (
          <Card className="p-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No maintenance schedules found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("");
              setPriorityFilter("");
              setSelectedDate(undefined);
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}