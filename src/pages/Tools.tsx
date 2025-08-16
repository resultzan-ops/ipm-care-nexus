import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Settings, Calculator, QrCode, Printer, Database } from "lucide-react";

export default function Tools() {
  const userRole = "super_admin";
  const tenantName = "IPM System";

  const tools = [
    {
      icon: QrCode,
      title: "QR Code Generator",
      description: "Generate QR codes for equipment",
      action: "Generate QR"
    },
    {
      icon: Printer,
      title: "Barcode Printer",
      description: "Print barcodes for equipment",
      action: "Print Barcode"
    },
    {
      icon: Calculator,
      title: "Calibration Calculator",
      description: "Calculate calibration intervals",
      action: "Calculate"
    },
    {
      icon: Database,
      title: "Data Export",
      description: "Export data to various formats",
      action: "Export Data"
    },
    {
      icon: Settings,
      title: "System Configuration",
      description: "Configure system settings",
      action: "Configure"
    },
    {
      icon: Wrench,
      title: "Maintenance Tools",
      description: "Various maintenance utilities",
      action: "Open Tools"
    }
  ];

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tools</h1>
            <p className="text-muted-foreground">Utilities and tools for system management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Card key={tool.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <tool.icon className="h-6 w-6 text-primary" />
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                </div>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">{tool.action}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}