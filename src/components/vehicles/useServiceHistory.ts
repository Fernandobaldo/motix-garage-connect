import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { useToast } from '@/hooks/use-toast';
import { ServiceHistoryRecord, MaintenanceSchedule, VehicleHealthReport } from './types';

export const useServiceHistory = (vehicleId?: string) => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: serviceHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ['serviceHistory', vehicleId, tenant?.id],
    queryFn: async (): Promise<ServiceHistoryRecord[]> => {
      if (!user || !tenant) return [];

      let query = supabase
        .from('service_history')
        .select(`
          *,
          workshop:workshops!service_history_workshop_id_fkey(name),
          vehicle:vehicles!service_history_vehicle_id_fkey(make, model, year, license_plate)
        `)
        .eq('tenant_id', tenant.id)
        .order('completed_at', { ascending: false });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(record => ({
        ...record,
        parts_used: Array.isArray(record.parts_used) ? record.parts_used as any[] : [],
        images: Array.isArray(record.images) ? record.images as string[] : [],
      })) as ServiceHistoryRecord[];
    },
    enabled: !!user && !!tenant,
  });

  const { data: maintenanceSchedules = [], isLoading: schedulesLoading } = useQuery({
    queryKey: ['maintenanceSchedules', vehicleId, tenant?.id],
    queryFn: async (): Promise<MaintenanceSchedule[]> => {
      if (!user || !tenant) return [];

      let query = supabase
        .from('maintenance_schedules')
        .select(`
          *,
          vehicle:vehicles!maintenance_schedules_vehicle_id_fkey(make, model, year, license_plate)
        `)
        .eq('tenant_id', tenant.id)
        .order('next_due_date', { ascending: true });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as MaintenanceSchedule[] || [];
    },
    enabled: !!user && !!tenant,
  });

  const { data: healthReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['vehicleHealthReports', vehicleId, tenant?.id],
    queryFn: async (): Promise<VehicleHealthReport[]> => {
      if (!user || !tenant) return [];

      let query = supabase
        .from('vehicle_health_reports')
        .select(`
          *,
          vehicle:vehicles!vehicle_health_reports_vehicle_id_fkey(make, model, year, license_plate)
        `)
        .eq('tenant_id', tenant.id)
        .order('report_date', { ascending: false });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(report => ({
        ...report,
        issues_found: Array.isArray(report.issues_found) ? report.issues_found as any[] : [],
        recommendations: Array.isArray(report.recommendations) ? report.recommendations as any[] : [],
      })) as VehicleHealthReport[];
    },
    enabled: !!user && !!tenant,
  });

  const addServiceRecord = useMutation({
    mutationFn: async (record: Omit<ServiceHistoryRecord, 'id' | 'created_at' | 'tenant_id'>) => {
      if (!user || !tenant) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('service_history')
        .insert({
          ...record,
          tenant_id: tenant.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceHistory'] });
      queryClient.invalidateQueries({ queryKey: ['maintenanceSchedules'] });
      toast({
        title: "Service Record Added",
        description: "The service record has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add service record. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding service record:', error);
    },
  });

  const addMaintenanceSchedule = useMutation({
    mutationFn: async (schedule: Omit<MaintenanceSchedule, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) => {
      if (!user || !tenant) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('maintenance_schedules')
        .insert({
          ...schedule,
          tenant_id: tenant.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceSchedules'] });
      toast({
        title: "Maintenance Schedule Added",
        description: "The maintenance schedule has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add maintenance schedule. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding maintenance schedule:', error);
    },
  });

  const addHealthReport = useMutation({
    mutationFn: async (report: Omit<VehicleHealthReport, 'id' | 'created_at' | 'tenant_id'>) => {
      if (!user || !tenant) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('vehicle_health_reports')
        .insert({
          ...report,
          tenant_id: tenant.id,
          created_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleHealthReports'] });
      toast({
        title: "Health Report Added",
        description: "The vehicle health report has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add health report. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding health report:', error);
    },
  });

  const updateMaintenanceSchedule = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MaintenanceSchedule> }) => {
      const { error } = await supabase
        .from('maintenance_schedules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceSchedules'] });
      toast({
        title: "Schedule Updated",
        description: "The maintenance schedule has been updated.",
      });
    },
  });

  const overdueSchedules = maintenanceSchedules.filter(schedule => schedule.is_overdue);
  const upcomingSchedules = maintenanceSchedules.filter(schedule => 
    !schedule.is_overdue && schedule.next_due_date && 
    new Date(schedule.next_due_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return {
    serviceHistory,
    maintenanceSchedules,
    healthReports,
    overdueSchedules,
    upcomingSchedules,
    isLoading: historyLoading || schedulesLoading || reportsLoading,
    addServiceRecord,
    addMaintenanceSchedule,
    addHealthReport,
    updateMaintenanceSchedule,
  };
};
