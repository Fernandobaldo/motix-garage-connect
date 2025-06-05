
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Tenant {
  id: string;
  name: string;
  subdomain: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  updateTenant: (updates: Partial<Tenant>) => Promise<{ error: any }>;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const fetchTenant = async () => {
    if (!profile?.tenant_id) {
      setTenant(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

      if (error) {
        console.error('Error fetching tenant:', error);
        return;
      }

      setTenant(data);
    } catch (error) {
      console.error('Error fetching tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchTenant();
    } else {
      setTenant(null);
      setLoading(false);
    }
  }, [profile]);

  const updateTenant = async (updates: Partial<Tenant>) => {
    if (!tenant || !user) return { error: 'No tenant or user' };

    try {
      const { error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenant.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      await fetchTenant();
      toast({
        title: "Tenant Updated",
        description: "Tenant information has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const refreshTenant = async () => {
    await fetchTenant();
  };

  const value = {
    tenant,
    loading,
    updateTenant,
    refreshTenant,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
