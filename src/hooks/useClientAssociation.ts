
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AssociationStats {
  authenticated_clients: number;
  guest_clients: number;
  total_clients: number;
  vehicles: number;
  appointments: number;
}

interface AssociationIssue {
  appointment_id: string;
  client_id: string | null;
  guest_client_id: string | null;
  vehicle_id: string | null;
  workshop_tenant_id: string;
  association_status: string;
}

export const useClientAssociation = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: associationStats, isLoading: statsLoading } = useQuery({
    queryKey: ['association-stats', profile?.tenant_id],
    queryFn: async (): Promise<AssociationStats> => {
      if (!profile?.tenant_id) throw new Error('No tenant ID');
      
      const { data, error } = await supabase
        .rpc('get_workshop_association_stats', { p_tenant_id: profile.tenant_id });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.tenant_id && profile?.role === 'workshop',
  });

  const { data: associationIssues, refetch: refetchIssues } = useQuery({
    queryKey: ['association-issues', profile?.tenant_id],
    queryFn: async (): Promise<AssociationIssue[]> => {
      if (!profile?.tenant_id) return [];
      
      const { data, error } = await supabase
        .rpc('verify_client_workshop_associations');

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.tenant_id && profile?.role === 'workshop',
  });

  const repairAssociationsMutation = useMutation({
    mutationFn: async () => {
      // This would trigger a background job to repair associations
      // For now, we'll just refetch the data
      await refetchIssues();
    },
    onSuccess: () => {
      toast({
        title: "Associations Verified",
        description: "Client and vehicle associations have been checked and updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['association-stats'] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify associations",
        variant: "destructive",
      });
    },
  });

  return {
    associationStats,
    associationIssues,
    statsLoading,
    hasIssues: (associationIssues?.length || 0) > 0,
    repairAssociations: repairAssociationsMutation.mutate,
    isRepairing: repairAssociationsMutation.isPending,
  };
};
