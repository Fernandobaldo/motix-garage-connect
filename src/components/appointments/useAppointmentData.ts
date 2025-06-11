
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useAppointmentData = () => {
  const { profile, user } = useAuth();

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', user?.id, profile?.tenant_id, profile?.role],
    queryFn: async () => {
      if (!user || !profile) {
        console.log('No user or profile, returning empty appointments');
        return [];
      }

      console.log('Fetching appointments for user:', user.id, 'role:', profile.role, 'tenant:', profile.tenant_id);

      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(id, full_name, phone),
          workshop:workshops!appointments_workshop_id_fkey(id, name, phone, email),
          vehicle:vehicles!appointments_vehicle_id_fkey(id, make, model, year, license_plate)
        `)
        .order('scheduled_at', { ascending: false });

      // Filter based on user role
      if (profile.role === 'client') {
        console.log('Filtering appointments for client:', user.id);
        query = query.eq('client_id', user.id);
      } else if (profile.role === 'workshop' && profile.tenant_id) {
        console.log('Filtering appointments for workshop tenant:', profile.tenant_id);
        query = query.eq('tenant_id', profile.tenant_id);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log('Fetched appointments:', data?.length || 0, 'appointments');

      // Process appointments to handle guest appointments
      const processedAppointments = (data || []).map(appointment => {
        // Extract guest client info from description if client_id is null
        if (!appointment.client_id && appointment.description) {
          const guestMatch = appointment.description.match(/Guest appointment for: (.+?) \((.+?)\)/);
          if (guestMatch) {
            return {
              ...appointment,
              client: {
                id: null,
                full_name: guestMatch[1],
                phone: guestMatch[2]
              }
            };
          }
        }
        return appointment;
      });

      console.log('Processed appointments:', processedAppointments);
      return processedAppointments;
    },
    enabled: !!user && !!profile,
  });

  return {
    appointments,
    isLoading,
    refetch,
  };
};
