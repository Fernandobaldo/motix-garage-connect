
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import type { Appointment } from './types';

export const useAppointmentData = (userRole: 'client' | 'workshop') => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAppointments = async () => {
    if (!tenant || !user) return;

    try {
      let query = supabase
        .from('appointments')
        .select(`
          id,
          service_type,
          scheduled_at,
          duration_minutes,
          status,
          client:profiles!appointments_client_id_fkey(full_name),
          vehicle:vehicles(make, model, year)
        `)
        .eq('tenant_id', tenant.id)
        .order('scheduled_at', { ascending: true });

      if (userRole === 'client') {
        query = query.eq('client_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading appointments:', error);
        return;
      }

      console.log('Raw appointment data:', data);

      // Filter out any appointments with invalid data and ensure proper typing
      const validAppointments: Appointment[] = (data || [])
        .filter(apt => apt && typeof apt === 'object')
        .map(apt => ({
          id: apt.id,
          service_type: apt.service_type,
          scheduled_at: apt.scheduled_at,
          duration_minutes: apt.duration_minutes,
          status: apt.status,
          client: apt.client && typeof apt.client === 'object' && 'full_name' in apt.client 
            ? apt.client 
            : null,
          vehicle: apt.vehicle && 
                   typeof apt.vehicle === 'object' && 
                   apt.vehicle !== null &&
                   'make' in apt.vehicle && 
                   'model' in apt.vehicle && 
                   'year' in apt.vehicle
            ? apt.vehicle
            : null
        }));

      console.log('Processed appointments:', validAppointments);
      setAppointments(validAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [tenant, user, userRole]);

  return { appointments, loading, refetch: loadAppointments };
};
