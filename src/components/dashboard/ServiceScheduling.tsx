
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import AppointmentBooking from "../appointments/AppointmentBooking";
import AppointmentList from "../appointments/AppointmentList";
import AppointmentCalendar from "../appointments/AppointmentCalendar";
import VehicleManager from "../appointments/VehicleManager";

interface ServiceSchedulingProps {
  userRole: 'client' | 'workshop';
}

const ServiceScheduling = ({ userRole }: ServiceSchedulingProps) => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          {userRole === 'client' && <TabsTrigger value="booking">Book Service</TabsTrigger>}
          {userRole === 'client' && <TabsTrigger value="vehicles">My Vehicles</TabsTrigger>}
          {userRole === 'workshop' && <TabsTrigger value="vehicles" className="col-span-2">Vehicle Database</TabsTrigger>}
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <AppointmentList userRole={userRole} />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar userRole={userRole} />
        </TabsContent>

        {userRole === 'client' && (
          <>
            <TabsContent value="booking" className="space-y-4">
              <AppointmentBooking />
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4">
              <VehicleManager />
            </TabsContent>
          </>
        )}

        {userRole === 'workshop' && (
          <TabsContent value="vehicles" className="space-y-4">
            <VehicleManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ServiceScheduling;
