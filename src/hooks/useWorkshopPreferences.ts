
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { WorkshopPreferences } from '@/types/database';

export const useWorkshopPreferences = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error, refetch } = useQuery({
    queryKey: ['workshop-preferences', profile?.tenant_id],
    queryFn: async (): Promise<WorkshopPreferences | null> => {
      if (!profile?.tenant_id) {
        console.warn('[WorkshopPreferences] No tenant_id found on profile');
        return null;
      }

      const { data, error } = await supabase
        .from('workshop_preferences')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, attempt to create defaults
          try {
            const { data: newPrefs, error: createError } = await supabase
              .from('workshop_preferences')
              .insert({
                tenant_id: profile.tenant_id,
                currency_code: 'USD',
                distance_unit: 'km',
                timezone: 'UTC'
              })
              .select('*')
              .maybeSingle();

            if (createError) {
              if (createError.code === '42501') {
                // RLS violation (shouldn't happen with policies, but handle just in case)
                toast({
                  title: 'Access Denied',
                  description: 'You do not have permission to create workshop preferences for this tenant.',
                  variant: 'destructive',
                });
                console.error('[WorkshopPreferences] RLS violation when creating preferences.', createError);
                return null;
              }
              throw createError;
            }
            return newPrefs;
          } catch (caughtCreateErr: any) {
            toast({
              title: 'Workshop Preferences Error',
              description: caughtCreateErr?.message || 'Failed to create default preferences. Please contact support.',
              variant: 'destructive',
            });
            throw caughtCreateErr;
          }
        }
        // Handle RLS violation on select
        if (error.code === '42501') {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to view workshop preferences for this tenant.',
            variant: 'destructive',
          });
          console.error('[WorkshopPreferences] RLS violation when selecting preferences.', error);
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!profile?.tenant_id,
    retry: (failureCount, error: any) => {
      if (error?.code === '42501') return false;
      return failureCount < 2;
    },
    onError: (err: any) => {
      if (err && err.code !== '42501') {
        toast({
          title: 'Error loading preferences',
          description: err?.message || 'Unable to load workshop preferences.',
          variant: 'destructive',
        });
      }
    }
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<WorkshopPreferences>) => {
      if (!profile?.tenant_id) throw new Error('No tenant found');

      const { data, error } = await supabase
        .from('workshop_preferences')
        .update(updates)
        .eq('tenant_id', profile.tenant_id)
        .select('*')
        .maybeSingle();

      if (error) {
        if (error.code === '42501') {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to update workshop preferences.',
            variant: 'destructive',
          });
          throw error;
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workshop-preferences'] });
      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      });
    },
    onError: (error: any) => {
      if (error?.code !== '42501') {
        toast({
          title: 'Error',
          description: 'Failed to update preferences',
          variant: 'destructive',
        });
      }
    },
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updatePreferences.mutate,
    isUpdating: updatePreferences.isPending,
    error,
    refetch,
  };
};
