
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Workshop {
  id: string;
  owner_id: string;
  tenant_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  services_offered: string[] | null;
  languages_spoken: string[] | null;
  working_hours: any;
  is_public: boolean | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkshopContextType {
  workshop: Workshop | null;
  loading: boolean;
  updateWorkshop: (updates: Partial<Workshop>) => Promise<{ error: any }>;
  refreshWorkshop: () => Promise<void>;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

export const WorkshopProvider = ({ children }: { children: ReactNode }) => {
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const fetchWorkshop = async () => {
    if (!user || profile?.role !== 'workshop') {
      setWorkshop(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workshops')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching workshop:', error);
        return;
      }

      setWorkshop(data);
    } catch (error) {
      console.error('Error fetching workshop:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchWorkshop();
    } else {
      setWorkshop(null);
      setLoading(false);
    }
  }, [profile, user]);

  const updateWorkshop = async (updates: Partial<Workshop>) => {
    if (!workshop || !user) return { error: 'No workshop or user' };

    try {
      const { error } = await supabase
        .from('workshops')
        .update(updates)
        .eq('id', workshop.id);

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      await fetchWorkshop();
      toast({
        title: "Workshop Updated",
        description: "Workshop profile has been updated successfully.",
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

  const refreshWorkshop = async () => {
    await fetchWorkshop();
  };

  const value = {
    workshop,
    loading,
    updateWorkshop,
    refreshWorkshop,
  };

  return <WorkshopContext.Provider value={value}>{children}</WorkshopContext.Provider>;
};

export const useWorkshop = () => {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error('useWorkshop must be used within a WorkshopProvider');
  }
  return context;
};
