
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Equipment from "./pages/Equipment";
import AddEquipment from "./pages/AddEquipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import Maintenance from "./pages/Maintenance";
import Inspections from "./pages/Inspections";
import Calibrations from "./pages/Calibrations";
import CalibrationRequests from "./pages/CalibrationRequests";
import CalibrationProcess from "./pages/CalibrationProcess";
import CalibrationHistory from "./pages/CalibrationHistory";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import UserManagement from "./pages/UserManagement";
import Companies from "./pages/Companies";
import CompanyUserManagement from "./pages/CompanyUserManagement";
import Settings from "./pages/Settings";
import PromoteSuperAdmin from "./pages/PromoteSuperAdmin";
import Monitoring from "./pages/Monitoring";
import Tools from "./pages/Tools";
import Download from "./pages/Download";
import Tasks from "./pages/Tasks";
import GlobalReports from "./pages/GlobalReports";
import SuperAdminUserManagement from "./pages/SuperAdminUserManagement";
import SuperAdminRoleManagement from "./pages/SuperAdminRoleManagement";

const App = () => {
  // Create QueryClient inside component to avoid SSR issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            {/* Equipment routes */}
            <Route path="/equipment" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="equipment">
                  <Equipment />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/equipment/add" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="equipment">
                  <AddEquipment />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/equipment/:id" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="equipment">
                  <EquipmentDetail />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            
            {/* Maintenance & Operations routes */}
            <Route path="/maintenance" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="maintenance">
                  <Maintenance />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/inspections" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="inspections">
                  <Inspections />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            
            {/* Calibration routes */}
            <Route path="/calibrations" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="calibrations">
                  <Calibrations />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/calibrations/requests" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="calibrations">
                  <CalibrationRequests />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/calibrations/process" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="calibrations">
                  <CalibrationProcess />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/calibrations/history" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="calibrations">
                  <CalibrationHistory />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            
            {/* Reporting routes */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="reports">
                  <Reports />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/global-reports" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="global_reports">
                  <GlobalReports />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            
            {/* Management routes - Super Admin only */}
            <Route path="/users" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRole="super_admin">
                  <Users />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="company_management">
                  <Companies />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/company-user-management" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="user_management">
                  <CompanyUserManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/user-management" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRole="super_admin">
                  <SuperAdminUserManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/role-management" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRole="super_admin">
                  <SuperAdminRoleManagement />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            
            {/* System routes */}
            <Route path="/tasks" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="tasks">
                  <Tasks />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/monitoring" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="monitoring">
                  <Monitoring />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/tools" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="tools">
                  <Tools />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/download" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="download">
                  <Download />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredPermission="settings">
                  <Settings />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            <Route path="/promote-super-admin" element={
              <ProtectedRoute>
                <RoleProtectedRoute requiredRole="super_admin">
                  <PromoteSuperAdmin />
                </RoleProtectedRoute>
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
