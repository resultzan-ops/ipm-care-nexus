import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { 
  Calendar, 
  Camera, 
  Edit, 
  MapPin, 
  QrCode, 
  Wrench 
} from "lucide-react";

interface Equipment {
  id: string;
  nama_alat: string;
  kategori: string;
  nomor_seri: string;
  merk: string;
  model: string;
  lokasi: string;
  harga_peralatan: number;
  foto_peralatan?: string;
  status: "Aktif" | "Dalam Perbaikan" | "Scrap";
  qr_code: string;
  last_maintenance?: string;
  next_calibration?: string;
}

interface EquipmentCardProps {
  equipment: Equipment;
  onEdit?: (id: string) => void;
  onViewQR?: (id: string) => void;
  onScheduleMaintenance?: (id: string) => void;
}

export function EquipmentCard({ 
  equipment, 
  onEdit, 
  onViewQR, 
  onScheduleMaintenance 
}: EquipmentCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Aktif": return "active";
      case "Dalam Perbaikan": return "maintenance";
      case "Scrap": return "scrap";
      default: return "active";
    }
  };

  return (
    <Card className="equipment-card group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{equipment.nama_alat}</h3>
            <p className="text-sm text-muted-foreground">{equipment.kategori}</p>
          </div>
          <StatusBadge variant={getStatusVariant(equipment.status) as any}>
            {equipment.status}
          </StatusBadge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {equipment.foto_peralatan && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={equipment.foto_peralatan} 
              alt={equipment.nama_alat}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Serial Number</p>
            <p className="font-medium">{equipment.nomor_seri}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Brand</p>
            <p className="font-medium">{equipment.merk}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Model</p>
            <p className="font-medium">{equipment.model}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Value</p>
            <p className="font-medium">{formatCurrency(equipment.harga_peralatan)}</p>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          {equipment.lokasi}
        </div>
        
        {(equipment.last_maintenance || equipment.next_calibration) && (
          <div className="space-y-2 pt-2 border-t border-border">
            {equipment.last_maintenance && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Wrench className="h-3 w-3 mr-2" />
                Last maintenance: {equipment.last_maintenance}
              </div>
            )}
            {equipment.next_calibration && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-2" />
                Next calibration: {equipment.next_calibration}
              </div>
            )}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewQR?.(equipment.id)}
            className="flex-1"
          >
            <QrCode className="h-3 w-3 mr-2" />
            QR Code
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit?.(equipment.id)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button 
            variant="medical" 
            size="sm" 
            onClick={() => onScheduleMaintenance?.(equipment.id)}
          >
            <Calendar className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}