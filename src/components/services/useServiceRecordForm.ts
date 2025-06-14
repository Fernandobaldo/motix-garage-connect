
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ServiceRecordWithRelations, PartUsed } from "@/types/database";

export interface ServiceRecordFormState {
  serviceType: string;
  description: string;
  cost: string;
  mileage: string;
  laborHours: string;
  technicianNotes: string;
  partsUsed: PartUsed[];
}

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
    serviceType: initialRecord?.service_type || "",
    description: initialRecord?.description || "",
    cost: initialRecord?.cost?.toString() || "",
    mileage: initialRecord?.mileage?.toString() || "",
    laborHours: initialRecord?.labor_hours?.toString() || "",
    technicianNotes: initialRecord?.technician_notes || "",
    partsUsed: Array.isArray(initialRecord?.parts_used)
      ? (initialRecord?.parts_used as unknown as PartUsed[])
      : [],
  });

  useEffect(() => {
    if (mode === "edit" && initialRecord) {
      setForm({
        serviceType: initialRecord.service_type || "",
        description: initialRecord.description || "",
        cost: initialRecord.cost != null ? String(initialRecord.cost) : "",
        mileage: initialRecord.mileage != null ? String(initialRecord.mileage) : "",
        laborHours: initialRecord.labor_hours != null
          ? String(initialRecord.labor_hours)
          : "",
        technicianNotes: initialRecord.technician_notes || "",
        partsUsed: Array.isArray(initialRecord.parts_used)
          ? (initialRecord.parts_used as unknown as PartUsed[])
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

    // Validation: must have type, vehicle, and client (add mode), skip for now, assume handled in parent
    try {
      if (mode === "add") {
        // Not called here; new record creation handled elsewhere.
        setLoading(false);
        return;
      }
      // Edit mode: update the record
      if (!initialRecord) throw new Error("No service record to update");
      const { error } = await supabase
        .from("service_records")
        .update({
          service_type: form.serviceType,
          description: form.description,
          cost: form.cost ? parseFloat(form.cost) : null,
          mileage: form.mileage ? parseInt(form.mileage) : null,
          labor_hours: form.laborHours ? parseFloat(form.laborHours) : null,
          technician_notes: form.technicianNotes,
          parts_used: form.partsUsed as unknown as object[], // Ensure TS compatibility for Json[]
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
