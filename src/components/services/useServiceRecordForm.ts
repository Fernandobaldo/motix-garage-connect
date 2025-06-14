import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ServiceRecordWithRelations, PartUsed } from "@/types/database";

export interface ServiceWithItems {
  serviceType: { value: string; custom?: string };
  items: PartUsed[];
}

export interface ServiceRecordFormState {
  services: ServiceWithItems[];
  description: string;
  mileage: string;
  technicianNotes: string;
  nextOilChangeMileage: string; // NEW FIELD
}

// Utility: flatten the services to old data model, but include serviceType on each item
const flattenServicesToFields = (services: ServiceWithItems[]) => {
  const serviceTypeString = services
    .map((svc) =>
      svc.serviceType.value === "Other" && svc.serviceType.custom
        ? svc.serviceType.custom
        : svc.serviceType.value
    )
    .filter(Boolean)
    .join(", ");
  // Each part now carries its serviceType - this is new
  const allItems: PartUsed[] = services.flatMap((svc) =>
    svc.items.map((item) => ({
      ...item,
      // track service type on each part
      serviceType:
        svc.serviceType.value === "Other" && svc.serviceType.custom
          ? svc.serviceType.custom
          : svc.serviceType.value,
    }))
  );
  return { serviceTypeString, allItems };
};

// Utility: parse services & items grouped by serviceType
const parseServicesFromRecord = (service_type: string, parts_used: any): ServiceWithItems[] => {
  // If saved parts have serviceType field, group by it. If not, fallback to old grouping.
  const parts: (PartUsed & { serviceType?: string })[] = Array.isArray(parts_used) ? parts_used : [];

  // build mapping from visible service types
  const serviceTypes = service_type
    ? service_type.split(",").map((v) => ({ value: v.trim() }))
    : [{ value: "" }];

  // If every item has serviceType, group using that
  const itemsGrouped: Record<string, PartUsed[]> = {};
  let hasExplicitTypes = parts.length > 0 && parts.every(p => !!p.serviceType);

  if (hasExplicitTypes) {
    for (const p of parts) {
      const tkey = p.serviceType || "";
      if (!itemsGrouped[tkey]) itemsGrouped[tkey] = [];
      // Remove the serviceType property for item to keep shape
      const {serviceType, ...rest} = p;
      itemsGrouped[tkey].push(rest);
    }
    // Build per-service with correct custom field support
    return serviceTypes.map((stype) => ({
      serviceType: stype,
      items: itemsGrouped[
        stype.value
      ] || [],
    }));
  } else {
    // Fallback (legacy) – assign all parts to first service, others empty
    if (serviceTypes.length === 1) {
      return [{ serviceType: serviceTypes[0], items: parts }];
    }
    const perSvc = serviceTypes.map((type) => ({
      serviceType: type,
      items: [],
    }));
    if (parts.length > 0) {
      perSvc[0].items = parts;
    }
    return perSvc;
  }
};

// Utility to extract nextOilChangeMileage from technician notes (if present as JSON)
function extractNextOilChangeMileage(technicianNotes: string | undefined): { nextOilChangeMileage: string, plainNotes: string } {
  if (!technicianNotes) return { nextOilChangeMileage: "", plainNotes: "" };
  // Our convention: if the notes start with {"nextOilChangeMileage":"12345"}\n, extract it
  try {
    if (technicianNotes.startsWith("{")) {
      const endIdx = technicianNotes.indexOf("}\n");
      if (endIdx !== -1) {
        const jsonBlob = technicianNotes.slice(0, endIdx + 1);
        const parsed = JSON.parse(jsonBlob);
        const plainNotes = technicianNotes.slice(endIdx + 2);
        return {
          nextOilChangeMileage: parsed.nextOilChangeMileage ?? "",
          plainNotes,
        };
      }
    }
  } catch (_) {}
  return { nextOilChangeMileage: "", plainNotes: technicianNotes };
}

// Utility to prepend nextOilChangeMileage to technician notes
function buildTechnicianNotes(nextOilChangeMileage: string, technicianNotes: string) {
  if (!nextOilChangeMileage) return technicianNotes?.trim() || "";
  const safeNotes = technicianNotes ? technicianNotes.trim() : "";
  // Prepend JSON and two newlines (easy to parse/detect)
  return JSON.stringify({ nextOilChangeMileage }) + "\n" + safeNotes;
}

// Add a helper to get an empty form state, so it's always the same shape/blank for create.
function getEmptyFormState(): ServiceRecordFormState {
  return {
    services: [],
    description: "",
    mileage: "",
    technicianNotes: "",
    nextOilChangeMileage: "",
  };
}

