
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { ServiceRecordWithRelations, ServiceStatus } from '@/types/database';

export const useServiceRecords = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: serviceRecords = [], isLoading, refetch } = useQuery({
    queryKey: ['service-records', user?.id, profile?.tenant_id],
    queryFn: async (): Promise<ServiceRecordWithRelations[]> => {
      if (!user || !profile?.tenant_id) return [];

      const { data, error } = await supabase
        .from('service_records')
        .select(`
          *,
          client:client_id(full_name),
          workshop:workshop_id(name),
          vehicle:vehicle_id(make, model, year, license_plate)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as ServiceRecordWithRelations[];
    },
    enabled: !!user && !!profile?.tenant_id,
  });

  const updateServiceStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ServiceStatus }) => {
      const { data, error } = await supabase
        .from('service_records')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      queryClient.invalidateQueries({ queryKey: ['service-history'] });
      toast({
        title: 'Success',
        description: 'Service status updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update service status',
        variant: 'destructive',
      });
    },
  });

  const createServiceRecord = useMutation({
    mutationFn: async (serviceData: {
      tenant_id: string;
      vehicle_id: string;
      workshop_id: string;
      client_id?: string;
      service_type: string;
      description?: string;
      cost?: number;
      labor_hours?: number;
      mileage?: number;
      technician_notes?: string;
      status?: ServiceStatus;
      estimated_completion_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('service_records')
        .insert(serviceData)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      toast({
        title: 'Success',
        description: 'Service record created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create service record',
        variant: 'destructive',
      });
    },
  });

  const updateServiceStatus = (id: string, status: ServiceStatus) => {
    updateServiceStatusMutation.mutate({ id, status });
  };

  return {
    serviceRecords,
    isLoading,
    refetch,
    updateServiceStatus,
    createServiceRecord: createServiceRecord.mutate,
    isUpdating: updateServiceStatusMutation.isPending,
  };
};
