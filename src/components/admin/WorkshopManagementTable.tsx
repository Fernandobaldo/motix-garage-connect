import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Eye, 
  Settings, 
  Ban, 
  CheckCircle, 
  Search,
  Users,
  Calendar,
  Car
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import EditPlanModal from './EditPlanModal';
import ViewUsersModal from './ViewUsersModal';

interface WorkshopStats {
  user_count: number;
  appointment_count: number;
  vehicle_count: number;
  monthly_appointments: number;
  monthly_storage: number;
}

interface WorkshopData {
  id: string;
  name: string;
  subscription_plan: string;
  status: string;
  created_at: string;
  trial_until: string | null;
  user_count: number;
  appointment_count: number;
  vehicle_count: number;
}

const WorkshopManagementTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopData | null>(null);
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [viewUsersModalOpen, setViewUsersModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workshops with stats
  const { data: workshops, isLoading } = useQuery({
    queryKey: ['admin-workshops'],
    queryFn: async (): Promise<WorkshopData[]> => {
      const { data: tenants, error } = await supabase
        .from('tenants')
        .select(`
          id,
          name,
          subscription_plan,
          status,
          created_at,
          trial_until
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get stats for each tenant using the new RPC function
      const workshopsWithStats = await Promise.all(
        (tenants || []).map(async (tenant) => {
          const { data: stats, error: statsError } = await supabase
            .rpc('get_workshop_stats', { workshop_tenant_id: tenant.id });

          if (statsError) {
            console.error('Error fetching workshop stats:', statsError);
            // Fallback to manual counting if RPC fails
            const [userCount, appointmentCount, vehicleCount] = await Promise.all([
              supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
              supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
              supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            ]);

            return {
              ...tenant,
              user_count: userCount.count || 0,
              appointment_count: appointmentCount.count || 0,
              vehicle_count: vehicleCount.count || 0,
            };
          }
          
          // Type cast the JSON response to our expected structure through unknown
          const workshopStats = stats as unknown as WorkshopStats;
          
          return {
            ...tenant,
            user_count: workshopStats?.user_count || 0,
            appointment_count: workshopStats?.appointment_count || 0,
            vehicle_count: workshopStats?.vehicle_count || 0,
          };
        })
      );

      return workshopsWithStats;
    },
  });

  // Suspend/Reactivate workshop mutation
  const suspendMutation = useMutation({
    mutationFn: async ({ tenantId, newStatus, reason }: { 
      tenantId: string; 
      newStatus: string; 
      reason?: string 
    }) => {
      const { error } = await supabase
        .rpc('manage_workshop_status', {
          p_tenant_id: tenantId,
          p_new_status: newStatus,
          p_reason: reason
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workshops'] });
      toast({
        title: "Workshop Status Updated",
        description: "The workshop status has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workshop status",
        variant: "destructive",
      });
    },
  });

  const filteredWorkshops = workshops?.filter(workshop =>
    workshop.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSuspendToggle = (workshop: WorkshopData) => {
    const newStatus = workshop.status === 'active' ? 'suspended' : 'active';
    const reason = newStatus === 'suspended' ? 'Administrative suspension' : 'Administrative reactivation';
    
    suspendMutation.mutate({
      tenantId: workshop.id,
      newStatus,
      reason
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors = {
      free: 'bg-gray-500',
      starter: 'bg-blue-500',
      pro: 'bg-purple-500',
      enterprise: 'bg-gold-500'
    };
    
    return (
      <Badge className={colors[plan as keyof typeof colors] || 'bg-gray-500'}>
        {plan.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workshop Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Workshop Management</CardTitle>
          <CardDescription>
            Manage all registered workshops, their plans, and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search workshops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Workshop Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkshops.map((workshop) => (
                  <TableRow key={workshop.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{workshop.name}</div>
                        {workshop.trial_until && (
                          <div className="text-sm text-muted-foreground">
                            Trial until: {format(new Date(workshop.trial_until), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(workshop.subscription_plan)}</TableCell>
                    <TableCell>{getStatusBadge(workshop.status)}</TableCell>
                    <TableCell>{format(new Date(workshop.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{workshop.user_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{workshop.appointment_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Car className="h-3 w-3" />
                          <span>{workshop.vehicle_count}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkshop(workshop);
                            setViewUsersModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkshop(workshop);
                            setEditPlanModalOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={workshop.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleSuspendToggle(workshop)}
                          disabled={suspendMutation.isPending}
                        >
                          {workshop.status === 'active' ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWorkshops.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No workshops found.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedWorkshop && (
        <>
          <EditPlanModal
            workshop={selectedWorkshop}
            open={editPlanModalOpen}
            onOpenChange={setEditPlanModalOpen}
          />
          <ViewUsersModal
            workshop={selectedWorkshop}
            open={viewUsersModalOpen}
            onOpenChange={setViewUsersModalOpen}
          />
        </>
      )}
    </>
  );
};

export default WorkshopManagementTable;
