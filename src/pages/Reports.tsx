import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, Activity, AlertTriangle, CheckCircle, BarChart3, PieChart } from "lucide-react";
import { useState } from "react";

const mockReportData = {
  equipmentStats: {
    total: 25,
    active: 22,
    maintenance: 2,
    retired: 1
  },
  maintenanceStats: {
    scheduled: 8,
    overdue: 3,
    completed: 45,
    inProgress: 2
  },
  inspectionStats: {
    passed: 18,
    failed: 2,
    pending: 5
  },
  calibrationStats: {
    valid: 20,
    expiringSoon: 3,
    expired: 2
  }
};

const reportTemplates = [
  {
    id: "equipment-status",
    title: "Equipment Status Report",
    description: "Comprehensive overview of all equipment status and utilization",
    icon: Activity,
    category: "Equipment"
  },
  {
    id: "maintenance-summary",
    title: "Maintenance Summary",
    description: "Monthly maintenance activities and performance metrics",
    icon: TrendingUp,
    category: "Maintenance"
  },
  {
    id: "inspection-compliance",
    title: "Inspection Compliance Report",
    description: "Equipment inspection compliance and safety metrics",
    icon: CheckCircle,
    category: "Quality"
  },
  {
    id: "calibration-status",
    title: "Calibration Status Report",
    description: "Current calibration status and upcoming requirements",
    icon: AlertTriangle,
    category: "Calibration"
  },
  {
    id: "financial-analysis",
    title: "Financial Analysis Report",
    description: "Cost analysis and budget tracking for equipment management",
    icon: BarChart3,
    category: "Financial"
  },
  {
    id: "utilization-report",
    title: "Equipment Utilization Report",
    description: "Usage patterns and efficiency metrics across departments",
    icon: PieChart,
    category: "Analytics"
  }
];

export default function Reports() {
  const userRole = "admin_klien";
  const tenantName = "RS Umum Daerah Bantul";
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredReports = reportTemplates.filter(report => 
    selectedCategory === "all" || report.category.toLowerCase() === selectedCategory
  );

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

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{mockReportData.equipmentStats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Equipment</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active:</span>
                  <span className="font-medium text-green-600">{mockReportData.equipmentStats.active}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maintenance:</span>
                  <span className="font-medium text-orange-600">{mockReportData.equipmentStats.maintenance}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{mockReportData.maintenanceStats.completed}</p>
                  <p className="text-sm text-muted-foreground">Completed Maintenance</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Scheduled:</span>
                  <span className="font-medium text-blue-600">{mockReportData.maintenanceStats.scheduled}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Overdue:</span>
                  <span className="font-medium text-red-600">{mockReportData.maintenanceStats.overdue}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{mockReportData.inspectionStats.passed}</p>
                  <p className="text-sm text-muted-foreground">Passed Inspections</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Failed:</span>
                  <span className="font-medium text-red-600">{mockReportData.inspectionStats.failed}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pending:</span>
                  <span className="font-medium text-orange-600">{mockReportData.inspectionStats.pending}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{mockReportData.calibrationStats.valid}</p>
                  <p className="text-sm text-muted-foreground">Valid Calibrations</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Expiring Soon:</span>
                  <span className="font-medium text-orange-600">{mockReportData.calibrationStats.expiringSoon}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Expired:</span>
                  <span className="font-medium text-red-600">{mockReportData.calibrationStats.expired}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 items-center">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Available Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <report.icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{report.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-secondary rounded-full">
                            {report.category}
                          </span>
                          <Button size="sm" variant="outline">Generate</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export All Data
              </Button>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Schedule Report
              </Button>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Custom Report Builder
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}