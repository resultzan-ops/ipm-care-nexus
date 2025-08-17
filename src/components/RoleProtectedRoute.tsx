import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppRole, hasPermission, Permission } from '@/lib/permissions';
import { Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  requiredPermission?: Permission;
  fallbackPath?: string;
}

export default function RoleProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermission,
  fallbackPath = "/" 
}: RoleProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Profile tidak ditemukan. Silakan hubungi administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const userRole = profile.role as AppRole;

  // Check specific role requirement
  if (requiredRole && userRole !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Akses ditolak. Anda tidak memiliki role yang diperlukan: {requiredRole}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Akses ditolak. Anda tidak memiliki permission: {requiredPermission}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}