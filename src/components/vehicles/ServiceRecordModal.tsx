
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LicensePlateSearchField from "@/components/common/LicensePlateSearchField";
import ServiceRecordForm from "@/components/services/ServiceRecordForm";
import { useServiceRecordForm } from "@/components/services/useServiceRecordForm";
import type { ServiceRecordWithRelations } from "@/types/database";

/** Display vehicle & client info as a card (read-only) */
function VehicleClientInfoCard({
  vehicle,
  client,
}: {
  vehicle?: any;
  client?: { id: string; name: string; type: "auth" | "guest" } | null;
}) {
  if (!vehicle || !client) return null;
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Vehicle:</span>
            <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">License Plate:</span>
            <Badge variant="outline">{vehicle.license_plate}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Client:</span>
            <div className="flex items-center space-x-2">
              <span>{client.name}</span>
              <Badge variant={client.type === "auth" ? "default" : "secondary"} className="text-xs">
                {client.type === "auth" ? "Account" : "Guest"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** PROPS:
 *  mode: "create" | "edit"
 *  isOpen
 *  onClose
 *  onSuccess
 *  initialRecord? (edit only)
 *  initialVehicleId? (creation only)
 */
const ServiceRecordModal = ({
  isOpen,
  onClose,
  onSuccess,
  mode = "create",
  initialRecord,
  initialVehicleId,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  initialRecord?: ServiceRecordWithRelations;
  initialVehicleId?: string;
}) => {
  // --- Vehicle/Client Selection (CREATE) ---
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; type: "auth" | "guest" } | null>(
    null
  );

  useEffect(() => {
    // Reset on open/close only for create mode
    if (!isOpen && mode === "create") {
      setSelectedVehicle(null);
      setSelectedClient(null);
    }
  }, [isOpen, mode]);

  const handleVehicleSelect = (vehicle: any) => setSelectedVehicle(vehicle);
  const handleClientSelect = (clientId: string, clientName: string, clientType: "auth" | "guest") =>
    setSelectedClient({ id: clientId, name: clientName, type: clientType });

  // --- Unified Form Logic (ServiceRecordForm) ---
  const { form, setField, loading, handleSubmit, setForm } = useServiceRecordForm(
    mode === "edit" ? "edit" : "add",
    mode === "edit" ? initialRecord : undefined,
    onSuccess,
    onClose,
    // Pass selected vehicle and client in create mode only
    mode === "create"
      ? {
          selectedVehicle,
          selectedClient,
        }
      : undefined
  );

  // Wrapper for handleSubmit (CREATE: Block if missing selections)
  const wrappedHandleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create" && (!selectedVehicle || !selectedClient)) {
      // use-toast
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

  // --- Title/desc based on mode
  const isCreate = mode === "create";
  const title = isCreate ? "Create New Service Record" : "Edit Service Record";
  const description = isCreate ? "Add a new service record for a vehicle" : "Edit and update the service record data";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                      type: "auth", // assume edit always uses auth clients for now
                    }
                  : null
              }
            />
          )}
          <ServiceRecordForm
            form={form}
            setField={setField}
            loading={loading}
            onSubmit={wrappedHandleSubmit}
            // TODO: Optionally, pass readOnly/disabled fields if wanted
          />
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                (isCreate && (!selectedVehicle || !selectedClient))
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
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordModal;

