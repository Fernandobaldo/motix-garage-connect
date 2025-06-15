
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ServiceHistoryWithRelations, ServiceStatus } from "@/types/database";

export function useServiceHistory() {
  const queryClient = useQueryClient();

  // Delete service history record
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_history")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
    },
  });

  // Update status (allow only 'completed'/'cancelled')
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ServiceStatus }) => {
      const { error } = await supabase
        .from("service_history")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-history"] });
    },
  });

  return {
    deleteServiceHistory: deleteMutation.mutate,
    isDeletePending: deleteMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isStatusPending: updateStatusMutation.isPending,
  };
}
