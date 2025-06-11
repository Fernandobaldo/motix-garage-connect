
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ServiceReportBasicInfo from "./ServiceReportBasicInfo";
import ServiceReportPartsSection from "./ServiceReportPartsSection";
import { useServiceReport } from "./useServiceReport";
import type { ServiceReportModalProps } from "@/types/database";

const ServiceReportModal = ({ isOpen, onClose, appointmentId, onSuccess }: ServiceReportModalProps) => {
  const {
    formData,
    setFormData,
    partsUsed,
    setPartsUsed,
    loading,
    handleSubmit,
  } = useServiceReport(appointmentId, onSuccess, onClose);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Service Report</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <ServiceReportBasicInfo
            formData={formData}
            onFormDataChange={setFormData}
          />

          <ServiceReportPartsSection
            partsUsed={partsUsed}
            onPartsChange={setPartsUsed}
          />

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.description.trim()}
            >
              {loading ? 'Submitting...' : 'Complete Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceReportModal;
