
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

      // First, get the service records
      const { data: records, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!records || records.length === 0) return [];

      // Get unique client IDs, workshop IDs, and vehicle IDs
      const clientIds = [...new Set(records.map(r => r.client_id).filter(Boolean))];
      const workshopIds = [...new Set(records.map(r => r.workshop_id).filter(Boolean))];
      const vehicleIds = [...new Set(records.map(r => r.vehicle_id).filter(Boolean))];

      // Fetch related data in parallel
      const [clientsData, workshopsData, vehiclesData] = await Promise.all([
        // Try to get clients from profiles first, then from clients table
        clientIds.length > 0 ? Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, phone')
            .in('id', clientIds),
          supabase
            .from('clients')
            .select('id, full_name, phone')
            .in('id', clientIds)
        ]) : [{ data: [] }, { data: [] }],
        
        workshopIds.length > 0 ? 
          supabase
            .from('workshops')
            .select('id, name')
            .in('id', workshopIds) : 
          { data: [] },
        
        vehicleIds.length > 0 ? 
          supabase
            .from('vehicles')
            .select('id, make, model, year, license_plate')
            .in('id', vehicleIds) : 
          { data: [] }
      ]);

      // Combine client data from both sources
      const allClients = [
        ...(clientsData[0].data || []),
        ...(clientsData[1].data || [])
      ];

      // Create lookup maps
      const clientsMap = new Map(allClients.map(c => [c.id, c]));
      const workshopsMap = new Map((workshopsData.data || []).map(w => [w.id, w]));
      const vehiclesMap = new Map((vehiclesData.data || []).map(v => [v.id, v]));

      // Combine the data
      const enrichedRecords: ServiceRecordWithRelations[] = records.map(record => ({
        ...record,
        client: record.client_id ? clientsMap.get(record.client_id) || null : null,
        workshop: record.workshop_id ? workshopsMap.get(record.workshop_id) || null : null,
        vehicle: record.vehicle_id ? vehiclesMap.get(record.vehicle_id) || null : null,
      }));

      return enrichedRecords;
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
