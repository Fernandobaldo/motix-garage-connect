
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SuperAdminWorkshopData {
  tenant_id: string;
  tenant_name: string;
  tenant_status: string;
  tenant_plan: string;
  tenant_created_at: string;
  tenant_is_blocked: boolean;
  workshop_id: string | null;
  workshop_name: string | null;
  workshop_email: string | null;
  workshop_phone: string | null;
  workshop_owner_id: string | null;
  owner_last_login_at: string | null;
  user_count: number;
  appointment_count: number;
  vehicle_count: number;
}

export interface WorkshopFilters {
  searchTerm: string;
  planFilter: string;
  statusFilter: string;
  blockedFilter: string;
}

export const useSuperAdminWorkshops = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workshops = [], isLoading, error, refetch } = useQuery({
    queryKey: ['superadmin-workshops'],
    queryFn: async (): Promise<SuperAdminWorkshopData[]> => {
      const { data, error } = await supabase
        .rpc('get_all_workshops_for_superadmin');

      if (error) throw error;
      return data || [];
    },
    enabled: profile?.role === 'superadmin',
  });

  const toggleBlockMutation = useMutation({
    mutationFn: async ({ 
      tenantId, 
      isBlocked, 
      reason 
    }: { 
      tenantId: string; 
      isBlocked: boolean; 
      reason?: string;
    }) => {
      const { error } = await supabase
        .rpc('toggle_workshop_block', {
          p_tenant_id: tenantId,
          p_is_blocked: isBlocked,
          p_reason: reason
        });
      
      if (error) throw error;
    },
    onSuccess: (_, { isBlocked }) => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-workshops'] });
      toast({
        title: "Workshop Status Updated",
        description: `Workshop has been ${isBlocked ? 'blocked' : 'unblocked'} successfully.`,
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

  const toggleWorkshopBlock = (tenantId: string, isBlocked: boolean, reason?: string) => {
    toggleBlockMutation.mutate({ tenantId, isBlocked, reason });
  };

  const filterWorkshops = (workshops: SuperAdminWorkshopData[], filters: WorkshopFilters): SuperAdminWorkshopData[] => {
    return workshops.filter(workshop => {
      const matchesSearch = !filters.searchTerm || 
        workshop.tenant_name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        workshop.workshop_email?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        workshop.workshop_name?.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesPlan = !filters.planFilter || workshop.tenant_plan === filters.planFilter;
      
      const matchesStatus = !filters.statusFilter || workshop.tenant_status === filters.statusFilter;
      
      const matchesBlocked = filters.blockedFilter === 'all' || 
        (filters.blockedFilter === 'blocked' && workshop.tenant_is_blocked) ||
        (filters.blockedFilter === 'active' && !workshop.tenant_is_blocked);

      return matchesSearch && matchesPlan && matchesStatus && matchesBlocked;
    });
  };

  return {
    workshops,
    isLoading,
    error,
    refetch,
    toggleWorkshopBlock,
    isToggling: toggleBlockMutation.isPending,
    filterWorkshops,
  };
};
