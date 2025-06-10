
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Calendar, History, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AppointmentBooking from "../appointments/AppointmentBooking";
import AppointmentList from "../appointments/AppointmentList";
import AppointmentCalendar from "../appointments/AppointmentCalendar";
import ManualAppointmentBooking from "../clients/ManualAppointmentBooking";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceSchedulingProps {
  userRole: 'client' | 'workshop';
}

const ServiceScheduling = ({ userRole }: ServiceSchedulingProps) => {
  const { profile } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showManualBooking, setShowManualBooking] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ['clients-for-booking', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id || userRole !== 'workshop') return [];

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          client_id,
          profiles!appointments_client_id_fkey(
            id,
            full_name,
            phone
          )
        `)
        .eq('tenant_id', profile.tenant_id);

      if (error) throw error;

      const uniqueClients = appointments.reduce((acc: any[], appointment) => {
        const existingClient = acc.find(c => c.id === appointment.client_id);
        if (!existingClient && appointment.profiles) {
          acc.push({
            id: appointment.client_id,
            full_name: appointment.profiles.full_name,
            phone: appointment.profiles.phone,
            email: '',
            vehicles: [],
          });
        }
        return acc;
      }, []);

      return Promise.all(
        uniqueClients.map(async (client) => {
          const { data: vehicles } = await supabase
            .from('vehicles')
            .select('id, make, model, year, license_plate')
            .eq('owner_id', client.id);

          return {
            ...client,
            vehicles: vehicles || [],
          };
        })
      );
    },
    enabled: userRole === 'workshop' && !!profile?.tenant_id,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
          <p className="text-gray-600">Manage your service appointments</p>
        </div>
        <div className="flex space-x-2">
          {userRole === 'client' && (
            <Button onClick={() => setShowBookingModal(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Appointment</span>
            </Button>
          )}
          {userRole === 'workshop' && (
            <Button onClick={() => setShowManualBooking(true)} className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Create for Client</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Upcoming</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Calendar View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <AppointmentList filter="upcoming" />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <AppointmentList filter="history" />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <AppointmentCalendar userRole={userRole} />
        </TabsContent>
      </Tabs>

      {/* Client Self-Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a service appointment for your vehicle
            </DialogDescription>
          </DialogHeader>
          <AppointmentBooking onSuccess={() => setShowBookingModal(false)} />
        </DialogContent>
      </Dialog>

      {/* Manual Booking Modal for Garages */}
      <Dialog open={showManualBooking} onOpenChange={setShowManualBooking}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Appointment for Client</DialogTitle>
            <DialogDescription>
              Create a new appointment for an existing client or register a new client
            </DialogDescription>
          </DialogHeader>
          <ManualAppointmentBooking 
            onSuccess={() => setShowManualBooking(false)}
            existingClients={clients || []}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServiceScheduling;
