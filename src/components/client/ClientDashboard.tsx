
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Wrench, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Simple interfaces without complex relations
interface DashboardAppointment {
  id: string;
  scheduled_at: string;
  service_type: string;
  status: string;
  workshop_name?: string;
  workshop_phone?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
}

interface DashboardQuotation {
  id: string;
  quote_number: string;
  total_cost: number;
  status: string;
  created_at: string;
  workshop_name?: string;
}

interface DashboardService {
  id: string;
  service_type: string;
  completed_at: string;
  workshop_name?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
}

const ClientDashboard = () => {
  const { user, profile } = useAuth();

  // Next appointment with no type inference
  const nextAppointmentQuery = useQuery({
    queryKey: ['nextAppointment', user?.id],
    queryFn: async (): Promise<DashboardAppointment | null> => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            scheduled_at,
            service_type,
            status,
            workshop:workshops!appointments_workshop_id_fkey(name, phone),
            vehicle:vehicles!appointments_vehicle_id_fkey(make, model, year)
          `)
          .eq('client_id', user.id)
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error || !data) return null;

        const rawData = data as any;
        return {
          id: rawData.id,
          scheduled_at: rawData.scheduled_at,
          service_type: rawData.service_type,
          status: rawData.status,
          workshop_name: rawData.workshop?.name,
          workshop_phone: rawData.workshop?.phone,
          vehicle_make: rawData.vehicle?.make,
          vehicle_model: rawData.vehicle?.model,
          vehicle_year: rawData.vehicle?.year,
        };
      } catch (error) {
        console.error('Error fetching next appointment:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Latest quotation with no type inference
  const latestQuotationQuery = useQuery({
    queryKey: ['latestQuotation', user?.id],
    queryFn: async (): Promise<DashboardQuotation | null> => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('quotations')
          .select(`
            id,
            quote_number,
            total_cost,
            status,
            created_at,
            workshop:workshops!quotations_workshop_id_fkey(name)
          `)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) return null;

        const rawData = data as any;
        return {
          id: rawData.id,
          quote_number: rawData.quote_number,
          total_cost: rawData.total_cost,
          status: rawData.status,
          created_at: rawData.created_at,
          workshop_name: rawData.workshop?.name,
        };
      } catch (error) {
        console.error('Error fetching latest quotation:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Last service with no type inference
  const lastServiceQuery = useQuery({
    queryKey: ['lastService', user?.id],
    queryFn: async (): Promise<DashboardService | null> => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('service_history')
          .select(`
            id,
            service_type,
            completed_at,
            workshop:workshops!service_history_workshop_id_fkey(name),
            vehicle:vehicles!service_history_vehicle_id_fkey(make, model, year)
          `)
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error || !data) return null;

        const rawData = data as any;
        return {
          id: rawData.id,
          service_type: rawData.service_type,
          completed_at: rawData.completed_at,
          workshop_name: rawData.workshop?.name,
          vehicle_make: rawData.vehicle?.make,
          vehicle_model: rawData.vehicle?.model,
          vehicle_year: rawData.vehicle?.year,
        };
      } catch (error) {
        console.error('Error fetching last service:', error);
        return null;
      }
    },
    enabled: !!user,
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
