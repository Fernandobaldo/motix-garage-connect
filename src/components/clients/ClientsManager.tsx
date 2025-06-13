import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Phone, Mail, Car, Calendar, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientCreationForm from "./ClientCreationForm";

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
  appointment_count: number;
  last_appointment_date: string;
}

const ClientsManager = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showClientCreation, setShowClientCreation] = useState(false);

  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['clients', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return [];

      console.log('Fetching clients for tenant:', profile.tenant_id);

      try {
        // Get all clients in this tenant - now includes both auth users and direct profile entries
        const { data: clientProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, phone')
          .eq('tenant_id', profile.tenant_id)
          .eq('role', 'client')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching client profiles:', profilesError);
          throw profilesError;
        }

        console.log('Found client profiles:', clientProfiles);

        if (!clientProfiles || clientProfiles.length === 0) {
          return [];
        }

        // For each client, get their details, vehicles, and service history
        const clientsWithDetails = await Promise.all(
          clientProfiles.map(async (clientProfile) => {
            // Get client's vehicles
            const { data: vehicles } = await supabase
              .from('vehicles')
              .select('id, make, model, year, license_plate')
              .eq('owner_id', clientProfile.id);

            // Get appointment count and last appointment
            const { data: appointments } = await supabase
              .from('appointments')
              .select('scheduled_at')
              .eq('client_id', clientProfile.id)
              .eq('tenant_id', profile.tenant_id)
              .order('scheduled_at', { ascending: false });

            // Get service count for this client across all their vehicles
            let serviceCount = 0;
            let lastServiceDate = null;

            if (vehicles && vehicles.length > 0) {
              const vehicleIds = vehicles.map(v => v.id);
              
              const { data: serviceHistory, error: serviceError } = await supabase
                .from('service_history')
                .select('completed_at')
                .eq('tenant_id', profile.tenant_id)
                .in('vehicle_id', vehicleIds)
                .order('completed_at', { ascending: false });

              if (!serviceError && serviceHistory) {
                serviceCount = serviceHistory.length;
                lastServiceDate = serviceHistory[0]?.completed_at || null;
              }
            }

            return {
              ...clientProfile,
              email: '', // We don't store email for direct profile clients
              vehicles: vehicles || [],
              service_count: serviceCount,
              last_service_date: lastServiceDate,
              appointment_count: appointments?.length || 0,
              last_appointment_date: appointments?.[0]?.scheduled_at || null,
            };
          })
        );

        console.log('Clients with details:', clientsWithDetails);
        return clientsWithDetails;
      } catch (error) {
        console.error('Error in client fetch:', error);
        return [];
      }
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

  const handleClientCreated = () => {
    console.log('Client created, refreshing list...');
    setShowClientCreation(false);
    refetch();
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Clients Database</h2>
        </div>
        <Button onClick={() => setShowClientCreation(true)} className="flex items-center space-x-2">
          <UserPlus className="h-4 w-4" />
          <span>Create Client</span>
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
            <p className="text-sm text-gray-400 mt-2">
              Clients will appear here when they book appointments or when you create them manually
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

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">Appointments: {client.appointment_count}</span>
                      </div>
                      {client.last_appointment_date && (
                        <span className="text-gray-500">
                          Last: {new Date(client.last_appointment_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600">Services: {client.service_count}</span>
                      </div>
                      {client.last_service_date && (
                        <span className="text-gray-500">
                          Last service: {new Date(client.last_service_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showClientCreation} onOpenChange={setShowClientCreation}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
            <DialogDescription>
              Add a new client to your database with their basic information and vehicles
            </DialogDescription>
          </DialogHeader>
          <ClientCreationForm onSuccess={handleClientCreated} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsManager;
