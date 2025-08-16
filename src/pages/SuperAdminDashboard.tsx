import { SuperAdminLayout } from "@/components/layouts/SuperAdminLayout";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building, 
  Activity, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SuperAdminDashboard() {
  // Mock data - in real app, fetch from Supabase
  const systemStats = {
    totalUsers: 247,
    totalCompanies: 45,
    totalEquipment: 1834,
    activeCalibrations: 23,
    pendingRequests: 12,
    overdueMaintenances: 8,
    systemUptime: "99.8%",
    lastBackup: "2024-01-15 03:00 AM"
  };

  const recentActivities = [
    {
      id: 1,
      type: "user_created",
      message: "New user 'Dr. Ahmad Wijaya' created for RS Jakarta",
      timestamp: "2 hours ago",
      status: "success"
    },
    {
      id: 2,
      type: "calibration_completed",
      message: "Calibration completed for MRI Scanner #MRI-001",
      timestamp: "4 hours ago",
      status: "success"
    },
    {
      id: 3,
      type: "maintenance_overdue",
      message: "Maintenance overdue for X-Ray Machine #XR-025",
      timestamp: "6 hours ago",
      status: "warning"
    },
    {
      id: 4,
      type: "company_registered",
      message: "New company 'PT Medika Sejahtera' registered",
      timestamp: "1 day ago",
      status: "info"
    }
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users and their roles",
      icon: Users,
      href: "/user-management",
      color: "bg-blue-500"
    },
    {
      title: "Role Management", 
      description: "Configure roles and permissions",
      icon: Shield,
      href: "/role-management",
      color: "bg-purple-500"
    },
    {
      title: "Company Management",
      description: "Manage companies and organizations",
      icon: Building,
      href: "/companies",
      color: "bg-green-500"
    },
    {
      title: "System Settings",
      description: "Configure system parameters",
      icon: Settings,
      href: "/settings",
      color: "bg-orange-500"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_created":
        return <Users className="h-4 w-4" />;
      case "calibration_completed":
        return <CheckCircle className="h-4 w-4" />;
      case "maintenance_overdue":
        return <AlertTriangle className="h-4 w-4" />;
      case "company_registered":
        return <Building className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "error":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management tools
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                +3 new this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Equipment</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalEquipment}</div>
              <p className="text-xs text-muted-foreground">
                Across all companies
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.systemUptime}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks and system management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} to={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${action.color} text-white`}>
                          <action.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Important system notifications and warnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">Pending Calibration Requests</p>
                    <p className="text-xs text-muted-foreground">
                      {systemStats.pendingRequests} requests awaiting approval
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {systemStats.pendingRequests}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-sm">Overdue Maintenances</p>
                    <p className="text-xs text-muted-foreground">
                      {systemStats.overdueMaintenances} equipment require maintenance
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-auto">
                    {systemStats.overdueMaintenances}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Active Calibrations</p>
                    <p className="text-xs text-muted-foreground">
                      {systemStats.activeCalibrations} currently in progress
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto">
                    {systemStats.activeCalibrations}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest system activities and user actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded-full ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  View All Activities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
}