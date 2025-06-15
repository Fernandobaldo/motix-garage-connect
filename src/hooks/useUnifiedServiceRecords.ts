
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ServiceRecordWithRelations, ServiceHistoryWithRelations } from "@/types/database";

/**
 * Unified Service Records and History hook
 * Returns both service records (active/cancelled) & completed/cancelled service history
 */
export const useUnifiedServiceRecords = () => {
  const { user, profile } = useAuth();

  // Fetch active/cancelled (not completed) from service_records
  const { data: serviceRecords = [], isLoading: isLoadingRecords } = useQuery({
    queryKey: ["service-records", user?.id, profile?.tenant_id],
    queryFn: async () => {
      if (!user || !profile?.tenant_id) return [];
      const { data, error } = await supabase
        .from("service_records")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!profile?.tenant_id,
  });

  // Fetch completed/cancelled from service_history
  const { data: serviceHistory = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ["service-history", user?.id, profile?.tenant_id],
    queryFn: async () => {
      if (!user || !profile?.tenant_id) return [];
      const { data, error } = await supabase
        .from("service_history")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && !!profile?.tenant_id,
  });

  return {
    serviceRecords,
    serviceHistory,
    isLoading: isLoadingRecords || isLoadingHistory,
  };
};
