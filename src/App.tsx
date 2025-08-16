
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
import GlobalReports from "./pages/GlobalReports";

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
            <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/equipment/add" element={<ProtectedRoute><AddEquipment /></ProtectedRoute>} />
            <Route path="/equipment/:id" element={<ProtectedRoute><EquipmentDetail /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
            <Route path="/inspections" element={<ProtectedRoute><Inspections /></ProtectedRoute>} />
            <Route path="/calibrations" element={<ProtectedRoute><Calibrations /></ProtectedRoute>} />
            <Route path="/calibrations/requests" element={<ProtectedRoute><CalibrationRequests /></ProtectedRoute>} />
            <Route path="/calibrations/process" element={<ProtectedRoute><CalibrationProcess /></ProtectedRoute>} />
            <Route path="/calibrations/history" element={<ProtectedRoute><CalibrationHistory /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/user-management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
            <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
            <Route path="/company-user-management" element={<ProtectedRoute><CompanyUserManagement /></ProtectedRoute>} />
            <Route path="/global-reports" element={<ProtectedRoute><GlobalReports /></ProtectedRoute>} />
            <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
            <Route path="/tools" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
            <Route path="/download" element={<ProtectedRoute><Download /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/promote-super-admin" element={<ProtectedRoute><PromoteSuperAdmin /></ProtectedRoute>} />
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
