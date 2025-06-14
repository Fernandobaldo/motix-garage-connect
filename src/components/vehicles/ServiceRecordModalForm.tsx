
import { useState, useEffect } from "react";
import LicensePlateSearchField from "@/components/common/LicensePlateSearchField";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ServiceRecordForm from "@/components/services/ServiceRecordForm";
import { useServiceRecordForm } from "@/components/services/useServiceRecordForm";
import VehicleClientInfoCard from "./VehicleClientInfoCard";
import type { ServiceRecordWithRelations } from "@/types/database";

interface ServiceRecordModalFormProps {
  mode: "create" | "edit";
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialRecord?: ServiceRecordWithRelations;
  initialVehicleId?: string;
}

const ServiceRecordModalForm = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialRecord,
  initialVehicleId
}: ServiceRecordModalFormProps) => {
  // Vehicle/Client selection (only for creation)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; type: "auth" | "guest" } | null>(null);

  useEffect(() => {
    if (!isOpen && mode === "create") {
      setSelectedVehicle(null);
      setSelectedClient(null);
    }
  }, [isOpen, mode]);

  const handleVehicleSelect = (vehicle: any) => setSelectedVehicle(vehicle);
  const handleClientSelect = (clientId: string, clientName: string, clientType: "auth" | "guest") =>
    setSelectedClient({ id: clientId, name: clientName, type: clientType });

  // Form hook
  const { form, setField, loading, handleSubmit, setForm } = useServiceRecordForm(
    mode === "edit" ? "edit" : "add",
    mode === "edit" ? initialRecord : undefined,
    // Updated onSuccess: just close modal, let invalidation handle refresh
    () => {
      onSuccess?.();
      onClose();
    },
    onClose,
    mode === "create"
      ? {
          selectedVehicle,
          selectedClient,
        }
      : undefined,
    isOpen
  );

  // Handle submit wrapper for create mode
  const wrappedHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create" && (!selectedVehicle || !selectedClient)) {
      import("@/hooks/use-toast").then(({ toast }) =>
        toast({
          title: "Missing vehicle/client",
          description: "Please select a vehicle and client before submitting.",
          variant: "destructive",
        })
      );
      return;
    }
    handleSubmit(e);
  };

  // Titles
  const isCreate = mode === "create";
  const title = isCreate ? "Create New Service Record" : "Edit Service Record";
  const description = isCreate ? "Add a new service record for a vehicle" : "Edit and update the service record data";

  // Handler for "Delete" (discard) in create mode — just close the modal (form is unsaved)
  const handleDelete = () => {
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <form onSubmit={wrappedHandleSubmit} className="space-y-6">
        {isCreate ? (
          <>
            <LicensePlateSearchField
              label="Search Vehicle by License Plate"
              placeholder="Enter license plate to find vehicle and client..."
              onVehicleSelect={handleVehicleSelect}
              onClientSelect={handleClientSelect}
              required
            />
            {selectedVehicle && selectedClient && (
              <VehicleClientInfoCard
                vehicle={selectedVehicle}
                client={selectedClient}
              />
            )}
          </>
        ) : (
          <VehicleClientInfoCard
            vehicle={initialRecord?.vehicle}
            client={
              initialRecord?.client
                ? {
                    id: initialRecord.client.id,
                    name: initialRecord.client.full_name,
                    type: "auth",
                  }
                : null
            }
          />
        )}
        <ServiceRecordForm
          form={form}
          setField={setField}
          loading={loading}
          onDelete={isCreate ? handleDelete : undefined}
          isEditMode={!isCreate}
        />
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              loading ||
              (isCreate && (!selectedVehicle || !selectedClient)) ||
              (form.services.length === 0 ||
                !form.services.every(
                  svc =>
                    svc.serviceType.value &&
                    svc.items.length > 0 &&
                    svc.items.every((item) => !!item.name)
                ))
            }
          >
            {loading
              ? isCreate
                ? "Creating..."
                : "Saving..."
              : isCreate
              ? "Create Service Record"
              : "Save Changes"}
          </Button>
        </div>
      </form>
    </>
  );
};

export default ServiceRecordModalForm;
