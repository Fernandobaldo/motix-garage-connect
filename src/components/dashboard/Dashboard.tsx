
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Bell, Calendar, Car, MessageSquare, User, FileText, Wrench } from "lucide-react";
import ServiceScheduling from "./ServiceScheduling";
import ChatInterface from "./ChatInterface";
import QuotationManager from "./QuotationManager";
import UserProfileTab from "./UserProfileTab";
import WorkshopTab from "./WorkshopTab";
import VehicleServiceTab from "./VehicleServiceTab";
import TenantStats from "./TenantStats";
import NotificationBell from "../notifications/NotificationBell";

const Dashboard = () => {
  const { profile } = useAuth();
  
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile.full_name}
          </h1>
          <p className="text-muted-foreground capitalize">
            {profile.role} Dashboard
          </p>
        </div>
        <NotificationBell />
      </div>

      <TenantStats />

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Appointments</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Service Records</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="quotations" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Quotations</span>
          </TabsTrigger>
          {userRole === 'workshop' && (
            <TabsTrigger value="workshop" className="flex items-center space-x-2">
              <Car className="h-4 w-4" />
              <span>Workshop</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <ServiceScheduling userRole={userRole} />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <VehicleServiceTab />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <ChatInterface userRole={userRole} />
        </TabsContent>

        <TabsContent value="quotations" className="space-y-4">
          <QuotationManager userRole={userRole} />
        </TabsContent>

        {userRole === 'workshop' && (
          <TabsContent value="workshop" className="space-y-4">
            <WorkshopTab />
          </TabsContent>
        )}

        <TabsContent value="profile" className="space-y-4">
          <UserProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
