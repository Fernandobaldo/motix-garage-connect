
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { ServiceRecordWithRelations, ServiceHistoryWithRelations } from "@/types/database";

/**
 * Unified Service Records and History hook
 * Returns both service records (active/cancelled) & completed/cancelled service history
 * All records enriched with client, vehicle, and workshop relations.
 */
export const useUnifiedServiceRecords = () => {
  const { user, profile } = useAuth();

  // Helper for enriching records with related data
  const enrichRecords = async <T extends { client_id?: string | null; workshop_id?: string | null; vehicle_id?: string | null }>(
    records: T[]
  ): Promise<Array<T & { client?: any; workshop?: any; vehicle?: any }>> => {
    if (!records.length) return [];

    // Collect unique client, workshop, vehicle IDs
    const clientIds = [...new Set(records.map(r => r.client_id).filter(Boolean))];
    const workshopIds = [...new Set(records.map(r => r.workshop_id).filter(Boolean))];
    const vehicleIds = [...new Set(records.map(r => r.vehicle_id).filter(Boolean))];

    // Fetch in parallel
    const [clientsData, workshopsData, vehiclesData] = await Promise.all([
      clientIds.length
        ? Promise.all([
            supabase.from("profiles").select("id, full_name, phone").in("id", clientIds),
            supabase.from("clients").select("id, full_name, phone").in("id", clientIds),
          ])
        : [{ data: [] }, { data: [] }],
      workshopIds.length
        ? supabase.from("workshops").select("id, name").in("id", workshopIds)
        : { data: [] },
      vehicleIds.length
        ? supabase.from("vehicles").select("id, make, model, year, license_plate").in("id", vehicleIds)
        : { data: [] },
    ]);

    // Merge all clients (profiles & clients)
    const allClients = [
      ...(clientsData[0].data || []),
      ...(clientsData[1].data || []),
    ];
    const clientsMap = new Map(allClients.map(c => [c.id, c]));
    const workshopsMap = new Map((workshopsData.data || []).map(w => [w.id, w]));
    const vehiclesMap = new Map((vehiclesData.data || []).map(v => [v.id, v]));

    // Enrich all records
    return records.map(r => ({
      ...r,
      client: r.client_id ? clientsMap.get(r.client_id) || null : null,
      workshop: r.workshop_id ? workshopsMap.get(r.workshop_id) || null : null,
      vehicle: r.vehicle_id ? vehiclesMap.get(r.vehicle_id) || null : null,
    }));
  };

  // Fetch active/cancelled (not completed) from service_records
  const {
    data: serviceRecords = [],
    isLoading: isLoadingRecords,
  } = useQuery<ServiceRecordWithRelations[]>({
    queryKey: ["service-records", user?.id, profile?.tenant_id, "unified"],
    queryFn: async () => {
      if (!user || !profile?.tenant_id) return [];
      const { data, error } = await supabase
        .from("service_records")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const enriched = await enrichRecords(data || []);
      return enriched as ServiceRecordWithRelations[];
    },
    enabled: !!user && !!profile?.tenant_id,
  });

  // Fetch completed/cancelled from service_history
  const {
    data: serviceHistory = [],
    isLoading: isLoadingHistory,
  } = useQuery<ServiceHistoryWithRelations[]>({
    queryKey: ["service-history", user?.id, profile?.tenant_id, "unified"],
    queryFn: async () => {
      if (!user || !profile?.tenant_id) return [];
      const { data, error } = await supabase
        .from("service_history")
        .select("*")
        .eq("tenant_id", profile.tenant_id)
        .order("completed_at", { ascending: false });
      if (error) throw error;
      const enriched = await enrichRecords(data || []);
      return enriched as ServiceHistoryWithRelations[];
    },
    enabled: !!user && !!profile?.tenant_id,
  });

  return {
    serviceRecords,
    serviceHistory,
    isLoading: isLoadingRecords || isLoadingHistory,
  };
};
