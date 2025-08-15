import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download } from "lucide-react";

export default function Reports() {
  const userRole = "owner";
  const tenantName = "RS Umum Daerah Bantul";

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Generate detailed reports for equipment management
            </p>
          </div>
          <Button variant="medical" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Reports Module</h3>
          <p className="text-muted-foreground mb-4">
            This module is under development. Coming soon!
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}