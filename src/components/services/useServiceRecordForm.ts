
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ServiceRecordWithRelations, PartUsed } from "@/types/database";

/** --- NEW NESTED STRUCTURE --- */
export interface ServiceWithItems {
  serviceType: { value: string; custom?: string };
  items: PartUsed[];
}

// Old types removed
export interface ServiceRecordFormState {
  services: ServiceWithItems[];
  description: string;
  mileage: string;
  technicianNotes: string;
}

// Utility: flatten the services to the old data model
const flattenServicesToFields = (services: ServiceWithItems[]) => {
  // For legacy save: flatten all serviceTypes to comma-separated string
  const serviceTypeString = services
    .map((svc) =>
      svc.serviceType.value === "Other" && svc.serviceType.custom
        ? svc.serviceType.custom
        : svc.serviceType.value
    )
    .filter(Boolean)
    .join(", ");
  // Flatten all items under all services (still flat array in db for now)
  const allItems: PartUsed[] = services.flatMap((svc) => svc.items);
  return { serviceTypeString, allItems };
};

const parseServicesFromRecord = (service_type: string, parts_used: any): ServiceWithItems[] => {
  // This tries to group them 1:1 if possible or fallback to a single service with all parts
  const serviceTypes = service_type
    ? service_type.split(",").map((v) => ({ value: v.trim() }))
    : [{ value: "" }];

  const items: PartUsed[] = Array.isArray(parts_used) ? (parts_used as PartUsed[]) : [];
  // Map items equally to services if possible (best effort), or all items to first
  if (serviceTypes.length === 1) {
    return [{ serviceType: serviceTypes[0], items }];
  }
  const perSvc = serviceTypes.map((type) => ({
    serviceType: type,
    items: [],
  }));
  if (items.length > 0) {
    // Just add all items to the first service (can be improved)
    perSvc[0].items = items;
  }
  return perSvc;
};

export const useServiceRecordForm = (
  mode: "add" | "edit",
  initialRecord?: ServiceRecordWithRelations,
  onSuccess?: () => void,
  onClose?: () => void
) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<ServiceRecordFormState>({
    services: initialRecord?.service_type
      ? parseServicesFromRecord(initialRecord.service_type, initialRecord.parts_used)
      : [{ serviceType: { value: "" }, items: [{ name: "", quantity: 1, price: 0 }] }],
    description: initialRecord?.description || "",
    mileage: initialRecord?.mileage?.toString() || "",
    technicianNotes: initialRecord?.technician_notes || "",
  });

  useEffect(() => {
    if (mode === "edit" && initialRecord) {
      setForm({
        services: initialRecord?.service_type
          ? parseServicesFromRecord(initialRecord.service_type, initialRecord.parts_used)
          : [{ serviceType: { value: "" }, items: [{ name: "", quantity: 1, price: 0 }] }],
        description: initialRecord.description || "",
        mileage: initialRecord.mileage != null ? String(initialRecord.mileage) : "",
        technicianNotes: initialRecord.technician_notes || "",
      });
    }
  }, [mode, initialRecord]);

  // General updater
  const setField = (name: keyof ServiceRecordFormState, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- SUBMIT LOGIC (edit mode, see below for add) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Validation: at least one service, at least one item in each with name
    const isValid =
      form.services.length > 0 &&
      form.services.every(
        (svc) =>
          svc.serviceType.value &&
          svc.items.length > 0 &&
          svc.items.every((item) => !!item.name)
      );
    if (!isValid) {
      toast({
        title: "Required fields missing",
        description:
          "Please fill in at least one service type, and each item must have a name.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    try {
      if (mode === "add") {
        setLoading(false);
        return;
      }
      if (!initialRecord) throw new Error("No service record to update");
      // Calculate total cost from all items
      const totalCost = form.services.reduce(
        (accSvc, svc) =>
          accSvc +
          svc.items.reduce(
            (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
            0
          ),
        0
      );
      // Flatten to legacy db format
      const { serviceTypeString, allItems } = flattenServicesToFields(form.services);
      const { error } = await supabase
        .from("service_records")
        .update({
          service_type: serviceTypeString,
          description: form.description,
          cost: totalCost,
          mileage: form.mileage ? parseInt(form.mileage) : null,
          labor_hours: null,
          technician_notes: form.technicianNotes,
          parts_used: allItems as any, // Still flat for now
        })
        .eq("id", initialRecord.id);

      if (error) throw error;
      toast({
        title: "Service record updated",
        description: "Changes saved successfully.",
      });
      onSuccess?.();
      onClose?.();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update service record.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    setForm,
    setField,
    loading,
    handleSubmit,
  };
};
