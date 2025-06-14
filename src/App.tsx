import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";
import { AuthProvider } from "@/hooks/useAuth";
import { TenantProvider } from "@/hooks/useTenant";
import { WorkshopProvider } from "@/hooks/useWorkshop";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ClientAccount from "./pages/ClientAccount";
import ClientAppointments from "./pages/ClientAppointments";
import ClientDetails from "./pages/ClientDetails";
import ClientQuotations from "./pages/ClientQuotations";
import ClientServiceHistory from "./pages/ClientServiceHistory";
import ClientVehicles from "./pages/ClientVehicles";
import AdminDashboard from "./pages/AdminDashboard";
import PublicBooking from "./pages/PublicBooking";
import NotFound from "./pages/NotFound";
import ClientDetailPage from "./components/clients/ClientDetailPage";
import DashboardPage from "./pages/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TenantProvider>
            <WorkshopProvider>
              <LanguageProvider>
                <TooltipProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/book/:slug" element={<PublicBooking />} />
                      <Route path="/client" element={<ClientAccount />} />
                      <Route path="/client/appointments" element={<ClientAppointments />} />
                      <Route path="/client/details" element={<ClientDetails />} />
                      <Route path="/client/quotations" element={<ClientQuotations />} />
                      <Route path="/client/service-history" element={<ClientServiceHistory />} />
                      <Route path="/client/vehicles" element={<ClientVehicles />} />
                      <Route path="/client-details/:clientId" element={<ClientDetailPage />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </LanguageProvider>
            </WorkshopProvider>
          </TenantProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
