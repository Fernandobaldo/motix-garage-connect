
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';

interface MonthlyUsage {
  appointments_used: number;
  storage_used: number;
}

export const useMonthlyUsage = () => {
  const { tenant } = useTenant();
  const { user } = useAuth();

  const { data: usage, isLoading, refetch } = useQuery({
    queryKey: ['monthlyUsage', tenant?.id],
    queryFn: async (): Promise<MonthlyUsage> => {
      if (!tenant?.id) {
        return { appointments_used: 0, storage_used: 0 };
      }

      const { data, error } = await supabase
        .rpc('get_monthly_usage', {
          p_tenant_id: tenant.id,
          p_user_id: user?.id || null
        });

      if (error) {
        console.error('Error fetching monthly usage:', error);
        return { appointments_used: 0, storage_used: 0 };
      }

      return data?.[0] || { appointments_used: 0, storage_used: 0 };
    },
    enabled: !!tenant?.id,
  });

  return {
    usage: usage || { appointments_used: 0, storage_used: 0 },
    isLoading,
    refetch,
  };
};

export default useMonthlyUsage;
