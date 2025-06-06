
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

export const useAppointmentData = () => {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.id, tenant?.id],
    queryFn: async () => {
      if (!user || !tenant) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(full_name, phone),
          workshop:workshops!appointments_workshop_id_fkey(name, phone),
          vehicle:vehicles!appointments_vehicle_id_fkey(make, model, year, license_plate)
        `)
        .eq('tenant_id', tenant.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!tenant,
  });

  const upcomingAppointments = appointments.filter(apt => {
    const scheduledDate = new Date(apt.scheduled_at);
    const now = new Date();
    return scheduledDate > now && apt.status !== 'cancelled';
  });

  const todayAppointments = appointments.filter(apt => {
    const scheduledDate = new Date(apt.scheduled_at);
    const today = new Date();
    return (
      scheduledDate.toDateString() === today.toDateString() &&
      apt.status !== 'cancelled'
    );
  });

  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  );

  const pendingAppointments = appointments.filter(apt => 
    apt.status === 'pending'
  );

  const appointmentsByVehicle = appointments.reduce((acc, apt) => {
    if (apt.vehicle) {
      const vehicleKey = `${apt.vehicle.year} ${apt.vehicle.make} ${apt.vehicle.model}`;
      if (!acc[vehicleKey]) {
        acc[vehicleKey] = {
          vehicle: apt.vehicle,
          appointments: []
        };
      }
      acc[vehicleKey].appointments.push(apt);
    }
    return acc;
  }, {} as Record<string, { vehicle: any; appointments: any[] }>);

  return {
    appointments,
    upcomingAppointments,
    todayAppointments,
    completedAppointments,
    pendingAppointments,
    appointmentsByVehicle,
    isLoading,
    loading: isLoading, // Add this for backward compatibility
  };
};
