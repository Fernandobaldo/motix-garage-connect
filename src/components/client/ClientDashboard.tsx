
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Wrench, Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

// Simple interfaces to avoid complex Supabase type inference
interface SimpleAppointment {
  id: string;
  scheduled_at: string;
  service_type: string;
  status: string;
}

interface SimpleQuotation {
  id: string;
  quote_number: string;
  total_cost: number | null;
  status: string;
  created_at: string;
}

interface SimpleServiceHistory {
  id: string;
  service_type: string;
  completed_at: string;
  description: string | null;
}

const ClientDashboard = () => {
  const { user, profile } = useAuth();

  // Simple next appointment query with explicit field selection
  const { data: nextAppointment } = useQuery({
    queryKey: ['nextAppointment', user?.id],
    queryFn: async (): Promise<SimpleAppointment | null> => {
      if (!user?.id) return null;
      
      const { data } = await supabase
        .from('appointments')
        .select('id, scheduled_at, service_type, status')
        .eq('client_id', user.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      return data as SimpleAppointment | null;
    },
    enabled: !!user?.id,
  });

  // Simple latest quotation query with explicit field selection
  const { data: latestQuotation } = useQuery({
    queryKey: ['latestQuotation', user?.id],
    queryFn: async (): Promise<SimpleQuotation | null> => {
      if (!user?.id) return null;
      
      const { data } = await supabase
        .from('quotations')
        .select('id, quote_number, total_cost, status, created_at')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data as SimpleQuotation | null;
    },
    enabled: !!user?.id,
  });

  // Simple service history query with explicit field selection
  const { data: lastService } = useQuery({
    queryKey: ['lastService', user?.id],
    queryFn: async (): Promise<SimpleServiceHistory | null> => {
      if (!user?.id) return null;
      
      const { data } = await supabase
        .from('service_history')
        .select('id, service_type, completed_at, description')
        .eq('vehicle_id', user.id) // This might need to be adjusted based on your data model
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data as SimpleServiceHistory | null;
    },
    enabled: !!user?.id,
  });

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
