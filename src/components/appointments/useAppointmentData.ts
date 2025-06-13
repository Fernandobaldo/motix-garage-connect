
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppointmentWithRelations } from '@/types/database';

export const useAppointmentData = () => {
  const { profile } = useAuth();

  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', profile?.tenant_id],
    queryFn: async (): Promise<AppointmentWithRelations[]> => {
      if (!profile?.tenant_id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          client:profiles!appointments_client_id_fkey (
            id,
            full_name,
            phone,
            created_at,
            updated_at,
            tenant_id,
            role,
            last_login_at
          ),
          workshop:workshops!appointments_workshop_id_fkey (
            *
          ),
          vehicle:vehicles!appointments_vehicle_id_fkey (
            id,
            make,
            model,
            year,
            license_plate
          )
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      // Process appointments to handle guest clients and verify associations
      const processedAppointments = await Promise.all(
        (data || []).map(async (appointment) => {
          // If no client but has guest_client_id, fetch guest client data
          if (!appointment.client && appointment.guest_client_id) {
            const { data: guestClient } = await supabase
              .from('clients')
              .select('*')
              .eq('id', appointment.guest_client_id)
              .single();
            
            if (guestClient) {
              return {
                ...appointment,
                client: {
                  id: guestClient.id,
                  full_name: guestClient.full_name,
                  phone: guestClient.phone || '',
                  created_at: guestClient.created_at,
                  updated_at: guestClient.updated_at,
                  tenant_id: guestClient.tenant_id,
                  role: 'client' as const,
                  last_login_at: null,
                },
                client_id: guestClient.id,
                is_guest_client: true,
              };
            }
          }
          
          return {
            ...appointment,
            is_guest_client: false,
          };
        })
      );

      return processedAppointments as AppointmentWithRelations[];
    },
    enabled: !!profile?.tenant_id,
  });

  return {
    appointments,
    isLoading,
    error,
    refetch,
  };
};
