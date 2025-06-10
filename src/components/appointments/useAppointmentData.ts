
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

export const useAppointmentData = () => {
  const { user, profile } = useAuth();
  const { tenant } = useTenant();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', user?.id, tenant?.id, profile?.role],
    queryFn: async () => {
      if (!user || !tenant || !profile) {
        console.log('Missing required data for appointments query:', { user: !!user, tenant: !!tenant, profile: !!profile });
        return [];
      }

      console.log('Fetching appointments for:', { 
        userId: user.id, 
        tenantId: tenant.id, 
        role: profile.role 
      });

      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(full_name, phone),
          workshop:workshops!appointments_workshop_id_fkey(name, phone),
          vehicle:vehicles!appointments_vehicle_id_fkey(make, model, year, license_plate)
        `);

      // Filter based on user role
      if (profile.role === 'client') {
        query = query.eq('client_id', user.id);
      } else if (profile.role === 'workshop') {
        query = query.eq('tenant_id', tenant.id);
      }

      query = query.order('scheduled_at', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log('Fetched appointments:', data);
      return data || [];
    },
    enabled: !!user && !!tenant && !!profile,
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
