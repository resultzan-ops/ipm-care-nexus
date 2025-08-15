import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, X, Calendar, User, Award } from "lucide-react";
import { useState } from "react";

interface CertificateViewerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  certificate: {
    id: string;
    equipmentName: string;
    certificateNumber: string;
    calibratedBy: string;
    calibrationDate: string;
    validUntil: string;
    status: string;
    fileUrl?: string;
    fileType?: 'pdf' | 'jpg' | 'png';
  } | null;
}

export function CertificateViewer({
  isOpen,
  onOpenChange,
  certificate
}: CertificateViewerProps) {
  const [viewMode, setViewMode] = useState<'info' | 'file'>('info');

  if (!certificate) return null;

  const handleDownload = () => {
    if (certificate.fileUrl) {
      const link = document.createElement('a');
      link.href = certificate.fileUrl;
      link.download = `${certificate.certificateNumber}-certificate.${certificate.fileType}`;
      link.click();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Valid":
        return <Badge variant="default">Valid</Badge>;
      case "Expiring Soon":
        return <Badge variant="outline" className="border-orange-200 text-orange-700">Expiring Soon</Badge>;
      case "Expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderFileViewer = () => {
    if (!certificate.fileUrl) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No certificate file available</p>
        </div>
      );
    }

    if (certificate.fileType === 'pdf') {
      return (
        <div className="w-full h-[500px] border rounded-lg overflow-hidden">
          <iframe
            src={certificate.fileUrl}
            className="w-full h-full"
            title="Certificate PDF"
          />
        </div>
      );
    } else if (certificate.fileType === 'jpg' || certificate.fileType === 'png') {
      return (
        <div className="text-center">
          <img
            src={certificate.fileUrl}
            alt="Certificate"
            className="max-w-full max-h-[500px] mx-auto border rounded-lg"
          />
        </div>
      );
    }

    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>File format not supported for preview</p>
        <Button variant="outline" onClick={handleDownload} className="mt-4">
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Calibration Certificate
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'info' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('info')}
              >
                Info
              </Button>
              <Button
                variant={viewMode === 'file' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('file')}
                disabled={!certificate.fileUrl}
              >
                <Eye className="h-4 w-4 mr-1" />
                View File
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {viewMode === 'info' && (
            <div className="space-y-4">
              {/* Certificate Info */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-2">{certificate.equipmentName}</h3>
                        {getStatusBadge(certificate.status)}
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Certificate Number</p>
                            <p className="font-mono font-medium">{certificate.certificateNumber}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Calibrated By</p>
                            <p className="font-medium">{certificate.calibratedBy}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Calibration Date</p>
                          <p className="font-medium">{certificate.calibrationDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Valid Until</p>
                          <p className="font-medium">{certificate.validUntil}</p>
                        </div>
                      </div>
                      
                      {certificate.fileUrl && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Certificate File</p>
                            <p className="font-medium uppercase">{certificate.fileType} Document</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode('file')}
                  disabled={!certificate.fileUrl}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
                <Button 
                  onClick={handleDownload}
                  disabled={!certificate.fileUrl}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          {viewMode === 'file' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Certificate File</h3>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              {renderFileViewer()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}