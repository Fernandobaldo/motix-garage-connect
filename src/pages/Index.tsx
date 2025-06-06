import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings, User, MessageSquare, FileText, Car, Building, Wrench } from "lucide-react";
import ServiceScheduling from "@/components/dashboard/ServiceScheduling";
import UserProfileTab from "@/components/dashboard/UserProfileTab";
import WorkshopTab from "@/components/dashboard/WorkshopTab";
import TenantSetup from "@/components/tenant/TenantSetup";
import AppointmentBooking from "@/components/appointments/AppointmentBooking";
import ChatInterface from "@/components/chat/ChatInterface";
import RoleGuard from "@/components/auth/RoleGuard";
import VehicleServiceTab from "@/components/dashboard/VehicleServiceTab";
import QuotationManager from "@/components/dashboard/QuotationManager";
import TenantStats from "@/components/dashboard/TenantStats";
import NotificationBell from "@/components/notifications/NotificationBell";
import LandingPage from "@/components/landing/LandingPage";

const Index = () => {
  const { user, signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Workshop Management
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
          <TenantStats />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Appointments</span>
            </TabsTrigger>

            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Service Records</span>
            </TabsTrigger>
            
            <RoleGuard allowedRoles={['client']} fallback={<div />}>
              <TabsTrigger value="booking" className="flex items-center space-x-2">
                <Car className="h-4 w-4" />
                <span>Book Service</span>
              </TabsTrigger>
            </RoleGuard>

            <RoleGuard allowedRoles={['workshop']} fallback={<div />}>
              <TabsTrigger value="workshop" className="flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Workshop</span>
              </TabsTrigger>
            </RoleGuard>

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
            
            <RoleGuard allowedRoles={['workshop']} fallback={<div />}>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </RoleGuard>
          </TabsList>

          <TabsContent value="dashboard">
            <ServiceScheduling userRole={userRole} />
          </TabsContent>

          <TabsContent value="services">
            <VehicleServiceTab />
          </TabsContent>

          <TabsContent value="booking">
            <RoleGuard allowedRoles={['client']}>
              <AppointmentBooking />
            </RoleGuard>
          </TabsContent>

          <TabsContent value="workshop">
            <RoleGuard allowedRoles={['workshop']}>
              <WorkshopTab />
            </RoleGuard>
          </TabsContent>

          <TabsContent value="messages">
            <ChatInterface userRole={userRole} />
          </TabsContent>

          <TabsContent value="quotations">
            <QuotationManager userRole={userRole} />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfileTab />
          </TabsContent>

          <TabsContent value="settings">
            <RoleGuard allowedRoles={['workshop']}>
              <TenantSetup />
            </RoleGuard>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
