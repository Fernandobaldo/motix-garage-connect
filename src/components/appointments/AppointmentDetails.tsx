
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Car, User, Filter } from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import type { Appointment } from './types';

interface AppointmentDetailsProps {
  selectedDate: Date;
  appointments: Appointment[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  userRole: 'client' | 'workshop';
  loading: boolean;
}

const AppointmentDetails = ({ 
  selectedDate, 
  appointments, 
  statusFilter, 
  onStatusFilterChange, 
  userRole, 
  loading 
}: AppointmentDetailsProps) => {
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

  // Filter appointments by selected date and status
  const filteredAppointments = appointments
    .filter(apt => isSameDay(parseISO(apt.scheduled_at), selectedDate))
    .filter(apt => statusFilter === 'all' || apt.status === statusFilter)
    .sort((a, b) => parseISO(a.scheduled_at).getTime() - parseISO(b.scheduled_at).getTime());

  return (
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
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
            {filteredAppointments.map((appointment) => (
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
  );
};

export default AppointmentDetails;
