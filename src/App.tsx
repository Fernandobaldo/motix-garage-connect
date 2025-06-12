
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import ClientAccount from "./pages/ClientAccount";
import ClientAppointments from "./pages/ClientAppointments";
import ClientVehicles from "./pages/ClientVehicles";
import ClientQuotations from "./pages/ClientQuotations";
import ClientServiceHistory from "./pages/ClientServiceHistory";
import PublicBooking from "./pages/PublicBooking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TenantProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/client/account" element={<ClientAccount />} />
                <Route path="/client/appointments" element={<ClientAppointments />} />
                <Route path="/client/vehicles" element={<ClientVehicles />} />
                <Route path="/client/quotations" element={<ClientQuotations />} />
                <Route path="/client/service-history" element={<ClientServiceHistory />} />
                <Route path="/book/:slug" element={<PublicBooking />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </TenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
