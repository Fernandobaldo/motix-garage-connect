import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ServiceFilters from "./ServiceFilters";
import ServiceHistoryList from "./ServiceHistoryList";
import type { ServiceHistoryWithRelations, ServiceFilterState } from "@/types/database";
import { useWorkshop } from "@/hooks/useWorkshop";
import { useWorkshopPreferences } from "@/hooks/useWorkshopPreferences";
import { exportServiceRecordToPDF } from "@/utils/serviceRecordPdfExport";

interface Props {
  historyRecords: ServiceHistoryWithRelations[];
  filters: ServiceFilterState;
  setFilters: (filters: ServiceFilterState) => void;
  onPdfExport?: (service: ServiceHistoryWithRelations) => void;
}

const ServiceRecordsHistorySection = ({
  historyRecords,
  filters,
  setFilters,
  onPdfExport,
}: Props) => {
  const { preferences } = useWorkshopPreferences();
  const { workshop } = useWorkshop();

  const handlePdfExport = (service: any) => {
    // Parse grouped services as in ActiveSection
    const serviceTypeStr = service.service_type;
    const parts = Array.isArray(service.parts_used) ? service.parts_used : [];
    const serviceTypes = typeof serviceTypeStr === 'string'
      ? serviceTypeStr.split(",").map((v) => ({ value: v.trim() })) :
      [{ value: "" }];
    let hasTypes = parts.length > 0 && parts.every(p => !!p.serviceType);
    let parsedServices = [];
    if (hasTypes) {
      const itemsGrouped: Record<string, any[]> = {};
      for (const p of parts) {
        const tkey = p.serviceType || "";
        if (!itemsGrouped[tkey]) itemsGrouped[tkey] = [];
        const { serviceType, ...rest } = p;
        itemsGrouped[tkey].push(rest);
      }
      parsedServices = serviceTypes.map(stype => ({
        serviceType: stype,
        items: itemsGrouped[stype.value] || [],
      }));
    } else {
      if (serviceTypes.length === 1) {
        parsedServices = [{ serviceType: serviceTypes[0], items: parts }];
      } else {
        const perSvc = serviceTypes.map((t) => ({
          serviceType: t,
          items: [],
        }));
        if (parts.length > 0) {
          perSvc[0].items = parts;
        }
        parsedServices = perSvc;
      }
    }
    let nextOilChangeMileage = "";
    let plainNotes = "";
    if (service.technician_notes && service.technician_notes.startsWith("{")) {
      try {
        const endIdx = service.technician_notes.indexOf("}\n");
        if (endIdx !== -1) {
          const jsonBlob = service.technician_notes.slice(0, endIdx + 1);
          const parsed = JSON.parse(jsonBlob);
          nextOilChangeMileage = parsed.nextOilChangeMileage ?? "";
          plainNotes = service.technician_notes.slice(endIdx + 2) || "";
        }
      } catch { plainNotes = service.technician_notes; }
    } else {
      plainNotes = service.technician_notes || "";
    }
    const totalCost = parsedServices.reduce(
      (svcTally, svc) => svcTally + svc.items.reduce(
        (itemTally, item) => itemTally + (Number(item.quantity) || 0) * (Number(item.price) || 0),
        0
      ),
      0
    );
    exportServiceRecordToPDF(
      service,
      parsedServices,
      totalCost,
      nextOilChangeMileage,
      plainNotes,
      workshop ? {
        name: workshop.name,
        address: workshop.address,
        phone: workshop.phone,
        email: workshop.email
      } : undefined,
      preferences
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Service History
                <Badge variant="secondary">{historyRecords.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Completed and cancelled services
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ServiceFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>
      <ServiceHistoryList
        history={historyRecords}
        onPdfExport={onPdfExport ? onPdfExport : handlePdfExport}
      />
    </div>
  );
};

export default ServiceRecordsHistorySection;
