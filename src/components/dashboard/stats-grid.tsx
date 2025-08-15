import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity, 
  AlertTriangle, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Wrench
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatsCard({ title, value, subtitle, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={`equipment-card ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp 
              className={`h-3 w-3 mr-1 ${
                trend.isPositive ? 'text-success' : 'text-danger'
              }`} 
            />
            <span 
              className={`text-xs ${
                trend.isPositive ? 'text-success' : 'text-danger'
              }`}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  userRole: "super_admin" | "admin_mitra" | "admin_klien" | "teknisi_mitra" | "operator_klien";
}

export function StatsGrid({ userRole }: StatsGridProps) {
  // Mock data - in real app this would come from API
  const stats = {
    totalEquipment: 156,
    totalValue: 2450000000, // IDR
    maintenanceNeeded: 12,
    calibrationDue: 8,
    activeInspections: 24,
    overdueItems: 3,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Equipment"
        value={stats.totalEquipment}
        subtitle="Active medical devices"
        icon={Activity}
        trend={{ value: 5.2, isPositive: true }}
      />
      
      <StatsCard
        title="Total Asset Value"
        value={formatCurrency(stats.totalValue)}
        subtitle="Equipment investment"
        icon={DollarSign}
        trend={{ value: 2.1, isPositive: true }}
      />
      
      <StatsCard
        title="Maintenance Needed"
        value={stats.maintenanceNeeded}
        subtitle="Scheduled this week"
        icon={Wrench}
        className="border-warning/20"
      />
      
      <StatsCard
        title="Calibration Due"
        value={stats.calibrationDue}
        subtitle="Within 30 days"
        icon={Calendar}
        className="border-danger/20"
      />
      
      {userRole === 'teknisi_mitra' && (
        <>
          <StatsCard
            title="My Active Tasks"
            value={stats.activeInspections}
            subtitle="Assigned inspections"
            icon={Activity}
          />
          
          <StatsCard
            title="Overdue Items"
            value={stats.overdueItems}
            subtitle="Requires attention"
            icon={AlertTriangle}
            className="border-danger/20"
          />
        </>
      )}
    </div>
  );
}