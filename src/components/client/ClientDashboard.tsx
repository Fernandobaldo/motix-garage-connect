import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Wrench, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Simple, explicit interfaces to avoid deep type inference
interface AppointmentData {
  id: string;
  scheduled_at: string;
  service_type: string;
  status: string;
  workshop_name: string;
  workshop_phone: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
}

interface QuotationData {
  id: string;
  quote_number: string;
  total_cost: number;
  status: string;
  created_at: string;
  workshop_name: string;
}

interface ServiceData {
  id: string;
  service_type: string;
  completed_at: string;
  workshop_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
}

const ClientDashboard = () => {
  const { user, profile } = useAuth();

  // Simple query with explicit return type
  const nextAppointmentQuery = useQuery({
    queryKey: ['nextAppointment', user?.id],
    queryFn: async (): Promise<AppointmentData | null> => {
      if (!user?.id) return null;
      
      try {
        // Simple query without joins
        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('id, scheduled_at, service_type, status, workshop_id, vehicle_id')
          .eq('client_id', user.id)
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1);

        if (error) throw error;
        if (!appointments || appointments.length === 0) return null;

        const appointment = appointments[0];
        
        // Fetch related data separately
        const [workshopResult, vehicleResult] = await Promise.all([
          appointment.workshop_id ? 
            supabase.from('workshops').select('name, phone').eq('id', appointment.workshop_id).single() :
            Promise.resolve({ data: null }),
          appointment.vehicle_id ?
            supabase.from('vehicles').select('make, model, year').eq('id', appointment.vehicle_id).single() :
            Promise.resolve({ data: null })
        ]);

        // Manually construct the result
        const result: AppointmentData = {
          id: appointment.id,
          scheduled_at: appointment.scheduled_at,
          service_type: appointment.service_type,
          status: appointment.status || 'pending',
          workshop_name: workshopResult.data?.name || '',
          workshop_phone: workshopResult.data?.phone || '',
          vehicle_make: vehicleResult.data?.make || '',
          vehicle_model: vehicleResult.data?.model || '',
          vehicle_year: vehicleResult.data?.year || 0,
        };

        return result;
      } catch (error) {
        console.error('Error fetching next appointment:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Simple quotation query
  const latestQuotationQuery = useQuery({
    queryKey: ['latestQuotation', user?.id],
    queryFn: async (): Promise<QuotationData | null> => {
      if (!user?.id) return null;
      
      try {
        const { data: quotations, error } = await supabase
          .from('quotations')
          .select('id, quote_number, total_cost, status, created_at, workshop_id')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (!quotations || quotations.length === 0) return null;

        const quotation = quotations[0];
        
        // Fetch workshop separately
        const workshopData = quotation.workshop_id ? 
          await supabase.from('workshops').select('name').eq('id', quotation.workshop_id).single() :
          { data: null };

        const result: QuotationData = {
          id: quotation.id,
          quote_number: quotation.quote_number,
          total_cost: quotation.total_cost,
          status: quotation.status || 'draft',
          created_at: quotation.created_at,
          workshop_name: workshopData.data?.name || '',
        };

        return result;
      } catch (error) {
        console.error('Error fetching latest quotation:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Simple service history query
  const lastServiceQuery = useQuery({
    queryKey: ['lastService', user?.id],
    queryFn: async (): Promise<ServiceData | null> => {
      if (!user?.id) return null;
      
      try {
        const { data: services, error } = await supabase
          .from('service_history')
          .select('id, service_type, completed_at, workshop_id, vehicle_id')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (!services || services.length === 0) return null;

        const service = services[0];
        
        // Fetch related data separately
        const [workshopResult, vehicleResult] = await Promise.all([
          service.workshop_id ?
            supabase.from('workshops').select('name').eq('id', service.workshop_id).single() :
            Promise.resolve({ data: null }),
          service.vehicle_id ?
            supabase.from('vehicles').select('make, model, year').eq('id', service.vehicle_id).single() :
            Promise.resolve({ data: null })
        ]);

        const result: ServiceData = {
          id: service.id,
          service_type: service.service_type,
          completed_at: service.completed_at,
          workshop_name: workshopResult.data?.name || '',
          vehicle_make: vehicleResult.data?.make || '',
          vehicle_model: vehicleResult.data?.model || '',
          vehicle_year: vehicleResult.data?.year || 0,
        };

        return result;
      } catch (error) {
        console.error('Error fetching last service:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  const nextAppointment = nextAppointmentQuery.data;
  const latestQuotation = latestQuotationQuery.data;
  const lastService = lastServiceQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}
        </h1>
        <p className="text-gray-600">Here's what's happening with your vehicles</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Appointment Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {format(new Date(nextAppointment.scheduled_at), 'MMM dd')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(nextAppointment.scheduled_at), 'h:mm a')} - {nextAppointment.service_type}
                </p>
                <p className="text-sm">{nextAppointment.workshop_name}</p>
                <Badge variant={nextAppointment.status === 'confirmed' ? 'default' : 'secondary'}>
                  {nextAppointment.status}
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">None</div>
                <p className="text-xs text-muted-foreground">No upcoming appointments</p>
                <Button asChild size="sm" className="w-full">
                  <Link to="/appointments">Book Service</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Quotation Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Quotation</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestQuotation ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  ${latestQuotation.total_cost?.toFixed(2) || '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {latestQuotation.quote_number}
                </p>
                <p className="text-sm">{latestQuotation.workshop_name}</p>
                <Badge variant={
                  latestQuotation.status === 'approved' ? 'default' : 
                  latestQuotation.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {latestQuotation.status}
                </Badge>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">None</div>
                <p className="text-xs text-muted-foreground">No quotations yet</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/quotations">View All</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Last Service Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Service</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lastService ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {format(new Date(lastService.completed_at), 'MMM dd')}
                </div>
                <p className="text-xs text-muted-foreground">
                  {lastService.service_type}
                </p>
                <p className="text-sm">{lastService.vehicle_make} {lastService.vehicle_model}</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/service-history">View Details</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl font-bold">None</div>
                <p className="text-xs text-muted-foreground">No service history</p>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/service-history">View History</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/appointments">
                <Calendar className="mr-2 h-4 w-4" />
                Book New Appointment
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/vehicles">
                <Car className="mr-2 h-4 w-4" />
                Add Vehicle
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
            <CardDescription>Get support when you need it</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" disabled>
              Contact Workshop
            </Button>
            <Button variant="outline" className="w-full" disabled>
              View FAQs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;
