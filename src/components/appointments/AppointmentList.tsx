
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Car, Filter } from "lucide-react";
import { useAppointmentData } from "./useAppointmentData";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface AppointmentListProps {
  filter?: 'upcoming' | 'history' | 'all';
}

const AppointmentList = ({ filter = 'upcoming' }: AppointmentListProps) => {
  const { profile } = useAuth();
  const { appointments, isLoading } = useAppointmentData();
  const [sortBy, setSortBy] = useState<string>('date');

  // Filter appointments based on the filter prop
  const filteredAppointments = appointments.filter(apt => {
    const scheduledDate = new Date(apt.scheduled_at);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return scheduledDate > now && apt.status !== 'cancelled';
    } else if (filter === 'history') {
      return scheduledDate <= now || apt.status === 'completed' || apt.status === 'cancelled';
    }
    return true; // 'all' filter
  });

  const sortedAppointments = filteredAppointments?.sort((a, b) => {
    switch (sortBy) {
      case 'status':
        return a.status.localeCompare(b.status);
      case 'garage':
        return (a.workshop?.name || '').localeCompare(b.workshop?.name || '');
      case 'vehicle':
        const aVehicle = a.vehicle ? `${a.vehicle.make} ${a.vehicle.model}` : '';
        const bVehicle = b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : '';
        return aVehicle.localeCompare(bVehicle);
      case 'date':
      default:
        return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filter === 'history' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Sort by:</span>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="garage">Garage</SelectItem>
              <SelectItem value="vehicle">Vehicle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {!sortedAppointments || sortedAppointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {filter === 'upcoming' ? 'No upcoming appointments' : 'No appointment history'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => {
            const scheduledDate = new Date(appointment.scheduled_at);
            const appointmentDate = format(scheduledDate, 'PPP');
            const appointmentTime = format(scheduledDate, 'HH:mm');

            return (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{appointment.service_type}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{appointmentDate}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{appointmentTime}</span>
                        </div>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Show workshop info for clients, client info for workshops */}
                    {profile?.role === 'client' && appointment.workshop && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{appointment.workshop.name}</p>
                          <p className="text-sm text-gray-600">{appointment.workshop.phone || 'No phone available'}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile?.role === 'workshop' && appointment.client && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{appointment.client.full_name}</p>
                          <p className="text-sm text-gray-600">{appointment.client.phone || 'No phone available'}</p>
                        </div>
                      </div>
                    )}

                    {appointment.vehicle && (
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">
                            {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                          </p>
                          <p className="text-sm text-gray-600">{appointment.vehicle.license_plate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {appointment.description && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{appointment.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
