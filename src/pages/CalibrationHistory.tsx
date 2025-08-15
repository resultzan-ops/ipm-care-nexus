import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Download, FileText, Filter, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { NotificationSystem } from "@/components/notifications/notification-system";
import { useToast } from "@/hooks/use-toast";

// Mock data for calibration history
const mockHistory = [
  {
    id: "HIST-001",
    hospitalName: "RS Siloam Jakarta",
    tenantId: "T-001",
    calibratorName: "PT. Kalibrasi Medis Indonesia",
    calibratorType: "company",
    completedDate: "2024-01-19",
    startDate: "2024-01-15",
    equipmentCount: 4,
    status: "completed",
    totalCost: 15000000,
    certificates: [
      { id: "CERT-001", equipmentName: "MRI Scanner", certificateNumber: "CERT-MRI-001", fileUrl: "/sample-certificate.pdf", validUntil: "2025-01-19" },
      { id: "CERT-002", equipmentName: "CT Scanner", certificateNumber: "CERT-CT-001", fileUrl: "/sample-certificate-2.jpg", validUntil: "2025-01-19" },
      { id: "CERT-003", equipmentName: "Ultrasound", certificateNumber: "CERT-US-001", fileUrl: "/sample-certificate-3.png", validUntil: "2025-01-19" },
      { id: "CERT-004", equipmentName: "X-Ray", certificateNumber: "CERT-XR-001", fileUrl: "/sample-certificate.pdf", validUntil: "2025-01-19" }
    ]
  },
  {
    id: "HIST-002",
    hospitalName: "RS Harapan Kita",
    tenantId: "T-002",
    calibratorName: "Ahmad Teknisi",
    calibratorType: "technician", 
    completedDate: "2024-01-10",
    startDate: "2024-01-08",
    equipmentCount: 2,
    status: "completed",
    totalCost: 8000000,
    certificates: [
      { id: "CERT-005", equipmentName: "ECG Machine", certificateNumber: "CERT-ECG-001", fileUrl: "/sample-certificate-2.jpg", validUntil: "2025-01-10" },
      { id: "CERT-006", equipmentName: "Blood Analyzer", certificateNumber: "CERT-BA-001", fileUrl: "/sample-certificate.pdf", validUntil: "2025-01-10" }
    ]
  },
  {
    id: "HIST-003",
    hospitalName: "RS Cipto Mangunkusumo",
    tenantId: "T-003",
    calibratorName: "Lab Kalibrasi Nasional",
    calibratorType: "company",
    completedDate: "2024-01-05",
    startDate: "2024-01-02",
    equipmentCount: 3,
    status: "cancelled",
    reason: "Alat tidak dapat dikalibrasi",
    certificates: []
  },
  {
    id: "HIST-004",
    hospitalName: "RS Siloam Jakarta",
    tenantId: "T-001",
    calibratorName: "PT. Kalibrasi Medis Indonesia", 
    calibratorType: "company",
    completedDate: "2023-12-20",
    startDate: "2023-12-18",
    equipmentCount: 5,
    status: "completed",
    totalCost: 20000000,
    certificates: [
      { id: "CERT-007", equipmentName: "Ventilator", certificateNumber: "CERT-VENT-001", fileUrl: "/sample-certificate.pdf", validUntil: "2024-12-20" },
      { id: "CERT-008", equipmentName: "Defibrillator", certificateNumber: "CERT-DEF-001", fileUrl: "/sample-certificate-3.png", validUntil: "2024-12-20" }
    ]
  }
];

