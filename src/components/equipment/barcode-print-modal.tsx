import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Printer, Download, X } from "lucide-react";
import { useRef } from "react";

interface BarcodePrintModalProps {
  equipmentId: string;
  equipmentName: string;
  serialNumber: string;
  qrCode: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BarcodePrintModal({
  equipmentId,
  equipmentName,
  serialNumber,
  qrCode,
  isOpen,
  onOpenChange
}: BarcodePrintModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Equipment Barcode - ${equipmentName}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .barcode-label { 
                  width: 3in; 
                  height: 2in; 
                  border: 2px solid #000; 
                  padding: 10px; 
                  display: flex; 
                  flex-direction: column; 
                  justify-content: space-between;
                  background: white;
                }
                .qr-code { text-align: center; }
                .qr-code img { width: 80px; height: 80px; }
                .equipment-info { text-align: center; font-size: 10px; }
                .equipment-name { font-weight: bold; margin-bottom: 2px; }
                .serial-number { margin-bottom: 2px; }
                .equipment-id { font-size: 8px; color: #666; }
                @media print {
                  body { margin: 0; padding: 0; }
                  .barcode-label { border: 1px solid #000; }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const width = 288; // 3 inches at 96 DPI
    const height = 192; // 2 inches at 96 DPI
    
    canvas.width = width;
    canvas.height = height;
    
    if (ctx) {
      // White background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // Border
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, width, height);
      
      // Equipment name
      ctx.fillStyle = 'black';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(equipmentName, width / 2, 30);
      
      // Serial number
      ctx.font = '10px Arial';
      ctx.fillText(`S/N: ${serialNumber}`, width / 2, 50);
      
      // Equipment ID
      ctx.font = '8px Arial';
      ctx.fillStyle = '#666';
      ctx.fillText(`ID: ${equipmentId}`, width / 2, height - 10);
      
      // Download
      const link = document.createElement('a');
      link.download = `barcode-${equipmentId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    JSON.stringify({
      id: equipmentId,
      name: equipmentName,
      serial: serialNumber,
      qr_code: qrCode
    })
  )}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Equipment Barcode Label
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview */}
          <Card className="bg-white">
            <CardContent className="p-4">
              <div ref={printRef} className="barcode-label" style={{ 
                width: '3in', 
                height: '2in', 
                border: '2px solid black', 
                padding: '10px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                backgroundColor: 'white'
              }}>
                <div className="qr-code" style={{ textAlign: 'center' }}>
                  <img 
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{ width: '80px', height: '80px' }}
                  />
                </div>
                <div className="equipment-info" style={{ textAlign: 'center', fontSize: '10px' }}>
                  <div className="equipment-name" style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                    {equipmentName}
                  </div>
                  <div className="serial-number" style={{ marginBottom: '2px' }}>
                    S/N: {serialNumber}
                  </div>
                  <div className="equipment-id" style={{ fontSize: '8px', color: '#666' }}>
                    ID: {equipmentId}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1 gap-2">
              <Printer className="h-4 w-4" />
              Print Label
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Label size: 3" × 2" (standard asset tag size)
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}