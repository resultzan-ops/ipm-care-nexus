import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  QrCode, 
  Calendar, 
  Wrench, 
  FileText,
  MapPin,
  DollarSign,
  Hash,
  Building,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import equipment images
import mriImage from "@/assets/mri-machine.jpg";
import ultrasoundImage from "@/assets/ultrasound-machine.jpg";
import xrayImage from "@/assets/xray-machine.jpg";

// Mock equipment data
const mockEquipmentData: Record<string, any> = {
  "1": {
    id: "1",
    nama_alat: "MRI Machine Siemens",
    kategori: "Medical Imaging",
    nomor_seri: "MRI-2024-001",
    merk: "Siemens",
    model: "MAGNETOM Skyra",
    lokasi: "Radiology Room 1",
    harga_peralatan: 15000000000,
    foto_peralatan: mriImage,
    status: "Aktif",
    qr_code: "QR-MRI-001",
    last_maintenance: "15 Jan 2024",
    next_calibration: "15 Mar 2024",
    description: "High-field MRI scanner with advanced imaging capabilities",
    installation_date: "2023-06-15",
    warranty_expires: "2026-06-15",
    vendor_contact: "PT. Siemens Healthcare Indonesia"
  },
  "2": {
    id: "2",
    nama_alat: "Ultrasound GE",
    kategori: "Diagnostic",
    nomor_seri: "US-2024-002", 
    merk: "GE Healthcare",
    model: "LOGIQ P10",
    lokasi: "Emergency Room",
    harga_peralatan: 850000000,
    foto_peralatan: ultrasoundImage,
    status: "Dalam Perbaikan",
    qr_code: "QR-US-002",
    last_maintenance: "28 Dec 2023",
    next_calibration: "28 Feb 2024",
    description: "Portable ultrasound system with advanced imaging features",
    installation_date: "2023-08-20",
    warranty_expires: "2026-08-20",
    vendor_contact: "PT. GE Healthcare Indonesia"
  }
};

// Mock maintenance history
const maintenanceHistory = [
  {
    id: "1",
    date: "15 Jan 2024",
    type: "Preventive Maintenance",
    technician: "Ahmad Hidayat",
    status: "Completed",
    notes: "Regular maintenance completed successfully"
  },
  {
    id: "2", 
    date: "15 Oct 2023",
    type: "Repair",
    technician: "Siti Nurhaliza",
    status: "Completed",
    notes: "Fixed imaging quality issue"
  }
];

// Mock calibration history
const calibrationHistory = [
  {
    id: "1",
    date: "15 Dec 2023",
    calibrator: "PT. Kalibrasi Medis",
    certificate: "CERT-MRI-2023-12",
    valid_until: "15 Dec 2024",
    status: "Valid"
  }
];

export default function EquipmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userRole = "admin_klien";
  const tenantName = "RS Umum Daerah Bantul";

  const equipment = mockEquipmentData[id || "1"];

  if (!equipment) {
    return (
      <DashboardLayout userRole={userRole} tenantName={tenantName}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Equipment not found</h1>
          <Link to="/equipment">
            <Button>Back to Equipment List</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Aktif': return 'secondary';
      case 'Dalam Perbaikan': return 'outline';
      case 'Scrap': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleScheduleMaintenance = () => {
    toast({
      title: "Maintenance Scheduled",
      description: "Maintenance has been scheduled for this equipment",
    });
  };

  const handleViewQR = () => {
    toast({
      title: "QR Code",
      description: `QR Code: ${equipment.qr_code}`,
    });
  };

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/equipment">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{equipment.nama_alat}</h1>
              <p className="text-muted-foreground mt-1">
                {equipment.merk} {equipment.model} • {equipment.nomor_seri}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleViewQR}>
              <QrCode className="h-4 w-4 mr-2" />
              View QR
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="medical" onClick={handleScheduleMaintenance}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Maintenance
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Equipment Image and Basic Info */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <img 
                      src={equipment.foto_peralatan} 
                      alt={equipment.nama_alat}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(equipment.status) as any}>
                        {equipment.status}
                      </Badge>
                      <Badge variant="outline">{equipment.kategori}</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{equipment.lokasi}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Asset Value</p>
                          <p className="font-medium">{formatCurrency(equipment.harga_peralatan)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Serial Number</p>
                          <p className="font-medium">{equipment.nomor_seri}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Brand & Model</p>
                          <p className="font-medium">{equipment.merk} {equipment.model}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Details */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                <TabsTrigger value="calibration">Calibration</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Installation Date</p>
                        <p className="font-medium">{equipment.installation_date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Warranty Expires</p>
                        <p className="font-medium">{equipment.warranty_expires}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Vendor Contact</p>
                        <p className="font-medium">{equipment.vendor_contact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">QR Code</p>
                        <p className="font-medium">{equipment.qr_code}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Description</p>
                      <p className="text-sm">{equipment.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="maintenance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Maintenance History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {maintenanceHistory.map((record) => (
                        <div key={record.id} className="border-l-2 border-primary pl-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{record.type}</h4>
                            <Badge variant="outline">{record.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {record.date} • Technician: {record.technician}
                          </p>
                          <p className="text-sm">{record.notes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="calibration" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Calibration History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {calibrationHistory.map((record) => (
                        <div key={record.id} className="border-l-2 border-success pl-4 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Calibration Certificate</h4>
                            <Badge variant="secondary">{record.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {record.date} • Valid until: {record.valid_until}
                          </p>
                          <p className="text-sm mb-2">
                            Calibrator: {record.calibrator}
                          </p>
                          <p className="text-sm font-medium">
                            Certificate: {record.certificate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Equipment Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded yet</p>
                      <Button variant="outline" className="mt-4">
                        Upload Document
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Maintenance</span>
                  <span className="text-sm font-medium">{equipment.last_maintenance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Next Calibration</span>
                  <span className="text-sm font-medium text-warning">{equipment.next_calibration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium text-success">98.5%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleScheduleMaintenance}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Calibration
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Log Inspection
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleViewQR}>
                  <QrCode className="h-4 w-4 mr-2" />
                  Print QR Code
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}