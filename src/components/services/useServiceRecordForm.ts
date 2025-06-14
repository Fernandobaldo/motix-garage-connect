
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ServiceRecordWithRelations, PartUsed } from "@/types/database";

/**
 * Service type option: value from dropdown or custom if "Other."
 */
export interface ServiceTypeItem {
  value: string;
  custom?: string;
}

export interface ServiceRecordFormState {
  serviceTypes: ServiceTypeItem[]; // Array of service types
  description: string;
  mileage: string;
  technicianNotes: string;
  partsUsed: PartUsed[];
}

// Utility: convert array of service type objects back to string(s) for storage (comma separated or as JSON string? We'll use comma-separated string for now for backward compatibility)
const flattenServiceTypes = (items: ServiceTypeItem[]) =>
  items
    .map((i) => (i.value === "Other" && i.custom ? i.custom : i.value))
    .filter(Boolean)
    .join(", ");

const parseServiceTypes = (service_type: string): ServiceTypeItem[] => {
  if (!service_type) return [{ value: "" }];
  // Heuristic: If it's a comma-separated string, split it.
  if (service_type.includes(",")) {
    return service_type.split(",").map((v) => {
      const val = v.trim();
      return { value: val === "Other" ? "Other" : val };
    });
  }
  return [{ value: service_type }];
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

  // Form state, initialized with blanks or provided record
  const [form, setForm] = useState<ServiceRecordFormState>({
    serviceTypes: initialRecord?.service_type
      ? parseServiceTypes(initialRecord.service_type)
      : [{ value: "" }],
    description: initialRecord?.description || "",
    mileage: initialRecord?.mileage?.toString() || "",
    technicianNotes: initialRecord?.technician_notes || "",
    partsUsed: Array.isArray(initialRecord?.parts_used)
      ? (initialRecord?.parts_used as PartUsed[])
      : [],
  });

  useEffect(() => {
    if (mode === "edit" && initialRecord) {
      setForm({
        serviceTypes: initialRecord?.service_type
          ? parseServiceTypes(initialRecord.service_type)
          : [{ value: "" }],
        description: initialRecord.description || "",
        mileage: initialRecord.mileage != null ? String(initialRecord.mileage) : "",
        technicianNotes: initialRecord.technician_notes || "",
        partsUsed: Array.isArray(initialRecord.parts_used)
          ? (initialRecord.parts_used as PartUsed[])
          : [],
      });
    }
  }, [mode, initialRecord]);

  // General field updater
  const setField = (name: keyof ServiceRecordFormState, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation: must have at least one service, at least one item with name
    if (
      !form.serviceTypes.length ||
      !form.serviceTypes[0].value ||
      form.partsUsed.some((item) => !item.name)
    ) {
      toast({
        title: "Required fields missing",
        description:
          "Please fill in at least one service type and each item must have a name.",
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
      // Calculate total cost for saving
      const totalCost = form.partsUsed.reduce(
        (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
        0
      );
      const { error } = await supabase
        .from("service_records")
        .update({
          service_type: flattenServiceTypes(form.serviceTypes), // save as comma-separated for compatibility
          description: form.description,
          cost: totalCost, // always update cost as the summary
          mileage: form.mileage ? parseInt(form.mileage) : null,
          labor_hours: null, // remove labor hours
          technician_notes: form.technicianNotes,
          parts_used: form.partsUsed as any, // Cast for TS and Supabase Json
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
