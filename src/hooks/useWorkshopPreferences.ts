
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { WorkshopPreferences } from '@/types/database';

export const useWorkshopPreferences = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['workshop-preferences', profile?.tenant_id],
    queryFn: async (): Promise<WorkshopPreferences | null> => {
      if (!profile?.tenant_id) return null;

      const { data, error } = await supabase
        .from('workshop_preferences')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default ones
          const { data: newPrefs, error: createError } = await supabase
            .from('workshop_preferences')
            .insert({
              tenant_id: profile.tenant_id,
              currency_code: 'USD',
              distance_unit: 'km',
              timezone: 'UTC'
            })
            .select('*')
            .single();

          if (createError) throw createError;
          return newPrefs;
        }
        throw error;
      }

      return data;
    },
    enabled: !!profile?.tenant_id,
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<WorkshopPreferences>) => {
      if (!profile?.tenant_id) throw new Error('No tenant found');

      const { data, error } = await supabase
        .from('workshop_preferences')
        .update(updates)
        .eq('tenant_id', profile.tenant_id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-preferences'] });
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
  };
};
