import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Save, QrCode } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AddEquipment() {
  const userRole = "owner";
  const tenantName = "RS Umum Daerah Bantul";
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch hospitals/companies for equipment form
  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospitals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, name, type')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const [formData, setFormData] = useState({
    nama_alat: "",
    kategori: undefined as string | undefined,
    nomor_seri: "",
    merk: "",
    model: "",
    lokasi: undefined as string | undefined,
    hospital_id: undefined as string | undefined,
    harga_peralatan: "",
    status: "Aktif",
    foto_peralatan: null as File | null
  });

  const categories = [
    "Medical Imaging",
    "Diagnostic", 
    "Laboratory",
    "Surgical",
    "Life Support",
    "Therapeutic",
    "Monitoring"
  ];

  const locations = [
    "Radiology Room 1",
    "Radiology Room 2", 
    "Emergency Room",
    "Operating Theater 1",
    "Operating Theater 2",
    "ICU",
    "Laboratory",
    "Cardiology Ward",
    "General Ward"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        foto_peralatan: file
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.nama_alat || !formData.kategori || !formData.nomor_seri || !formData.hospital_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including hospital/company",
        variant: "destructive"
      });
      return;
    }

    // Here you would normally send data to your backend
    console.log("Equipment data:", formData);
    
    toast({
      title: "Equipment Added",
      description: "New medical equipment has been successfully registered",
    });

    // Navigate back to equipment list
    navigate("/equipment");
  };

  const generateQRCode = () => {
    // Generate QR code for the equipment
    const categoryPrefix = formData.kategori ? formData.kategori.toUpperCase().slice(0,3) : "EQP";
    const qrData = `QR-${categoryPrefix}-${Date.now()}`;
    console.log("Generated QR Code:", qrData);
    
    toast({
      title: "QR Code Generated", 
      description: `QR Code: ${qrData}`,
    });
  };

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/equipment">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New Equipment</h1>
            <p className="text-muted-foreground mt-1">
              Register new medical equipment into the system
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nama_alat">Equipment Name *</Label>
                      <Input
                        id="nama_alat"
                        value={formData.nama_alat}
                        onChange={(e) => handleInputChange("nama_alat", e.target.value)}
                        placeholder="Enter equipment name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Category *</Label>
                      <Select value={formData.kategori} onValueChange={(value) => handleInputChange("kategori", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nomor_seri">Serial Number *</Label>
                      <Input
                        id="nomor_seri"
                        value={formData.nomor_seri}
                        onChange={(e) => handleInputChange("nomor_seri", e.target.value)}
                        placeholder="Enter serial number"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="merk">Brand</Label>
                      <Input
                        id="merk"
                        value={formData.merk}
                        onChange={(e) => handleInputChange("merk", e.target.value)}
                        placeholder="Enter brand name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => handleInputChange("model", e.target.value)}
                        placeholder="Enter model"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hospital_id">Hospital/Company *</Label>
                      <Select value={formData.hospital_id} onValueChange={(value) => handleInputChange("hospital_id", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select hospital/company" />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map(hospital => (
                            <SelectItem key={hospital.id} value={hospital.id}>
                              {hospital.name} ({hospital.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lokasi">Location</Label>
                      <Select value={formData.lokasi} onValueChange={(value) => handleInputChange("lokasi", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map(location => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                     </div>
                   </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="harga_peralatan">Equipment Value (IDR)</Label>
                      <Input
                        id="harga_peralatan"
                        type="number"
                        value={formData.harga_peralatan}
                        onChange={(e) => handleInputChange("harga_peralatan", e.target.value)}
                        placeholder="Enter equipment value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aktif">Active</SelectItem>
                          <SelectItem value="Dalam Perbaikan">Under Maintenance</SelectItem>
                          <SelectItem value="Scrap">Scrap</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Photo */}
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="foto_peralatan" className="cursor-pointer">
                          <span className="text-primary hover:text-primary/80">Click to upload</span>
                          <span className="text-muted-foreground"> or drag and drop</span>
                        </Label>
                        <Input
                          id="foto_peralatan"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 10MB
                        </p>
                      </div>
                    </div>
                    {formData.foto_peralatan && (
                      <p className="text-sm text-success">
                        Selected: {formData.foto_peralatan.name}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button type="submit" className="w-full" variant="medical">
                    <Save className="h-4 w-4 mr-2" />
                    Save Equipment
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={generateQRCode}>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                  <Link to="/equipment" className="block">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>• Ensure serial numbers are unique</p>
                  <p>• Upload clear equipment photos</p>
                  <p>• Select accurate location for tracking</p>
                  <p>• QR codes will be auto-generated</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}