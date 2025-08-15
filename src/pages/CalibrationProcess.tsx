import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Eye, RefreshCw, Upload, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationSystem } from "@/components/notifications/notification-system";
import { useToast } from "@/hooks/use-toast";

// Mock data for calibration processes
const mockProcesses = [
  {
    id: "PROC-001",
    hospitalName: "RS Siloam Jakarta",
    tenantId: "T-001",
    calibratorName: "PT. Kalibrasi Medis Indonesia",
    calibratorType: "company",
    startDate: "2024-01-20",
    estimatedCompletion: "2024-01-25",
    status: "in_progress",
    progress: 60,
    equipmentCount: 5,
    equipment: [
      { id: "EQ-001", name: "MRI Scanner", status: "completed", completedDate: "2024-01-22" },
      { id: "EQ-002", name: "CT Scanner", status: "in_progress", startedDate: "2024-01-23" },
      { id: "EQ-003", name: "Ultrasound", status: "pending", scheduledDate: "2024-01-24" }
    ]
  },
  {
    id: "PROC-002",
    hospitalName: "RS Harapan Kita", 
    tenantId: "T-002",
    calibratorName: "Ahmad Teknisi",
    calibratorType: "technician",
    startDate: "2024-01-18",
    estimatedCompletion: "2024-01-22",
    status: "waiting_results",
    progress: 90,
    equipmentCount: 3,
    equipment: [
      { id: "EQ-004", name: "X-Ray", status: "completed", completedDate: "2024-01-21" },
      { id: "EQ-005", name: "ECG Machine", status: "completed", completedDate: "2024-01-21" }
    ]
  },
  {
    id: "PROC-003",
    hospitalName: "RS Cipto Mangunkusumo",
    tenantId: "T-003", 
    calibratorName: "Lab Kalibrasi Nasional",
    calibratorType: "company",
    startDate: "2024-01-15",
    estimatedCompletion: "2024-01-20",
    status: "completed",
    progress: 100,
    equipmentCount: 4,
    completedDate: "2024-01-19",
    equipment: [
      { id: "EQ-006", name: "Blood Analyzer", status: "completed", completedDate: "2024-01-19" },
      { id: "EQ-007", name: "Ventilator", status: "completed", completedDate: "2024-01-19" }
    ]
  }
];

export default function CalibrationProcess() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcess, setSelectedProcess] = useState<any>(null);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  // Filter processes based on user role and permissions
  const filteredProcesses = mockProcesses.filter(process => {
    // Role-based filtering
    if (profile?.role === 'admin_rs' && process.tenantId !== profile.tenant_id) {
      return false;
    }
    if (profile?.role === 'kalibrator') {
      // Kalibrator hanya melihat yang ditugaskan kepadanya
      // Untuk demo, asumsikan kalibrator bisa melihat semua company type
      if (process.calibratorType !== 'company') {
        return false;
      }
    }
    if (profile?.role === 'teknisi') {
      // Teknisi hanya melihat yang ditugaskan kepadanya  
      if (process.calibratorType !== 'technician') {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && process.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm && !process.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Berjalan</Badge>;
      case "waiting_results":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Menunggu Hasil</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Selesai</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canUpdateStatus = () => {
    return profile?.role === 'kalibrator' || profile?.role === 'teknisi' || 
           profile?.role === 'super_admin' || profile?.role === 'spv' || profile?.role === 'admin_kalibrasi';
  };

  const canManageSchedule = () => {
    return profile?.role === 'super_admin' || profile?.role === 'spv' || profile?.role === 'admin_kalibrasi';
  };

  const handleUpdateStatus = () => {
    if (!newStatus) {
      toast({
        title: "Error",
        description: "Pilih status baru terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Berhasil",
      description: "Status proses kalibrasi berhasil diperbarui"
    });
    
    setUpdateStatusOpen(false);
    setNewStatus("");
    setStatusNote("");
  };

  return (
    <DashboardLayout>
      <NotificationSystem />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Proses Kalibrasi</h1>
            <p className="text-muted-foreground">Monitor dan kelola proses kalibrasi yang sedang berjalan</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Berjalan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Hasil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">1</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama rumah sakit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="waiting">Menunggu</SelectItem>
                  <SelectItem value="in_progress">Berjalan</SelectItem>
                  <SelectItem value="waiting_results">Menunggu Hasil</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Processes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Proses Kalibrasi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rumah Sakit / Perusahaan</TableHead>
                  <TableHead>Kalibrator</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.hospitalName}</TableCell>
                    <TableCell>{process.calibratorName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Mulai: {process.startDate}</div>
                        <div>Estimasi: {process.estimatedCompletion}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${process.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{process.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(process.status)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedProcess(process)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detail Proses Kalibrasi - {process.hospitalName}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="text-sm font-medium">Kalibrator</label>
                                <p>{process.calibratorName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Tanggal Mulai</label>
                                <p>{process.startDate}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Estimasi Selesai</label>
                                <p>{process.estimatedCompletion}</p>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Daftar Alat yang Dikalibrasi</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nama Alat</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {process.equipment.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>
                                        <Badge variant={item.status === 'completed' ? 'default' : 
                                                      item.status === 'in_progress' ? 'secondary' : 'outline'}>
                                          {item.status === 'completed' ? 'Selesai' : 
                                           item.status === 'in_progress' ? 'Berjalan' : 'Menunggu'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {item.completedDate || item.startedDate || item.scheduledDate || '-'}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            {canUpdateStatus() && (
                              <div className="pt-4 border-t">
                                <div className="flex gap-2">
                                  <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
                                    <DialogTrigger asChild>
                                      <Button>
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Update Status
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Update Status Proses</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium">Status Baru</label>
                                          <Select value={newStatus} onValueChange={setNewStatus}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Pilih status baru" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="waiting">Menunggu</SelectItem>
                                              <SelectItem value="in_progress">Berjalan</SelectItem>
                                              <SelectItem value="waiting_results">Menunggu Hasil</SelectItem>
                                              <SelectItem value="completed">Selesai</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        <div>
                                          <label className="text-sm font-medium">Catatan</label>
                                          <Textarea 
                                            placeholder="Tambahkan catatan tentang update status..."
                                            value={statusNote}
                                            onChange={(e) => setStatusNote(e.target.value)}
                                          />
                                        </div>
                                        
                                        <div className="flex gap-2">
                                          <Button onClick={handleUpdateStatus}>Simpan</Button>
                                          <Button variant="outline" onClick={() => setUpdateStatusOpen(false)}>
                                            Batal
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  
                                  {process.status === 'completed' && (
                                    <Button variant="outline">
                                      <Upload className="h-4 w-4 mr-2" />
                                      Upload Sertifikat
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}