import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./Dashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";

const Index = () => {
  const { user } = useAuth();
  
  // Mock user role check - in real app, get from user profile/session
  // For demo purposes, checking if user email contains "superadmin"
  const userRole = user?.email?.includes("superadmin") ? "super_admin" : "operator";
  
  // Route to appropriate dashboard based on role
  if (userRole === "super_admin") {
    return <SuperAdminDashboard />;
  }
  
  return <Dashboard />;
};

export default Index;
