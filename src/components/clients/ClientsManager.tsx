
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Phone, Mail, Car, Calendar, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ManualAppointmentBooking from "./ManualAppointmentBooking";

interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  }>;
  service_count: number;
  last_service_date: string;
}

const ClientsManager = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showManualBooking, setShowManualBooking] = useState(false);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];

      // Get all clients who have had appointments with this garage
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

      // Get unique clients
      const uniqueClients = appointments.reduce((acc: any[], appointment) => {
        const existingClient = acc.find(c => c.id === appointment.client_id);
        if (!existingClient && appointment.profiles) {
          acc.push({
            id: appointment.client_id,
            full_name: appointment.profiles.full_name,
            phone: appointment.profiles.phone,
            email: '', // We'll need to get this from auth.users if needed
          });
        }
        return acc;
      }, []);

      // For each client, get their vehicles and service history
      const clientsWithDetails = await Promise.all(
        uniqueClients.map(async (client) => {
          // Get client's vehicles
          const { data: vehicles } = await supabase
            .from('vehicles')
            .select('id, make, model, year, license_plate')
            .eq('owner_id', client.id);

          // Get service count and last service
          const { data: serviceHistory, count } = await supabase
            .from('service_history')
            .select('completed_at', { count: 'exact' })
            .eq('tenant_id', profile.tenant_id)
            .eq('vehicle_id', vehicles?.[0]?.id || '')
            .order('completed_at', { ascending: false })
            .limit(1);

          return {
            ...client,
            vehicles: vehicles || [],
            service_count: count || 0,
            last_service_date: serviceHistory?.[0]?.completed_at || null,
          };
        })
      );

      return clientsWithDetails;
    },
    enabled: !!profile?.tenant_id,
  });

  const filteredClients = clients?.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm) ||
    client.vehicles.some(v => 
      `${v.make} ${v.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) || [];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Clients Database</h2>
        </div>
        <Button onClick={() => setShowManualBooking(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Appointment</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search clients, vehicles, or license plates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600">
          {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No clients found matching your search' : 'No clients yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{client.full_name}</CardTitle>
                <CardDescription className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone || 'No phone'}</span>
                  </div>
                  {client.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{client.email}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Vehicles</h4>
                    {client.vehicles.length > 0 ? (
                      <div className="space-y-1">
                        {client.vehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center space-x-2 text-sm">
                            <Car className="h-3 w-3 text-gray-400" />
                            <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                            <Badge variant="outline" className="text-xs">
                              {vehicle.license_plate}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No vehicles registered</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">Services: {client.service_count}</span>
                    </div>
                    {client.last_service_date && (
                      <span className="text-gray-500">
                        Last: {new Date(client.last_service_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

export default ClientsManager;
