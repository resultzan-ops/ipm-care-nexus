import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { EquipmentCard } from "@/components/equipment/equipment-card";  
import { QRCodeModal } from "@/components/equipment/qr-code-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Activity } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Import medical equipment images
import mriImage from "@/assets/mri-machine.jpg";
import ultrasoundImage from "@/assets/ultrasound-machine.jpg";
import xrayImage from "@/assets/xray-machine.jpg";

// Mock data - same as Dashboard but expanded
const mockEquipment = [
  {
    id: "1",
    nama_alat: "MRI Machine Siemens",
    kategori: "Medical Imaging",
    nomor_seri: "MRI-2024-001",
    merk: "Siemens",
    model: "MAGNETOM Skyra",
    lokasi: "Radiology Room 1",
    harga_peralatan: 15000000000,
    foto_peralatan: mriImage,
    status: "Aktif" as const,
    qr_code: "QR-MRI-001",
    last_maintenance: "15 Jan 2024",
    next_calibration: "15 Mar 2024"
  },
  {
    id: "2", 
    nama_alat: "Ultrasound GE",
    kategori: "Diagnostic",
    nomor_seri: "US-2024-002",
    merk: "GE Healthcare",
    model: "LOGIQ P10",
    lokasi: "Emergency Room",
    harga_peralatan: 850000000,
    foto_peralatan: ultrasoundImage,
    status: "Dalam Perbaikan" as const,
    qr_code: "QR-US-002",
    last_maintenance: "28 Dec 2023",
    next_calibration: "28 Feb 2024"
  },
  {
    id: "3",
    nama_alat: "X-Ray Digital",
    kategori: "Medical Imaging", 
    nomor_seri: "XR-2024-003",
    merk: "Canon",
    model: "CXDI-820C",
    lokasi: "X-Ray Room A",
    harga_peralatan: 1200000000,
    foto_peralatan: xrayImage,
    status: "Aktif" as const,
    qr_code: "QR-XR-003",
    last_maintenance: "05 Feb 2024",
    next_calibration: "05 Apr 2024"
  },
  // Additional mock equipment
  {
    id: "4",
    nama_alat: "CT Scan Philips",
    kategori: "Medical Imaging",
    nomor_seri: "CT-2024-004",
    merk: "Philips",
    model: "Ingenuity Core",
    lokasi: "CT Room 1",
    harga_peralatan: 8500000000,
    foto_peralatan: mriImage,
    status: "Aktif" as const,
    qr_code: "QR-CT-004",
    last_maintenance: "20 Jan 2024",
    next_calibration: "20 Mar 2024"
  },
  {
    id: "5",
    nama_alat: "ECG Machine",
    kategori: "Diagnostic",
    nomor_seri: "ECG-2024-005", 
    merk: "Nihon Kohden",
    model: "Cardiofax G",
    lokasi: "Cardiology Ward",
    harga_peralatan: 125000000,
    foto_peralatan: ultrasoundImage,
    status: "Aktif" as const,
    qr_code: "QR-ECG-005",
    last_maintenance: "10 Feb 2024",
    next_calibration: "10 Apr 2024"
  }
];

export default function Equipment() {
  const userRole = "owner"; // This would come from auth context
  const tenantName = "RS Umum Daerah Bantul";
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  const filteredEquipment = mockEquipment.filter(equipment => {
    const matchesSearch = equipment.nama_alat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.merk.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.nomor_seri.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || equipment.kategori === categoryFilter;
    const matchesStatus = !statusFilter || equipment.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(mockEquipment.map(eq => eq.kategori))];
  const statuses = [...new Set(mockEquipment.map(eq => eq.status))];

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medical Equipment</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor all medical equipment across the facility
            </p>
          </div>
          <Link to="/equipment/add">
            <Button variant="medical" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Button>
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockEquipment.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {mockEquipment.filter(eq => eq.status === 'Aktif').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {mockEquipment.filter(eq => eq.status === 'Dalam Perbaikan').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input 
                placeholder="Search equipment by name, brand, or serial number..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => (
            <EquipmentCard 
              key={equipment.id} 
              equipment={equipment}
              onEdit={(id) => navigate(`/equipment/${id}`)}
              onViewQR={(id) => {
                const equipment = mockEquipment.find(eq => eq.id === id);
                if (equipment) {
                  setSelectedEquipment(equipment);
                  setQrModalOpen(true);
                }
              }}
              onScheduleMaintenance={(id) => navigate('/maintenance')}
            />
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <Card className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No equipment found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setCategoryFilter("");
              setStatusFilter("");
            }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
      
      {/* QR Code Modal */}
      {selectedEquipment && (
        <QRCodeModal
          equipmentId={selectedEquipment.id}
          equipmentName={selectedEquipment.nama_alat}
          qrCode={selectedEquipment.qr_code}
          isOpen={qrModalOpen}
          onOpenChange={setQrModalOpen}
        />
      )}
    </DashboardLayout>
  );
}