import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart3, TrendingUp, Globe, Building, Users } from "lucide-react";

function GlobalReports() {
  const userRole = "super_admin";
  const tenantName = "IPM System";

  const reports = [
    {
      icon: Globe,
      title: "Global System Overview",
      description: "Comprehensive overview of all companies and equipment",
      type: "Dashboard Report"
    },
    {
      icon: Building,
      title: "Company Performance",
      description: "Performance metrics across all registered companies",
      type: "Analytics Report"
    },
    {
      icon: Users,
      title: "User Activity Report",
      description: "User engagement and activity across the platform",
      type: "User Report"
    },
    {
      icon: BarChart3,
      title: "Equipment Statistics",
      description: "Global equipment statistics and utilization",
      type: "Equipment Report"
    },
    {
      icon: TrendingUp,
      title: "Maintenance Trends",
      description: "Maintenance trends and patterns analysis",
      type: "Trend Analysis"
    },
    {
      icon: FileText,
      title: "Compliance Report",
      description: "Compliance status across all companies",
      type: "Compliance Report"
    }
  ];

  return (
    <DashboardLayout userRole={userRole} tenantName={tenantName}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Global Reports</h1>
            <p className="text-muted-foreground">System-wide reports and analytics for super administrators</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+3 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+12 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment</CardTitle>
              <BarChart3 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">Across all companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">System-wide compliance</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <report.icon className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">{report.type}</div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Report
                  </Button>
                  <Button size="sm" className="flex-1">
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default GlobalReports;