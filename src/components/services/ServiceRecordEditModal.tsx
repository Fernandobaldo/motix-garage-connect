
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader as AlertDialogHeaderUI, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useServiceRecordForm } from "./useServiceRecordForm";
import ServiceRecordForm from "./ServiceRecordForm";
import type { ServiceRecordWithRelations } from "@/types/database";
import { useServiceRecords } from "@/hooks/useServiceRecords";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  service?: ServiceRecordWithRelations;
  onClose: () => void;
  onSuccess?: () => void;
}

const ServiceRecordEditModal = ({ isOpen, service, onClose, onSuccess }: Props) => {
  const { refetch, refreshRecords, deleteServiceRecord, isDeletePending } = useServiceRecords();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleModalClose = () => {
    onClose();
    refreshRecords?.();
  };

  const handleSuccess = () => {
    onSuccess?.();
    refreshRecords?.();
    onClose();
  };

  const { form, setField, loading, handleSubmit } = useServiceRecordForm(
    "edit",
    service,
    handleSuccess,
    handleModalClose
  );

  // Handler for delete
  const handleDelete = () => {
    if (!service?.id) return;
    deleteServiceRecord(service.id);
    setShowDeleteConfirm(false);
    onClose();
    refreshRecords?.();
  };

  if (!service) return null;

  return (
    <>
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
              onDelete={() => setShowDeleteConfirm(true)}
              isEditMode={true}
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
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeaderUI>
            <AlertDialogTitle>Delete Service Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this service record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeaderUI>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isDeletePending}
              onClick={handleDelete}
            >
              {isDeletePending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ServiceRecordEditModal;

