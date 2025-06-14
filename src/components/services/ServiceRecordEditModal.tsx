import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useServiceRecordForm } from "./useServiceRecordForm";
import ServiceRecordForm from "./ServiceRecordForm";
import type { ServiceRecordWithRelations } from "@/types/database";

interface Props {
  isOpen: boolean;
  service?: ServiceRecordWithRelations;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * This modal now uses the same full-featured service form as "Add New Service"
 * and pre-populates all fields for editing.
 */
const ServiceRecordEditModal = ({ isOpen, service, onClose, onSuccess }: Props) => {
  const { form, setField, loading, handleSubmit } = useServiceRecordForm(
    "edit",
    service,
    onSuccess,
    onClose
  );

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Record</DialogTitle>
        </DialogHeader>
        <ServiceRecordForm
          form={form}
          setField={setField}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordEditModal;
