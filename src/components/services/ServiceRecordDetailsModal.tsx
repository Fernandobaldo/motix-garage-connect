import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ServiceRecordWithRelations } from "@/types/database";
import { formatCurrency } from "@/utils/currency";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportServiceRecordToPDF } from "@/utils/serviceRecordPdfExport";

// --- Utilities (copy from useServiceRecordForm) ---

// Parse grouped services from service_type and parts_used fields.
function parseServicesFromRecord(service_type: string, parts_used: any): { serviceType: { value: string }, items: any[] }[] {
  const parts: (any & { serviceType?: string })[] = Array.isArray(parts_used) ? parts_used : [];
  const serviceTypes = service_type
    ? service_type.split(",").map((v) => ({ value: v.trim() }))
    : [{ value: "" }];
  const itemsGrouped: Record<string, any[]> = {};
  let hasTypes = parts.length > 0 && parts.every(p => !!p.serviceType);
  if (hasTypes) {
    for (const p of parts) {
      const tkey = p.serviceType || "";
      if (!itemsGrouped[tkey]) itemsGrouped[tkey] = [];
      const { serviceType, ...rest } = p;
      itemsGrouped[tkey].push(rest);
    }
    return serviceTypes.map(stype => ({
      serviceType: stype,
      items: itemsGrouped[stype.value] || [],
    }));
  } else {
    // Fallback: assign all parts to the first service type.
    if (serviceTypes.length === 1) {
      return [{ serviceType: serviceTypes[0], items: parts }];
    }
    const perSvc = serviceTypes.map((t) => ({
      serviceType: t,
      items: [],
    }));
    if (parts.length > 0) {
      perSvc[0].items = parts;
    }
    return perSvc;
  }
}

// Extract nextOilChangeMileage from technician notes JSON prefix
function extractNextOilChangeMileage(technicianNotes: string | undefined): { nextOilChangeMileage: string, plainNotes: string } {
  if (!technicianNotes) return { nextOilChangeMileage: "", plainNotes: "" };
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

interface Props {
  isOpen: boolean;
  service?: ServiceRecordWithRelations;
  onClose: () => void;
}

const ServiceRecordDetailsModal = ({ isOpen, service, onClose }: Props) => {
  if (!service) return null;

  // Grouped services with items
  const parsedServices = parseServicesFromRecord(service.service_type, service.parts_used);
  // Extracted next oil change and plain notes
  const { nextOilChangeMileage, plainNotes } = extractNextOilChangeMileage(service.technician_notes);

  // Calculate total cost
  const totalCost = parsedServices.reduce(
    (svcTally, svc) => svcTally + svc.items.reduce(
      (itemTally, item) => itemTally + (Number(item.quantity) || 0) * (Number(item.price) || 0),
      0
    ),
    0
  );

  // Handler for PDF export
  const handleExportPDF = () => {
    exportServiceRecordToPDF(service, parsedServices, totalCost, nextOilChangeMileage, plainNotes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div>
            <DialogTitle>Service Record Details</DialogTitle>
            <DialogDescription>Full service, parts, and notes summary</DialogDescription>
          </div>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            size="sm"
            className="ml-auto flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Generate PDF
          </Button>
        </DialogHeader>
        <div className="space-y-5">

          {/* Vehicle & Client */}
          <section className="flex flex-col sm:flex-row sm:gap-8 gap-2 text-sm">
            <div>
              <div><span className="font-semibold">Vehicle:</span> {service.vehicle ? `${service.vehicle.year} ${service.vehicle.make} ${service.vehicle.model}` : "—"}</div>
              <div><span className="font-semibold">License Plate:</span> {service.vehicle?.license_plate || "—"}</div>
            </div>
            <div>
              <div><span className="font-semibold">Client:</span> {service.client?.full_name || "—"}</div>
              {service.client?.phone && (
                <div><span className="font-semibold">Phone:</span> {service.client.phone}</div>
              )}
            </div>
            <div>
              <span className="font-semibold">Status:</span> <Badge>{service.status}</Badge>
            </div>
          </section>

          {/* Services + Items */}
          <section>
            <h3 className="font-semibold text-base mb-2">Services</h3>
            {parsedServices.length === 0 ? (
              <div className="italic text-muted-foreground mb-2">No services found for this record.</div>
            ) : (
              parsedServices.map((svc, idx) => (
                <Fragment key={svc.serviceType.value + idx}>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-medium">{svc.serviceType.value}</Badge>
                    <span className="text-xs text-muted-foreground">{svc.items.length} item{svc.items.length !== 1 ? "s" : ""}</span>
                  </div>
                  {svc.items.length === 0 ? (
                    <div className="ml-4 text-xs text-muted-foreground mb-2">No parts/items listed.</div>
                  ) : (
                    <div className="ml-2 mb-4 overflow-x-auto">
                      <table className="min-w-full text-xs border border-muted rounded">
                        <thead>
                          <tr className="bg-muted">
                            <th className="px-4 py-2 text-left font-normal">Name</th>
                            <th className="px-4 py-2 font-normal">Qty</th>
                            <th className="px-4 py-2 font-normal">Price</th>
                            <th className="px-4 py-2 font-normal">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {svc.items.map((item, j) => (
                            <tr key={item.name + j} className="border-t">
                              <td className="px-4 py-2">{item.name}</td>
                              <td className="px-4 py-2 text-center">{item.quantity}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(Number(item.price))}</td>
                              <td className="px-4 py-2 text-right">{formatCurrency(Number(item.price) * Number(item.quantity))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Fragment>
              ))
            )}
          </section>

          {/* Summary/Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {service.description && (
              <div>
                <div className="font-semibold mb-1">Description</div>
                <div className="bg-muted rounded p-2 text-sm">{service.description}</div>
              </div>
            )}
            <div>
              <div className="font-semibold mb-1">Cost Summary</div>
              <div className="space-y-1 text-sm">
                <div><span className="text-muted-foreground">Calculated Total:</span> <span className="font-medium">{formatCurrency(totalCost)}</span></div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">Mileage</div>
              <div className="text-sm">{service.mileage != null ? service.mileage : "—"}</div>
              {nextOilChangeMileage && (
                <div className="mt-1">
                  <span className="block font-semibold text-xs">Next Oil Change Mileage</span>
                  <span className="text-xs">{nextOilChangeMileage}</span>
                </div>
              )}
            </div>
            {typeof service.labor_hours === "number" && (
              <div>
                <div className="font-semibold mb-1">Labor Hours</div>
                <div className="text-sm">{service.labor_hours}</div>
              </div>
            )}
          </section>

          {/* Technician Notes */}
          <section>
            <div className="font-semibold mb-1">Technician Notes</div>
            <div className="bg-muted rounded p-2 text-sm whitespace-pre-wrap min-h-[30px]">{plainNotes || "—"}</div>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordDetailsModal;

// NOTE: This file is now 200+ lines. It would benefit from being split into smaller files/components. Please consider asking me to refactor this file for better maintainability.
