import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Equipment from "./pages/Equipment";
import AddEquipment from "./pages/AddEquipment";
import EquipmentDetail from "./pages/EquipmentDetail";
import Maintenance from "./pages/Maintenance";
import Inspections from "./pages/Inspections";
import Calibrations from "./pages/Calibrations";
import Reports from "./pages/Reports";
import Users from "./pages/Users";
import Settings from "./pages/Settings";

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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/equipment/add" element={<AddEquipment />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/inspections" element={<Inspections />} />
            <Route path="/calibrations" element={<Calibrations />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
