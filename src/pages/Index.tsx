import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./Dashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, profile, loading, error } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading user profile...</p>
        </div>
      </div>
    );
  }

  // Show debug component if there's an error or missing profile
  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AuthDebug />
      </div>
    );
  }
  
  // FIXED: Use actual role from profile, not email checking
  const userRole = profile?.role || "operator";
  
  // Route to appropriate dashboard based on actual role
  if (userRole === "super_admin") {
    return <SuperAdminDashboard />;
  }
  
  return <Dashboard />;
};

export default Index;
