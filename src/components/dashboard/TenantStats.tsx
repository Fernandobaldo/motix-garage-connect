import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import PlanBadge from '@/components/permissions/PlanBadge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building, Users, Calendar, MessageSquare } from 'lucide-react';

interface TenantStatsProps {
  onCardClick?: (tab: string) => void;
}

const TenantStats = ({ onCardClick }: TenantStatsProps) => {
  const { tenant, loading } = useTenant();
  const { profile } = useAuth();
  const { plan, limits } = usePermissions();

  // Fetch real appointment stats
  const { data: appointmentStats } = useQuery({
    queryKey: ['appointment-stats', profile?.tenant_id, profile?.role, profile?.id],
    queryFn: async () => {
      if (!profile) return { active: 0, total: 0 };

      let query = supabase
        .from('appointments')
        .select('status, scheduled_at');

      // Filter based on user role
      if (profile.role === 'client') {
        query = query.eq('client_id', profile.id);
      } else if (profile.role === 'workshop' && profile.tenant_id) {
        query = query.eq('tenant_id', profile.tenant_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointment stats:', error);
        throw error;
      }

      console.log('Appointment stats data:', data);

      const now = new Date();
      const active = data?.filter(a => {
        const scheduledDate = new Date(a.scheduled_at);
        const isNotFinished = a.status !== 'cancelled' && a.status !== 'completed';
        const isFutureOrActive = scheduledDate >= now || a.status === 'confirmed' || a.status === 'in_progress' || a.status === 'pending';
        return isNotFinished && (isFutureOrActive || a.status === 'pending');
      }).length || 0;
      
      const total = data?.length || 0;

      console.log('Calculated stats - active:', active, 'total:', total);

      return { active, total };
    },
    enabled: !!profile,
  });

  // Fetch real conversation stats
  const { data: conversationStats } = useQuery({
    queryKey: ['conversation-stats', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return { total: 0, unread: 0 };

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('tenant_id', profile.tenant_id);

      if (error) throw error;

      // For now, just return total conversations
      // Unread messages would require more complex query
      return { total: data?.length || 0, unread: 0 };
    },
    enabled: !!profile?.tenant_id,
  });

  // Fetch real client/vehicle stats
  const { data: clientStats } = useQuery({
    queryKey: ['client-stats', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return { clients: 0, vehicles: 0 };

      if (profile.role === 'workshop') {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .eq('tenant_id', profile.tenant_id)
          .eq('role', 'client');

        if (profilesError) throw profilesError;

        return { clients: profiles?.length || 0, vehicles: 0 };
      } else {
        const { data: vehicles, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('id')
          .eq('owner_id', profile.id);

        if (vehiclesError) throw vehiclesError;

        return { clients: 0, vehicles: vehicles?.length || 0 };
      }
    },
    enabled: !!profile?.tenant_id,
  });

  // Fetch real quotation stats
  const { data: quotationStats } = useQuery({
    queryKey: ['quotation-stats', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return { pending: 0, approved: 0 };

      const { data, error } = await supabase
        .from('quotations')
        .select('status')
        .eq('tenant_id', profile.tenant_id);

      if (error) throw error;

      const pending = data?.filter(q => q.status === 'pending').length || 0;
      const approved = data?.filter(q => q.status === 'approved').length || 0;

      return { pending, approved };
    },
    enabled: !!profile?.tenant_id,
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!tenant && profile?.role === 'workshop') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No tenant information available. Please set up your garage.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {tenant && (
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{tenant.name}</h2>
              <PlanBadge plan={plan} />
            </div>
            <p className="text-gray-600">
              {profile?.role === 'workshop' ? 'Garage Dashboard' : 'Customer Dashboard'}
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Building className="h-3 w-3" />
            <span>{profile?.role === 'workshop' ? 'Garage' : 'Client'}</span>
          </Badge>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('appointments')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentStats?.active || 0}</div>
            <p className="text-xs text-muted-foreground">
              {appointmentStats?.total || 0} total
              {limits.appointments !== -1 && ` / ${limits.appointments} limit`}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('messages')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversationStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total conversations
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('vehicles')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {profile?.role === 'workshop' ? 'Total Customers' : 'My Vehicles'}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profile?.role === 'workshop' 
                ? (clientStats?.clients || 0) 
                : (clientStats?.vehicles || 0)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {profile?.role === 'workshop' ? 'registered clients' : 
                `registered vehicles${limits.vehicles !== -1 ? ` / ${limits.vehicles} limit` : ''}`
              }
            </p>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onCardClick?.('quotations')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotationStats?.pending || 0}</div>
            <p className="text-xs text-muted-foreground">
              {quotationStats?.approved || 0} approved
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TenantStats;
