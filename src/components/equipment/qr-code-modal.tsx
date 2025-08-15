import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download, X, Printer } from "lucide-react";
import { BarcodePrintModal } from "./barcode-print-modal";

interface QRCodeModalProps {
  equipmentId: string;
  equipmentName: string;
  equipmentSerial?: string;
  qrCode: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRCodeModal({ 
  equipmentId, 
  equipmentName, 
  equipmentSerial = "N/A",
  qrCode, 
  isOpen, 
  onOpenChange 
}: QRCodeModalProps) {
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const generateQRCodeUrl = (text: string) => {
    // Using QR Server API to generate QR code
    const encodedText = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedText}`;
  };

  const qrData = `IPM-${qrCode}\nEquipment: ${equipmentName}\nID: ${equipmentId}\nhttps://ipm-system.com/equipment/${equipmentId}`;
  const qrImageUrl = generateQRCodeUrl(qrData);

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${qrCode}-${equipmentName.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            Equipment QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg shadow-inner">
            <img 
              src={qrImageUrl} 
              alt={`QR Code for ${equipmentName}`}
              className="w-64 h-64 object-contain"
            />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold">{equipmentName}</h3>
            <p className="text-sm text-muted-foreground">QR Code: {qrCode}</p>
            <p className="text-xs text-muted-foreground">
              Scan to view equipment details and maintenance history
            </p>
          </div>
          
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="medical" 
              onClick={() => setPrintModalOpen(true)}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Label
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        
        <BarcodePrintModal
          equipmentId={equipmentId}
          equipmentName={equipmentName}
          serialNumber={equipmentSerial}
          qrCode={qrCode}
          isOpen={printModalOpen}
          onOpenChange={setPrintModalOpen}
        />
        </div>
      </DialogContent>
    </Dialog>
  );
}