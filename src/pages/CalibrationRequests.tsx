import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Eye, CheckCircle, X, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationSystem } from "@/components/notifications/notification-system";
import { useToast } from "@/hooks/use-toast";

// Mock data for calibration requests
const mockRequests = [
  {
    id: "REQ-001",
    hospitalName: "RS Siloam Jakarta",
    tenantId: "T-001",
    requestDate: "2024-01-15",
    status: "pending",
    equipmentCount: 5,
    equipment: [
      { id: "EQ-001", name: "MRI Scanner", brand: "Philips", model: "Ingenia 1.5T", serialNumber: "SN-001", location: "Radiology", status: "expired" },
      { id: "EQ-002", name: "CT Scanner", brand: "Siemens", model: "SOMATOM", serialNumber: "SN-002", location: "Radiology", status: "expiring_soon" }
    ]
  },
  {
    id: "REQ-002", 
    hospitalName: "RS Harapan Kita",
    tenantId: "T-002",
    requestDate: "2024-01-12",
    status: "approved",
    equipmentCount: 3,
    calibratorAssigned: "PT. Kalibrasi Medis Indonesia",
    equipment: [
      { id: "EQ-003", name: "Ultrasound", brand: "GE", model: "Logiq P9", serialNumber: "SN-003", location: "Emergency", status: "expired" }
    ]
  },
  {
    id: "REQ-003",
    hospitalName: "RS Cipto Mangunkusumo", 
    tenantId: "T-003",
    requestDate: "2024-01-10",
    status: "rejected",
    equipmentCount: 2,
    rejectionReason: "Dokumen tidak lengkap",
    equipment: [
      { id: "EQ-004", name: "X-Ray", brand: "Siemens", model: "Mobilett XP", serialNumber: "SN-004", location: "Emergency", status: "expired" }
    ]
  }
];

const mockCalibrators = [
  { id: "CAL-001", name: "PT. Kalibrasi Medis Indonesia", type: "company" },
  { id: "CAL-002", name: "Lab Kalibrasi Nasional", type: "company" },
  { id: "TEC-001", name: "Ahmad Teknisi", type: "technician" },
  { id: "TEC-002", name: "Budi Kalibrator", type: "technician" }
];

export default function CalibrationRequests() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedCalibrator, setSelectedCalibrator] = useState("");

  // Filter requests based on user role and permissions
  const filteredRequests = mockRequests.filter(request => {
    // Role-based filtering
    if (profile?.role === 'admin_rs' && request.tenantId !== profile.tenant_id) {
      return false;
    }
    if (profile?.role === 'kalibrator' && request.status !== 'approved') {
      return false;
    }
    if (profile?.role === 'teknisi') {
      return false; // Teknisi tidak memiliki akses
    }

    // Status filter
    if (statusFilter !== "all" && request.status !== statusFilter) {
      return false;
    }

    // Search filter
    if (searchTerm && !request.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="destructive">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canApproveReject = () => {
    return profile?.role === 'super_admin' || profile?.role === 'spv' || profile?.role === 'admin_kalibrasi';
  };

  const handleApprove = () => {
    if (!selectedCalibrator) {
      toast({
        title: "Error",
        description: "Pilih kalibrator terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Berhasil",
      description: "Permintaan kalibrasi telah disetujui"
    });
    
    setSelectedRequest(null);
    setSelectedCalibrator("");
  };

  const handleReject = () => {
    toast({
      title: "Berhasil", 
      description: "Permintaan kalibrasi telah ditolak"
    });
    
    setSelectedRequest(null);
  };

  return (
    <DashboardLayout>
      <NotificationSystem />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Permintaan Kalibrasi</h1>
            <p className="text-muted-foreground">Kelola permintaan kalibrasi dari rumah sakit dan perusahaan</p>
          </div>
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
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="approved">Disetujui</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Permintaan Kalibrasi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rumah Sakit / Perusahaan</TableHead>
                  <TableHead>Tanggal Permintaan</TableHead>
                  <TableHead>Jumlah Alat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kalibrator</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.hospitalName}</TableCell>
                    <TableCell>{request.requestDate}</TableCell>
                    <TableCell>{request.equipmentCount} alat</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {request.calibratorAssigned || "-"}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detail Permintaan Kalibrasi - {request.hospitalName}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Tanggal Permintaan</label>
                                <p>{request.requestDate}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <div className="mt-1">{getStatusBadge(request.status)}</div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Daftar Alat yang Diminta Kalibrasi</h4>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Nama Alat</TableHead>
                                    <TableHead>Merk</TableHead>
                                    <TableHead>Model</TableHead>
                                    <TableHead>Serial Number</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {request.equipment.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell>{item.brand}</TableCell>
                                      <TableCell>{item.model}</TableCell>
                                      <TableCell>{item.serialNumber}</TableCell>
                                      <TableCell>{item.location}</TableCell>
                                      <TableCell>
                                        <Badge variant={item.status === 'expired' ? 'destructive' : 'secondary'}>
                                          {item.status === 'expired' ? 'Kedaluwarsa' : 'Akan Kedaluwarsa'}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>

                            {request.status === 'pending' && canApproveReject() && (
                              <div className="space-y-4 pt-4 border-t">
                                <div>
                                  <label className="text-sm font-medium">Pilih Kalibrator</label>
                                  <Select value={selectedCalibrator} onValueChange={setSelectedCalibrator}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Pilih perusahaan atau teknisi kalibrator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {mockCalibrators.map((calibrator) => (
                                        <SelectItem key={calibrator.id} value={calibrator.id}>
                                          {calibrator.name} ({calibrator.type === 'company' ? 'Perusahaan' : 'Teknisi'})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Setujui
                                  </Button>
                                  <Button variant="destructive" onClick={handleReject}>
                                    <X className="h-4 w-4 mr-2" />
                                    Tolak
                                  </Button>
                                </div>
                              </div>
                            )}

                            {request.status === 'rejected' && request.rejectionReason && (
                              <div className="pt-4 border-t">
                                <label className="text-sm font-medium text-destructive">Alasan Penolakan</label>
                                <p className="text-sm text-muted-foreground">{request.rejectionReason}</p>
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