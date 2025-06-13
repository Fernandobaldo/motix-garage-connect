
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { getPlanLimits } from '@/utils/permissions';

export const useClientLimits = () => {
  const { profile } = useAuth();
  const { tenant } = useTenant();

  const { data: canAddClient, isLoading } = useQuery({
    queryKey: ['client-limits', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return false;

      const { data, error } = await supabase.rpc('can_add_client', {
        p_tenant_id: profile.tenant_id
      });

      if (error) {
        console.error('Error checking client limits:', error);
        return false;
      }

      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  const { data: currentCount } = useQuery({
    queryKey: ['current-client-count', profile?.tenant_id],
    queryFn: async () => {
      if (!profile?.tenant_id) return 0;

      // Count both authenticated and guest clients
      const [authClientsResult, guestClientsResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .eq('tenant_id', profile.tenant_id)
          .eq('role', 'client'),
        supabase
          .from('clients')
          .select('id', { count: 'exact' })
          .eq('tenant_id', profile.tenant_id)
      ]);

      const authCount = authClientsResult.count || 0;
      const guestCount = guestClientsResult.count || 0;

      return authCount + guestCount;
    },
    enabled: !!profile?.tenant_id,
  });

  const planLimits = tenant ? getPlanLimits(tenant.subscription_plan) : null;
  const maxClients = planLimits?.vehicles || 10; // Using vehicles limit as client limit base

  return {
    canAddClient: canAddClient ?? false,
    currentCount: currentCount ?? 0,
    maxClients: maxClients === -1 ? 'Unlimited' : maxClients,
    isLoading,
    isAtLimit: !canAddClient && !isLoading,
  };
};
