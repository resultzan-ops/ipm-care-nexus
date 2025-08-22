import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { EquipmentCard } from "@/components/equipment/equipment-card";
import { QRCodeModal } from "@/components/equipment/qr-code-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar,
  Plus, 
  Search,
  Bell,
  Activity
} from "lucide-react";

// Import medical equipment images
import mriImage from "@/assets/mri-machine.jpg";
import ultrasoundImage from "@/assets/ultrasound-machine.jpg";
import xrayImage from "@/assets/xray-machine.jpg";

// Mock data
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
  }
];

const upcomingTasks = [
  { id: "1", equipment: "MRI Machine Siemens", type: "Calibration", date: "2024-03-15", priority: "high" },
  { id: "2", equipment: "CT Scan Phillips", type: "Maintenance", date: "2024-03-18", priority: "medium" },
  { id: "3", equipment: "Ultrasound GE", type: "Repair", date: "2024-03-20", priority: "high" },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const userRole = (profile?.role as any) || "operator_klien";
  const tenantName = profile?.company_id ? "IPM System" : "IPM System";
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">IPM Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Medical Equipment Inspection & Preventive Maintenance System
            </p>
          </div>
          <Button variant="medical" className="gap-2" asChild>
            <Link to="/equipment/add">
              <Plus className="h-4 w-4" />
              Add Equipment
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <StatsGrid userRole={userRole} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Medical Equipment Overview</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input 
                    placeholder="Search equipment..." 
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/equipment">
                    <Activity className="h-4 w-4 mr-2" />
                    All Equipment
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {mockEquipment.map((equipment) => (
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
          </div>

          {/* Sidebar - Upcoming Tasks */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{task.equipment}</p>
                      <p className="text-xs text-muted-foreground">{task.type}</p>
                      <p className="text-xs text-muted-foreground">{task.date}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-danger' : 'bg-warning'
                    }`} />
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <Link to="/maintenance">
                    <Calendar className="h-4 w-4 mr-2" />
                    View All Tasks
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/equipment/add">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Equipment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link to="/maintenance">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  View Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
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