export default function CalibrationHistory() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedHistory, setSelectedHistory] = useState<any>(null);

  // Filter history based on user role and permissions
  const filteredHistory = mockHistory.filter(history => {
    // Role-based filtering
    if (profile?.role === 'admin_rs' && history.tenantId !== profile.tenant_id) {
      return false;
    }
    if (profile?.role === 'kalibrator') {
      // Kalibrator hanya melihat pekerjaan yang dia lakukan
      if (history.calibratorType !== 'company') {
        return false;
      }
    }
    if (profile?.role === 'teknisi') {
      // Teknisi hanya melihat pekerjaan yang dia lakukan
      if (history.calibratorType !== 'technician') {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all" && history.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== "all") {
      const historyDate = new Date(history.completedDate);
      const now = new Date();
      
      switch (dateFilter) {
        case "1month":
          if (now.getTime() - historyDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
            return false;
          }
          break;
        case "3months":
          if (now.getTime() - historyDate.getTime() > 90 * 24 * 60 * 60 * 1000) {
            return false;
          }
          break;
        case "6months":
          if (now.getTime() - historyDate.getTime() > 180 * 24 * 60 * 60 * 1000) {
            return false;
          }
          break;
        case "1year":
          if (now.getTime() - historyDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
            return false;
          }
          break;
      }
    }

    // Search filter
    if (searchTerm && !history.hospitalName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Selesai</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Dibatalkan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canDownloadCertificate = () => {
    return profile?.role === 'super_admin' || profile?.role === 'spv' || profile?.role === 'admin_kalibrasi' ||
           profile?.role === 'kalibrator' || profile?.role === 'admin_rs';
  };

  const handleDownloadCertificate = (certificate: any) => {
    toast({
      title: "Download Dimulai",
      description: `Mengunduh sertifikat ${certificate.certificateNumber}`
    });
    
    // Simulate download
    const link = document.createElement('a');
    link.href = certificate.fileUrl;
    link.download = `${certificate.certificateNumber}.pdf`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <NotificationSystem />
      
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">History Kalibrasi</h1>
            <p className="text-muted-foreground">Rekap semua kalibrasi yang telah selesai atau dibatalkan</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">3</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dibatalkan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">14</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sertifikat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">11</div>
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
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="completed">Selesai</SelectItem>
                  <SelectItem value="cancelled">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Periode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="1month">1 Bulan</SelectItem>
                  <SelectItem value="3months">3 Bulan</SelectItem>
                  <SelectItem value="6months">6 Bulan</SelectItem>
                  <SelectItem value="1year">1 Tahun</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Kalibrasi</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rumah Sakit / Perusahaan</TableHead>
                  <TableHead>Kalibrator</TableHead>
                  <TableHead>Tanggal Selesai</TableHead>
                  <TableHead>Jumlah Alat</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Biaya</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((history) => (
                  <TableRow key={history.id}>
                    <TableCell className="font-medium">{history.hospitalName}</TableCell>
                    <TableCell>{history.calibratorName}</TableCell>
                    <TableCell>{history.completedDate}</TableCell>
                    <TableCell>{history.equipmentCount} alat</TableCell>
                    <TableCell>{getStatusBadge(history.status)}</TableCell>
                    <TableCell>
                      {history.totalCost ? formatCurrency(history.totalCost) : '-'}
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedHistory(history)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Detail
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Detail Riwayat Kalibrasi - {history.hospitalName}</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="text-sm font-medium">Kalibrator</label>
                                <p>{history.calibratorName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Periode</label>
                                <p>{history.startDate} - {history.completedDate}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Total Biaya</label>
                                <p>{history.totalCost ? formatCurrency(history.totalCost) : '-'}</p>
                              </div>
                            </div>

                            {history.status === 'cancelled' && history.reason && (
                              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <label className="text-sm font-medium text-red-800">Alasan Pembatalan</label>
                                <p className="text-sm text-red-600">{history.reason}</p>
                              </div>
                            )}

                            {history.certificates.length > 0 && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium">Sertifikat Kalibrasi</h4>
                                  {canDownloadCertificate() && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => {
                                        // Download all certificates as ZIP
                                        toast({
                                          title: "Download Dimulai",
                                          description: "Mengunduh semua sertifikat sebagai ZIP"
                                        });
                                      }}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download Semua
                                    </Button>
                                  )}
                                </div>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Nama Alat</TableHead>
                                      <TableHead>Nomor Sertifikat</TableHead>
                                      <TableHead>Berlaku Hingga</TableHead>
                                      <TableHead>Aksi</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {history.certificates.map((cert) => (
                                      <TableRow key={cert.id}>
                                        <TableCell>{cert.equipmentName}</TableCell>
                                        <TableCell>{cert.certificateNumber}</TableCell>
                                        <TableCell>{cert.validUntil}</TableCell>
                                        <TableCell>
                                          <div className="flex gap-1">
                                            <Button 
                                              variant="outline" 
                                              size="sm"
                                              onClick={() => {
                                                // View certificate
                                                window.open(cert.fileUrl, '_blank');
                                              }}
                                            >
                                              <FileText className="h-4 w-4" />
                                            </Button>
                                            {canDownloadCertificate() && (
                                              <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleDownloadCertificate(cert)}
                                              >
                                                <Download className="h-4 w-4" />
                                              </Button>
                                            )}
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
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