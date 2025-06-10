
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Car, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface AppointmentListProps {
  filter?: 'upcoming' | 'history' | 'all';
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  service_type: string;
  notes?: string;
  garage: {
    garage_name: string;
    location: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: number;
    license_plate: string;
  };
}

const AppointmentList = ({ filter = 'upcoming' }: AppointmentListProps) => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState<string>('date');

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', user?.id, filter],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('appointments')
        .select(`
          *,
          garage:garages!garage_id(garage_name, location),
          vehicle:vehicles!vehicle_id(make, model, year, license_plate)
        `)
        .eq('user_id', user.id);

      // Apply filter based on the prop
      const now = new Date().toISOString();
      if (filter === 'upcoming') {
        query = query.gte('appointment_date', now.split('T')[0])
          .in('status', ['pending', 'confirmed']);
      } else if (filter === 'history') {
        query = query.or(`appointment_date.lt.${now.split('T')[0]},status.in.(completed,cancelled)`);
      }

      const { data, error } = await query.order('appointment_date', { ascending: filter === 'upcoming' });

      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!user?.id,
  });

  const sortedAppointments = appointments?.sort((a, b) => {
    switch (sortBy) {
      case 'status':
        return a.status.localeCompare(b.status);
      case 'garage':
        return a.garage.garage_name.localeCompare(b.garage.garage_name);
      case 'vehicle':
        return `${a.vehicle.make} ${a.vehicle.model}`.localeCompare(`${b.vehicle.make} ${b.vehicle.model}`);
      case 'date':
      default:
        return new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime();
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
          {sortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{appointment.service_type}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(appointment.appointment_date), 'PPP')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.appointment_time}</span>
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
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{appointment.garage.garage_name}</p>
                      <p className="text-sm text-gray-600">{appointment.garage.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">
                        {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">{appointment.vehicle.license_plate}</p>
                    </div>
                  </div>
                </div>
                {appointment.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{appointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
