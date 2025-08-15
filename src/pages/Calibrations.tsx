import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Search, Filter, CheckCircle, AlertTriangle, Clock, FileText, Eye, SendHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { CalibrationRequestModal } from "@/components/calibration/calibration-request-modal";
import { CertificateViewer } from "@/components/calibration/certificate-viewer";
import { NotificationSystem } from "@/components/notifications/notification-system";

// Enhanced mock calibration data with file information
const mockCalibrations = [
  {
    id: "CAL-001",
    equipmentName: "MRI Scanner Philips",
    equipmentId: "EQ-001",
    calibrationType: "Periodic Calibration",
    lastCalibration: "2023-07-15",
    nextCalibration: "2024-07-15",
    status: "Valid",
    certificateNumber: "CERT-2023-001",
    calibratedBy: "PT. Kalibrasi Medis Indonesia",
    validUntil: "2024-07-15",
    fileUrl: "/sample-certificate.pdf",
    fileType: "pdf" as const
  },
  {
    id: "CAL-002",
    equipmentName: "Ultrasound GE",
    equipmentId: "EQ-002",
    calibrationType: "Initial Calibration",
    lastCalibration: "2023-12-10",
    nextCalibration: "2024-12-10",
    status: "Valid", 
    certificateNumber: "CERT-2023-002",
    calibratedBy: "Lab Kalibrasi Nasional",
    validUntil: "2024-12-10",
    fileUrl: "/sample-certificate-2.jpg",
    fileType: "jpg" as const
  },
  {
    id: "CAL-003",
    equipmentName: "X-Ray Siemens",
    equipmentId: "EQ-003", 
    calibrationType: "Re-calibration",
    lastCalibration: "2023-03-20",
    nextCalibration: "2024-03-20",
    status: "Expiring Soon",
    certificateNumber: "CERT-2023-003",
    calibratedBy: "PT. Sertifikasi Alkes",
    validUntil: "2024-03-20",
    fileUrl: "/sample-certificate-3.png",
    fileType: "png" as const
  },
  {
    id: "CAL-004",
    equipmentName: "CT Scanner Toshiba",
    equipmentId: "EQ-004",
    calibrationType: "Periodic Calibration", 
    lastCalibration: "2022-11-15",
    nextCalibration: "2023-11-15",
    status: "Expired",
    certificateNumber: "CERT-2022-004",
    calibratedBy: "Balai Kalibrasi Regional",
    validUntil: "2023-11-15",
    fileUrl: "/sample-certificate-4.pdf",
    fileType: "pdf" as const
  }
];

export default function Calibrations() {
  const userRole = "owner";
  const tenantName = "RS Umum Daerah Bantul";
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [certificateViewerOpen, setCertificateViewerOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  // Transform calibrations for equipment request list
  const equipmentForRequest = mockCalibrations.map(cal => ({
    id: cal.equipmentId,
    nama_alat: cal.equipmentName,
    nextCalibration: cal.nextCalibration,
    status: cal.status as 'Valid' | 'Expiring Soon' | 'Expired'
  }));

  const filteredCalibrations = mockCalibrations.filter(calibration => {
    const matchesStatus = statusFilter === "all" || calibration.status.toLowerCase().replace(/\s+/g, '') === statusFilter;
    const matchesSearch = calibration.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calibration.calibratedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calibration.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Valid":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Valid
          </Badge>
        );
      case "Expiring Soon":
        return (
          <Badge variant="outline" className="gap-1 border-orange-200 text-orange-700">
            <AlertTriangle className="h-3 w-3" />
            Expiring Soon
          </Badge>
        );
      case "Expired":
        return (
          <Badge variant="destructive" className="gap-1">
            <Clock className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysUntilExpiry = (validUntil: string) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewCertificate = (calibration: any) => {
    setSelectedCertificate({
      id: calibration.id,
      equipmentName: calibration.equipmentName,
      certificateNumber: calibration.certificateNumber,
      calibratedBy: calibration.calibratedBy,
      calibrationDate: calibration.lastCalibration,
      validUntil: calibration.validUntil,
      status: calibration.status,
      fileUrl: calibration.fileUrl,
      fileType: calibration.fileType
    });
    setCertificateViewerOpen(true);
  };

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <NotificationSystem />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Equipment Calibrations</h1>
            <p className="text-muted-foreground mt-1">
              Manage calibration schedules and certificates
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setRequestModalOpen(true)}>
              <SendHorizontal className="h-4 w-4" />
              Request Calibration
            </Button>
            <Button variant="medical" className="gap-2">
              <Plus className="h-4 w-4" />
              Schedule Calibration
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-sm text-muted-foreground">Valid Calibrations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Expiring Soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">4</p>
                  <p className="text-sm text-muted-foreground">Total Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search calibrations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="expiringsoon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Calibrations Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calibration Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Calibrated</TableHead>
                  <TableHead>Valid Until</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Certificate</TableHead>
                  <TableHead>Calibrated By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCalibrations.map((calibration) => (
                  <TableRow key={calibration.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{calibration.equipmentName}</div>
                        <div className="text-sm text-muted-foreground">{calibration.equipmentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{calibration.calibrationType}</TableCell>
                    <TableCell>{calibration.lastCalibration}</TableCell>
                    <TableCell>
                      <div>
                        <div>{calibration.validUntil}</div>
                        {calibration.status !== "Expired" && (
                          <div className="text-sm text-muted-foreground">
                            {getDaysUntilExpiry(calibration.validUntil)} days remaining
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(calibration.status)}</TableCell>
                    <TableCell className="font-mono text-sm">{calibration.certificateNumber}</TableCell>
                    <TableCell className="max-w-xs truncate" title={calibration.calibratedBy}>
                      {calibration.calibratedBy}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCertificate(calibration)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <CalibrationRequestModal
        isOpen={requestModalOpen}
        onOpenChange={setRequestModalOpen}
        equipmentList={equipmentForRequest}
      />
      
      <CertificateViewer
        isOpen={certificateViewerOpen}
        onOpenChange={setCertificateViewerOpen}
        certificate={selectedCertificate}
      />
    </DashboardLayout>
  );
}