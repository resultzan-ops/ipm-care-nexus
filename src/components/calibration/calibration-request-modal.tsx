import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CalibrationRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentList: Array<{
    id: string;
    nama_alat: string;
    nextCalibration: string;
    status: 'Valid' | 'Expiring Soon' | 'Expired';
  }>;
}

export function CalibrationRequestModal({
  isOpen,
  onOpenChange,
  equipmentList
}: CalibrationRequestModalProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const dueSoonEquipment = equipmentList.filter(eq => 
    eq.status === 'Expiring Soon' || eq.status === 'Expired'
  );

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedEquipment(dueSoonEquipment.map(eq => eq.id));
    } else {
      setSelectedEquipment([]);
    }
  };

  const handleEquipmentSelect = (equipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipment(prev => [...prev, equipmentId]);
    } else {
      setSelectedEquipment(prev => prev.filter(id => id !== equipmentId));
      setSelectAll(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedEquipment.length === 0) {
      toast({
        title: "No Equipment Selected",
        description: "Please select at least one equipment for calibration request.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Calibration Request Submitted",
        description: `Request submitted for ${selectedEquipment.length} equipment. Admin will be notified.`,
      });
      
      setIsSubmitting(false);
      onOpenChange(false);
      setSelectedEquipment([]);
      setSelectAll(false);
      setNotes("");
    }, 1500);
  };

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
            <X className="h-3 w-3" />
            Expired
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Request Equipment Calibration
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Quick Selection</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm">
                    Select all equipment due for calibration ({dueSoonEquipment.length})
                  </label>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Equipment List */}
          <Card>
            <CardHeader>
              <h3 className="font-medium">Select Equipment</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              {equipmentList.map((equipment) => (
                <div key={equipment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={equipment.id}
                    checked={selectedEquipment.includes(equipment.id)}
                    onCheckedChange={(checked) => 
                      handleEquipmentSelect(equipment.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{equipment.nama_alat}</p>
                        <p className="text-sm text-muted-foreground">
                          Next calibration: {equipment.nextCalibration}
                        </p>
                      </div>
                      {getStatusBadge(equipment.status)}
                    </div>
                  </div>
                </div>
              ))}
              
              {equipmentList.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No equipment available for calibration request</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <h3 className="font-medium">Additional Notes</h3>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any special requirements or notes for the calibration request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Selected Summary */}
          {selectedEquipment.length > 0 && (
            <Card className="bg-muted">
              <CardContent className="pt-4">
                <p className="text-sm">
                  <strong>{selectedEquipment.length}</strong> equipment selected for calibration request
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || selectedEquipment.length === 0}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}