export const useServiceRecordForm = (
  mode: "add" | "edit",
  initialRecord?: ServiceRecordWithRelations,
  onSuccess?: () => void,
  onClose?: () => void,
  extra?: { selectedVehicle?: any; selectedClient?: { id: string; name: string; type: "auth" | "guest" } },
  isOpen?: boolean // <-- NEW
) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Handle extracting nextOilChangeMileage from technicianNotes JSON prefix
  let extracted = { nextOilChangeMileage: "", plainNotes: "" };
  if (initialRecord?.technician_notes) {
    extracted = extractNextOilChangeMileage(initialRecord.technician_notes);
  }

  // Always use the getEmptyFormState for initial state if mode is add
  const [form, setForm] = useState<ServiceRecordFormState>(
    mode === "add"
      ? getEmptyFormState()
      : {
          services: initialRecord?.service_type
            ? parseServicesFromRecord(initialRecord.service_type, initialRecord.parts_used)
            : [], // For new record: completely empty by default!
          description: initialRecord?.description || "",
          mileage: initialRecord?.mileage?.toString() || "",
          technicianNotes: extracted.plainNotes || "",
          nextOilChangeMileage: extracted.nextOilChangeMileage || "",
        }
  );

  // --- FORM RESET LOGIC FOR CREATE MODE ---
  useEffect(() => {
    // When opening the modal in create/add mode, always reset to empty when opening.
    if (mode === "add" && isOpen) {
      setForm(getEmptyFormState());
    }
    // eslint-disable-next-line
  }, [isOpen, mode]);

  useEffect(() => {
    if (mode === "edit" && initialRecord) {
      let nextOilChangeMileageFromNotes = "";
      let notes = initialRecord.technician_notes || "";
      if (notes) {
        const ext = extractNextOilChangeMileage(notes);
        nextOilChangeMileageFromNotes = ext.nextOilChangeMileage;
        notes = ext.plainNotes;
      }
      setForm({
        services: initialRecord?.service_type
          ? parseServicesFromRecord(initialRecord.service_type, initialRecord.parts_used)
          : [{ serviceType: { value: "" }, items: [{ name: "", quantity: 1, price: 0 }] }],
        description: initialRecord.description || "",
        mileage: initialRecord.mileage != null ? String(initialRecord.mileage) : "",
        technicianNotes: notes || "",
        nextOilChangeMileage: nextOilChangeMileageFromNotes || "",
      });
    }
    // eslint-disable-next-line
  }, [mode, initialRecord]);

  const setField = (name: keyof ServiceRecordFormState, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Validation: at least one service, each item has a name
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
        if (!profile?.tenant_id) {
          toast({
            title: "Unable to create service record - no workshop selected",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        if (!extra?.selectedVehicle || !extra?.selectedClient) {
          toast({
            title: "Missing vehicle or client",
            description: "Select vehicle and client to create service record.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        const { serviceTypeString, allItems } = flattenServicesToFields(form.services);
        const totalCost = form.services.reduce(
          (svcCost, svc) =>
            svcCost +
            svc.items.reduce(
              (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
              0
            ),
          0
        );
        // Insert into supabase
        const { error } = await supabase.from("service_records").insert({
          tenant_id: profile.tenant_id,
          vehicle_id: extra.selectedVehicle.vehicle_id || extra.selectedVehicle.id,
          workshop_id: profile.id,
          client_id: extra.selectedClient.id,
          service_type: serviceTypeString,
          description: form.description,
          cost: totalCost,
          mileage: form.mileage ? parseInt(form.mileage) : null,
          labor_hours: null,
          // Embedding the nextOilChangeMileage into technician_notes
          technician_notes: buildTechnicianNotes(
            form.nextOilChangeMileage,
            form.technicianNotes
          ),
          parts_used: allItems as any,
          status: "pending",
        });
        if (error) throw error;
        toast({
          title: "Service record created",
          description: "Service record created successfully.",
        });
        onSuccess?.();
        onClose?.();
        setLoading(false);
        return;
      }
      // --- EDIT MODE ---
      if (!initialRecord) throw new Error("No service record to update");
      const totalCost = form.services.reduce(
        (accSvc, svc) =>
          accSvc +
          svc.items.reduce(
            (acc, item) => acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
            0
          ),
        0
      );
      const { serviceTypeString, allItems } = flattenServicesToFields(form.services);
      const { error } = await supabase
        .from("service_records")
        .update({
          service_type: serviceTypeString,
          description: form.description,
          cost: totalCost,
          mileage: form.mileage ? parseInt(form.mileage) : null,
          labor_hours: null,
          technician_notes: buildTechnicianNotes(
            form.nextOilChangeMileage,
            form.technicianNotes
          ),
          parts_used: allItems as any,
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
        description: err.message || "Failed to save service record.",
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
