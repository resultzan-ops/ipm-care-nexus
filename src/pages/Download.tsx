import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download as DownloadIcon, FileText, FileSpreadsheet, Database, Camera } from "lucide-react";

export default function Download() {
  const userRole = "super_admin";
  const tenantName = "IPM System";

  const downloadItems = [
    {
      icon: FileText,
      title: "Equipment Reports",
      description: "Download equipment maintenance and calibration reports",
      format: "PDF",
      size: "2.3 MB"
    },
    {
      icon: FileSpreadsheet,
      title: "Data Export",
      description: "Export equipment data to spreadsheet format",
      format: "Excel",
      size: "1.8 MB"
    },
    {
      icon: Database,
      title: "Database Backup",
      description: "Download complete database backup",
      format: "SQL",
      size: "15.7 MB"
    },
    {
      icon: Camera,
      title: "Equipment Photos",
      description: "Download all equipment photos archive",
      format: "ZIP",
      size: "45.2 MB"
    },
    {
      icon: FileText,
      title: "Calibration Certificates",
      description: "Download all calibration certificates",
      format: "PDF",
      size: "8.9 MB"
    },
    {
      icon: FileSpreadsheet,
      title: "Maintenance Schedule",
      description: "Download maintenance schedule template",
      format: "Excel",
      size: "856 KB"
    }
  ];

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Download Center</h1>
            <p className="text-muted-foreground">Download reports, data exports, and system files</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {downloadItems.map((item) => (
            <Card key={item.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.format}</div>
                    <div className="text-xs text-muted-foreground">{item.size}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}