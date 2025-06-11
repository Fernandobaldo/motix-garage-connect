
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, User, MessageSquare, FileText, Car, Building, Wrench, Users } from "lucide-react";
import ServiceScheduling from "@/components/dashboard/ServiceScheduling";
import UserProfileTab from "@/components/dashboard/UserProfileTab";
import WorkshopTab from "@/components/dashboard/WorkshopTab";
import VehicleServiceTab from "@/components/dashboard/VehicleServiceTab";
import QuotationManager from "@/components/dashboard/QuotationManager";
import TenantStats from "@/components/dashboard/TenantStats";
import NotificationBell from "@/components/notifications/NotificationBell";
import LandingPage from "@/components/landing/LandingPage";
import ChatInterface from "@/components/chat/ChatInterface";
import VehicleManager from "@/components/appointments/VehicleManager";
import RoleGuard from "@/components/auth/RoleGuard";
import ClientsManager from "@/components/clients/ClientsManager";

const Index = () => {
  const { user, signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("appointments");
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for tab and appointment
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    const appointmentParam = urlParams.get('appointment');

    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (appointmentParam) {
      setSelectedAppointmentId(appointmentParam);
    }

    // Listen for tab change events
    const handleTabChange = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    window.addEventListener('tabChange', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('tabChange', handleTabChange as EventListener);
    };
  }, []);

  if (!user) {
    return <LandingPage />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard...</h2>
          <p className="text-muted-foreground">Please wait while we load your information.</p>
        </div>
      </div>
    );
  }

  const userRole = profile.role as 'client' | 'workshop';

  const handleCardClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Garage Management
            </h1>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-gray-600">
                Welcome back, {profile?.full_name || 'User'}!
              </span>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <TenantStats onCardClick={handleCardClick} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {userRole === 'client' ? (
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </TabsTrigger>

              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Wrench className="h-4 w-4" />
                <span>Service Records</span>
              </TabsTrigger>

              <TabsTrigger value="vehicles" className="flex items-center space-x-2">
                <Car className="h-4 w-4" />
                <span>My Vehicles</span>
              </TabsTrigger>

              <TabsTrigger value="messages" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>

              <TabsTrigger value="quotations" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Quotations</span>
              </TabsTrigger>

              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>
          ) : (
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="appointments" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Appointments</span>
              </TabsTrigger>

              <TabsTrigger value="services" className="flex items-center space-x-2">
                <Wrench className="h-4 w-4" />
                <span>Service Records</span>
              </TabsTrigger>

              <TabsTrigger value="clients" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Clients</span>
              </TabsTrigger>

              <TabsTrigger value="messages" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>

              <TabsTrigger value="quotations" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Quotations</span>
              </TabsTrigger>

              <TabsTrigger value="profile" className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="appointments">
            <ServiceScheduling userRole={userRole} />
          </TabsContent>

          <TabsContent value="services">
            <VehicleServiceTab />
          </TabsContent>

          {userRole === 'client' && (
            <TabsContent value="vehicles">
              <VehicleManager />
            </TabsContent>
          )}

          {userRole === 'workshop' && (
            <TabsContent value="clients">
              <ClientsManager />
            </TabsContent>
          )}

          <TabsContent value="messages">
            <ChatInterface appointmentId={selectedAppointmentId} />
          </TabsContent>

          <TabsContent value="quotations">
            <QuotationManager userRole={userRole} />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfileTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
