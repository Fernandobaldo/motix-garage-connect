import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useServiceRecordForm } from "./useServiceRecordForm";
import ServiceRecordForm from "./ServiceRecordForm";
import type { ServiceRecordWithRelations } from "@/types/database";
import { useServiceRecords } from "@/hooks/useServiceRecords";

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
  // Fetch refetch from the service records hook
  const { refetch } = useServiceRecords();

  const handleModalClose = () => {
    onClose();
    // always refetch after closing in case of changes
    refetch();
  };

  const handleSuccess = () => {
    onSuccess?.();
    refetch();
    onClose();
  };

  const { form, setField, loading, handleSubmit } = useServiceRecordForm(
    "edit",
    service,
    handleSuccess,
    handleModalClose
  );

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
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
              onClick={handleModalClose}
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
