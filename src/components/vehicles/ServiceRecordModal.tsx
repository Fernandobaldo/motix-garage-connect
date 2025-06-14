
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ServiceRecordModalForm from "./ServiceRecordModalForm";
import type { ServiceRecordWithRelations } from "@/types/database";

/**
 * The main ServiceRecordModal (for create/edit).
 * Delegates modal/close/props logic, and all form UI/logic is delegated to ServiceRecordModalForm.
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <ServiceRecordModalForm
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={onSuccess}
          mode={mode}
          initialRecord={initialRecord}
          initialVehicleId={initialVehicleId}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordModal;
