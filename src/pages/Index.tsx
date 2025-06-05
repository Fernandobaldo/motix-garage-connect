
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings, User, MessageSquare, FileText, Car, Building } from "lucide-react";
import Dashboard from "@/components/dashboard/Dashboard";
import UserProfileTab from "@/components/dashboard/UserProfileTab";
import WorkshopTab from "@/components/dashboard/WorkshopTab";
import TenantSetup from "@/components/tenant/TenantSetup";
import AppointmentBooking from "@/components/appointments/AppointmentBooking";
import RoleGuard from "@/components/auth/RoleGuard";

const Index = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Workshop Management System
            </CardTitle>
            <CardDescription>
              Connect clients with trusted automotive workshops
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => window.location.href = '/auth'}
                variant="outline"
                className="w-full"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Workshop Management
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back!
              </span>
              <Button onClick={signOut} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Dashboard</span>
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
            <Dashboard />
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Messages</span>
                </CardTitle>
                <CardDescription>
                  Chat with clients and workshops
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Message system coming soon...</p>
              </CardContent>
            </Card>
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
