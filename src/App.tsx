
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { WorkshopProvider } from "@/hooks/useWorkshop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import ClientAppointments from "./pages/ClientAppointments";
import ClientQuotations from "./pages/ClientQuotations";
import ClientServiceHistory from "./pages/ClientServiceHistory";
import ClientVehicles from "./pages/ClientVehicles";
import ClientAccount from "./pages/ClientAccount";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <WorkshopProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Client-specific routes */}
                <Route path="/appointments" element={<ClientAppointments />} />
                <Route path="/quotations" element={<ClientQuotations />} />
                <Route path="/service-history" element={<ClientServiceHistory />} />
                <Route path="/vehicles" element={<ClientVehicles />} />
                <Route path="/account" element={<ClientAccount />} />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WorkshopProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
