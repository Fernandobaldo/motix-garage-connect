
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { AppointmentWithRelations } from '@/types/database';

export const useAppointmentData = () => {
  const { profile, user } = useAuth();

  const { data: appointments = [], isLoading, refetch } = useQuery({
    queryKey: ['appointments', user?.id, profile?.tenant_id, profile?.role],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      if (!user || !profile) {
        console.log('No user or profile, returning empty appointments');
        return [];
      }

      console.log('Fetching appointments for user:', user.id, 'role:', profile.role, 'tenant:', profile.tenant_id);

      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey(*),
          workshop:workshops!appointments_workshop_id_fkey(*),
          vehicle:vehicles!appointments_vehicle_id_fkey(*)
        `)
        .order('scheduled_at', { ascending: false });

      // Always filter by tenant_id for security
      if (profile.tenant_id) {
        query = query.eq('tenant_id', profile.tenant_id);
      }

      // Filter based on user role
      if (profile.role === 'client') {
        console.log('Filtering appointments for client:', user.id);
        query = query.eq('client_id', user.id);
      } else if (profile.role === 'workshop') {
        console.log('Filtering appointments for workshop tenant:', profile.tenant_id);
        // Workshop users see all appointments in their tenant (already filtered above)
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      console.log('Fetched appointments:', data?.length || 0, 'appointments');
      console.log('Raw appointment data:', data);

      // Process appointments to handle guest appointments and ensure client info is available
      const processedAppointments: AppointmentWithRelations[] = (data || []).map(appointment => {
        console.log('Processing appointment:', appointment.id, 'client_id:', appointment.client_id, 'client data:', appointment.client);
        
        // If no client_id but description contains guest info, extract it
        if (!appointment.client_id && appointment.description) {
          const guestMatch = appointment.description.match(/Guest appointment for: (.+?) \((.+?)\)/);
          if (guestMatch) {
            return {
              ...appointment,
              client: {
                id: null as any, // Guest clients don't have real IDs
                full_name: guestMatch[1],
                phone: guestMatch[2],
                created_at: '',
                updated_at: '',
                tenant_id: null,
                role: 'client' as const
              }
            };
          }
        }
        
        // If client_id exists but no client data was fetched, try to get it
        if (appointment.client_id && !appointment.client) {
          console.warn('Appointment has client_id but no client data:', appointment.id);
        }
        
        return appointment as AppointmentWithRelations;
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
