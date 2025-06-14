
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ServiceRecordWithRelations } from "@/types/database";

interface Props {
  isOpen: boolean;
  service?: ServiceRecordWithRelations;
  onClose: () => void;
}

const ServiceRecordDetailsModal = ({ isOpen, service, onClose }: Props) => {
  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Service Record Details</DialogTitle>
          <DialogDescription>
            {service.service_type}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div><strong>Vehicle:</strong> {service.vehicle ? `${service.vehicle.year} ${service.vehicle.make} ${service.vehicle.model}` : "—"}</div>
          <div><strong>License Plate:</strong> {service.vehicle?.license_plate || "—"}</div>
          <div><strong>Client:</strong> {service.client?.full_name || "—"}</div>
          <div><strong>Status:</strong> <Badge>{service.status}</Badge></div>
          <div><strong>Description:</strong> {service.description || "—"}</div>
          <div><strong>Cost:</strong> {service.cost != null ? `$${service.cost}` : "—"}</div>
          <div><strong>Mileage:</strong> {service.mileage || "—"}</div>
          <div><strong>Labor Hours:</strong> {service.labor_hours || "—"}</div>
          <div><strong>Parts Used:</strong>
            {service.parts_used && (service.parts_used as any[]).length > 0
              ? (service.parts_used as any[]).map((p, i) => <span key={i} className="mr-2">{p.name}</span>)
              : "—"}
          </div>
          <div><strong>Technician Notes:</strong> {service.technician_notes || "—"}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ServiceRecordDetailsModal;
