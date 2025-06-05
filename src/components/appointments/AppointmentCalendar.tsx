
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Car, User, Filter } from 'lucide-react';
import { format, isSameDay, parseISO, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  service_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  client: {
    full_name: string;
  } | null;
  vehicle: {
    make: string;
    model: string;
    year: number;
  } | null;
}

interface AppointmentCalendarProps {
  userRole: 'client' | 'workshop';
}

const AppointmentCalendar = ({ userRole }: AppointmentCalendarProps) => {
  const { user, profile } = useAuth();
  const { tenant } = useTenant();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

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
          scheduled_at,
          duration_minutes,
          status,
          client:profiles!appointments_client_id_fkey(full_name),
          vehicle:vehicles(make, model, year)
        `)
        .eq('tenant_id', tenant.id)
        .order('scheduled_at', { ascending: true });

      if (userRole === 'client') {
        query = query.eq('client_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading appointments:', error);
        return;
      }

      console.log('Raw appointment data:', data);

      // Filter out any appointments with invalid data and ensure proper typing
      const validAppointments: Appointment[] = (data || [])
        .filter(apt => apt && typeof apt === 'object' && !('error' in apt))
        .map(apt => ({
          id: apt.id,
          service_type: apt.service_type,
          scheduled_at: apt.scheduled_at,
          duration_minutes: apt.duration_minutes,
          status: apt.status,
          client: apt.client && typeof apt.client === 'object' && !('error' in apt.client) 
            ? apt.client 
            : null,
          vehicle: apt.vehicle && typeof apt.vehicle === 'object' && !('error' in apt.vehicle)
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

  useEffect(() => {
    let filtered = appointments.filter(apt => 
      isSameDay(parseISO(apt.scheduled_at), selectedDate)
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, selectedDate, statusFilter]);

  // Get days with appointments for calendar highlighting
  const getDaysWithAppointments = () => {
    const daysWithAppointments = new Set();
    appointments.forEach(apt => {
      const date = parseISO(apt.scheduled_at);
      daysWithAppointments.add(format(date, 'yyyy-MM-dd'));
    });
    return daysWithAppointments;
  };

  const daysWithAppointments = getDaysWithAppointments();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'client' ? 'My Calendar' : 'Workshop Calendar'}
        </h2>
        <p className="text-gray-600">
          View appointments in calendar format
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className={cn("w-full pointer-events-auto")}
              modifiers={{
                hasAppointment: (date) => daysWithAppointments.has(format(date, 'yyyy-MM-dd'))
              }}
              modifiersStyles={{
                hasAppointment: {
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Appointments for {format(selectedDate, 'PPPP')}
                </CardTitle>
                <CardDescription>
                  {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments</h3>
                <p className="text-gray-500">
                  No appointments scheduled for this date.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments
                  .sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime())
                  .map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium text-gray-900">
                            {appointment.service_type}
                          </h4>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(parseISO(appointment.scheduled_at), 'HH:mm')}
                              {' '}({appointment.duration_minutes}m)
                            </span>
                          </div>
                          
                          {appointment.vehicle && (
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4" />
                              <span>
                                {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                              </span>
                            </div>
                          )}
                          
                          {userRole === 'workshop' && appointment.client && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{appointment.client.full_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
