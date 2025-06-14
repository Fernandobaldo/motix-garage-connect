
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <ServiceRecordForm
            form={form}
            setField={setField}
            loading={loading}
          />
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                form.services.length === 0 ||
                !form.services.every(
                  svc =>
                    svc.serviceType.value &&
                    svc.items.length > 0 &&
                    svc.items.every((item) => !!item.name)
                )
              }
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordEditModal;

