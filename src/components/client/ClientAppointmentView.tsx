
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, MessageSquare, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppointmentBooking from '@/components/appointments/AppointmentBooking';
import ChatAvailabilityChecker from './ChatAvailabilityChecker';

const ClientAppointmentView = () => {
  const { user } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: appointments, isLoading, refetch } = useQuery({
    queryKey: ['clientAppointments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          workshop:workshops!appointments_workshop_id_fkey(name, phone, address, tenant_id),
          vehicle:vehicles!appointments_vehicle_id_fkey(make, model, year, license_plate)
        `)
        .eq('client_id', user.id)
        .order('scheduled_at', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const upcomingAppointments = appointments?.filter(
    apt => new Date(apt.scheduled_at) >= new Date()
  ) || [];

  const pastAppointments = appointments?.filter(
    apt => new Date(apt.scheduled_at) < new Date()
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">Manage your vehicle service appointments</p>
        </div>
        <Button onClick={() => setShowBookingModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Book Service
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
              <p className="text-gray-500 mb-4">Schedule your next vehicle service</p>
              <Button onClick={() => setShowBookingModal(true)}>
                Book Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{appointment.service_type}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {appointment.vehicle?.make} {appointment.vehicle?.model} {appointment.vehicle?.year}
                        {appointment.vehicle?.license_plate && ` (${appointment.vehicle.license_plate})`}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(appointment.scheduled_at), 'EEEE, MMMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2 h-4 w-4" />
                    {format(new Date(appointment.scheduled_at), 'h:mm a')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="mr-2 h-4 w-4" />
                    {appointment.workshop?.name}
                    {appointment.workshop?.address && ` - ${appointment.workshop.address}`}
                  </div>
                  {appointment.workshop?.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {appointment.workshop.phone}
                    </div>
                  )}
                  {appointment.description && (
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">Notes:</p>
                      <p>{appointment.description}</p>
                    </div>
                  )}
                  
                  {/* Chat Button with Availability Check */}
                  {appointment.status === 'confirmed' && (
                    <ChatAvailabilityChecker 
                      appointment={appointment}
                      onChatAvailable={() => {
                        // Navigate to chat with this appointment
                        console.log('Navigate to chat for appointment:', appointment.id);
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Past Appointments</h2>
          <div className="grid gap-4">
            {pastAppointments.slice(0, 5).map((appointment) => (
              <Card key={appointment.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{appointment.service_type}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {appointment.vehicle?.make} {appointment.vehicle?.model} {appointment.vehicle?.year}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(new Date(appointment.scheduled_at), 'MMMM dd, yyyy')}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="mr-2 h-4 w-4" />
                    {appointment.workshop?.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book New Service</DialogTitle>
          </DialogHeader>
          <AppointmentBooking 
            onSuccess={() => {
              setShowBookingModal(false);
              refetch();
            }} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAppointmentView;
