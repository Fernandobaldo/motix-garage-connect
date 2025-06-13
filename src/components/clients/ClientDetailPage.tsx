import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Phone, Mail, Car, Calendar, FileText, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ClientDetails {
  id: string;
  full_name: string;
  phone: string;
  email?: string; // Make email optional since auth clients might not have it
  client_type: 'auth' | 'guest';
  vehicles: Array<{
    id: string;
    license_plate: string;
    make: string;
    model: string;
    year: number;
  }>;
  appointments: Array<{
    id: string;
    service_type: string;
    scheduled_at: string;
    status: string;
    description: string;
  }>;
  service_history: Array<{
    id: string;
    service_type: string;
    completed_at: string;
    cost: number;
    description: string;
  }>;
  quotations: Array<{
    id: string;
    quote_number: string;
    total_cost: number;
    status: string;
    created_at: string;
  }>;
}

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: client, isLoading, error } = useQuery({
    queryKey: ['client-details', clientId, profile?.tenant_id],
    queryFn: async (): Promise<ClientDetails> => {
      if (!clientId || !profile?.tenant_id) {
        throw new Error('Missing client ID or tenant ID');
      }

      // Try to get client from both tables (profiles for auth clients, clients for guest clients)
      const [authClientResult, guestClientResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, phone')
          .eq('id', clientId)
          .eq('tenant_id', profile.tenant_id)
          .eq('role', 'client')
          .maybeSingle(),
        supabase
          .from('clients')
          .select('id, full_name, phone, email')
          .eq('id', clientId)
          .eq('tenant_id', profile.tenant_id)
          .maybeSingle()
      ]);

      const authClient = authClientResult.data;
      const guestClient = guestClientResult.data;
      
      if (!authClient && !guestClient) {
        throw new Error('Client not found');
      }

      const clientData = authClient || guestClient;
      const clientType = authClient ? 'auth' : 'guest';

      // Get client's vehicles
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('id, license_plate, make, model, year')
        .or(`owner_id.eq.${clientId},client_id.eq.${clientId}`)
        .eq('tenant_id', profile.tenant_id);

      // Get client's appointments
      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, service_type, scheduled_at, status, description')
        .or(`client_id.eq.${clientId},guest_client_id.eq.${clientId}`)
        .eq('tenant_id', profile.tenant_id)
        .order('scheduled_at', { ascending: false });

      // Get client's service history
      const { data: serviceHistory } = await supabase
        .from('service_history')
        .select('id, service_type, completed_at, cost, description')
        .eq('tenant_id', profile.tenant_id)
        .in('vehicle_id', vehicles?.map(v => v.id) || [])
        .order('completed_at', { ascending: false });

      // Get client's quotations
      const { data: quotations } = await supabase
        .from('quotations')
        .select('id, quote_number, total_cost, status, created_at')
        .eq('client_id', clientId)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      return {
        ...clientData!,
        client_type: clientType,
        email: guestClient?.email, // Only guest clients have email in our data structure
        vehicles: vehicles || [],
        appointments: appointments || [],
        service_history: serviceHistory || [],
        quotations: quotations || [],
      };
    },
    enabled: !!clientId && !!profile?.tenant_id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">Client not found or access denied</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Client Details</h1>
      </div>

      {/* Client Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{client.full_name}</span>
                <Badge variant={client.client_type === 'auth' ? 'default' : 'secondary'}>
                  {client.client_type === 'auth' ? 'Account' : 'Guest'}
                </Badge>
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{client.phone || 'No phone'}</span>
            </div>
            {client.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{client.email}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-gray-500" />
              <span>{client.vehicles.length} vehicle{client.vehicles.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments ({client.appointments.length})</TabsTrigger>
          <TabsTrigger value="services">Services ({client.service_history.length})</TabsTrigger>
          <TabsTrigger value="quotations">Quotations ({client.quotations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Car className="h-5 w-5" />
                  <span>Vehicles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.vehicles.length > 0 ? (
                  <div className="space-y-3">
                    {client.vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-600">{vehicle.license_plate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No vehicles registered</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Appointments</span>
                    <span className="font-semibold">{client.appointments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Services Completed</span>
                    <span className="font-semibold">{client.service_history.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-semibold">
                      ${client.service_history.reduce((total, service) => total + (service.cost || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Quotations</span>
                    <span className="font-semibold">{client.quotations.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
              <CardDescription>All appointments for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.appointments.length > 0 ? (
                <div className="space-y-4">
                  {client.appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{appointment.service_type}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.scheduled_at).toLocaleString()}
                          </p>
                          {appointment.description && (
                            <p className="text-sm text-gray-500 mt-1">{appointment.description}</p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No appointments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
              <CardDescription>Completed services for this client's vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              {client.service_history.length > 0 ? (
                <div className="space-y-4">
                  {client.service_history.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{service.service_type}</p>
                          <p className="text-sm text-gray-600">
                            Completed: {new Date(service.completed_at).toLocaleDateString()}
                          </p>
                          {service.description && (
                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${service.cost?.toFixed(2) || 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No service history found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <CardTitle>Quotations</CardTitle>
              <CardDescription>All quotations for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.quotations.length > 0 ? (
                <div className="space-y-4">
                  {client.quotations.map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{quotation.quote_number}</p>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(quotation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold">${quotation.total_cost.toFixed(2)}</p>
                        </div>
                        <Badge className={getStatusColor(quotation.status)}>
                          {quotation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No quotations found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailPage;
