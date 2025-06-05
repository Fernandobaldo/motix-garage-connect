import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Car, User, MapPin, Phone, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  service_type: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  client: {
    id: string;
    full_name: string;
    phone: string;
  } | null;
  workshop: {
    id: string;
    name: string;
  } | null;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  } | null;
}

interface AppointmentListProps {
  userRole: 'client' | 'workshop';
}

const AppointmentList = ({ userRole }: AppointmentListProps) => {
  const { user, profile } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = [
    'pending',
    'confirmed', 
    'in_progress',
    'completed',
    'cancelled'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const loadAppointments = async () => {
    if (!tenant || !user) return;

    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          service_type,
          description,
          scheduled_at,
          duration_minutes,
          status,
          client:profiles!appointments_client_id_fkey(id, full_name, phone),
          workshop:workshops!appointments_workshop_id_fkey(id, name),
          vehicle:vehicles(id, make, model, year, license_plate)
        `)
        .eq('tenant_id', tenant.id)
        .order('scheduled_at', { ascending: true });

      // Filter by user role
      if (userRole === 'client') {
        query = query.eq('client_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading appointments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointments.',
          variant: 'destructive'
        });
        return;
      }

      console.log('Raw appointment data:', data);

      // Filter out any appointments with invalid data and ensure proper typing
      const validAppointments: Appointment[] = (data || [])
        .filter(apt => apt && typeof apt === 'object')
        .map(apt => ({
          id: apt.id,
          service_type: apt.service_type,
          description: apt.description,
          scheduled_at: apt.scheduled_at,
          duration_minutes: apt.duration_minutes,
          status: apt.status,
          client: apt.client && typeof apt.client === 'object' && 'full_name' in apt.client 
            ? apt.client 
            : null,
          workshop: apt.workshop && typeof apt.workshop === 'object' && 'name' in apt.workshop
            ? apt.workshop
            : null,
          vehicle: apt.vehicle && 
                   typeof apt.vehicle === 'object' && 
                   apt.vehicle !== null &&
                   'make' in apt.vehicle && 
                   'model' in apt.vehicle && 
                   'year' in apt.vehicle && 
                   'license_plate' in apt.vehicle &&
                   'id' in apt.vehicle
            ? apt.vehicle
            : null
        }));

      console.log('Processed appointments:', validAppointments);
      setAppointments(validAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [tenant, user, userRole]);

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId);

      if (error) {
        toast({
          title: 'Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus.replace('_', ' ')}.`
      });

      // Refresh appointments
      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment status.',
        variant: 'destructive'
      });
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        toast({
          title: 'Delete Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Appointment Deleted',
        description: 'The appointment has been removed.'
      });

      loadAppointments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete appointment.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
          <p className="text-gray-500">
            {userRole === 'client' 
              ? "You don't have any appointments scheduled yet." 
              : "No appointments scheduled for your workshop."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'client' ? 'My Appointments' : 'Workshop Appointments'}
        </h2>
        <p className="text-gray-600">
          {userRole === 'client' 
            ? 'View and manage your scheduled appointments'
            : 'Manage all workshop appointments'
          }
        </p>
      </div>

      {appointments.map((appointment) => (
        <Card key={appointment.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {appointment.service_type}
                  </h3>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(appointment.scheduled_at), 'PPP')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(appointment.scheduled_at), 'HH:mm')} 
                      ({appointment.duration_minutes}m)
                    </span>
                  </div>
                  {appointment.vehicle && (
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4" />
                      <span>
                        {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                      </span>
                    </div>
                  )}
                  {userRole === 'client' ? (
                    appointment.workshop && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{appointment.workshop.name}</span>
                      </div>
                    )
                  ) : (
                    appointment.client && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{appointment.client.full_name}</span>
                      </div>
                    )
                  )}
                </div>

                {userRole === 'workshop' && appointment.client?.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{appointment.client.phone}</span>
                  </div>
                )}

                {appointment.description && (
                  <p className="text-sm text-gray-700">{appointment.description}</p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                {userRole === 'workshop' && (
                  <Select
                    value={appointment.status}
                    onValueChange={(value) => updateAppointmentStatus(appointment.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => deleteAppointment(appointment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentList;
