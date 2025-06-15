import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import ServiceFilters from "./ServiceFilters";
import ServiceRecordCard from "./ServiceRecordCard";
import ServiceRecordEditModal from "./ServiceRecordEditModal";
import ServiceRecordDetailsModal from "./ServiceRecordDetailsModal";
import { useState } from "react";
import type { ServiceRecordWithRelations, ServiceFilterState, ServiceStatus } from "@/types/database";
import { useServiceRecords } from "@/hooks/useServiceRecords";
import { useWorkshop } from "@/hooks/useWorkshop";
import { useWorkshopPreferences } from "@/hooks/useWorkshopPreferences";
import { exportServiceRecordToPDF } from "@/utils/serviceRecordPdfExport";

interface Props {
  activeRecords: ServiceRecordWithRelations[];
  filters: ServiceFilterState;
  setFilters: (filters: ServiceFilterState) => void;
  onPdfExport?: (service: ServiceRecordWithRelations) => void;
  refetch: () => void;
}

const ServiceRecordsActiveSection = ({
  activeRecords,
  filters,
  setFilters,
  onPdfExport,
  refetch,
}: Props) => {
  const [editingService, setEditingService] = useState<ServiceRecordWithRelations | null>(null);
  const [detailsService, setDetailsService] = useState<ServiceRecordWithRelations | null>(null);
  const { updateServiceStatus } = useServiceRecords();
  const { preferences } = useWorkshopPreferences();
  const { workshop } = useWorkshop();

  const handlePdfExport = (service: any) => {
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

  const refreshOnEdit = () => {
    refetch();
    setEditingService(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Active Services
                <Badge variant="secondary">{activeRecords.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Services currently in progress or pending
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
      {activeRecords.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No services found</h3>
                <p className="text-muted-foreground">
                  No active services at the moment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeRecords.map((service) => (
            <ServiceRecordCard
              key={service.id}
              service={service}
              onStatusUpdate={updateServiceStatus}
              onPdfExport={onPdfExport ? onPdfExport : handlePdfExport}
              onEdit={() => setEditingService(service)}
              onShare={() => {}}
              onViewDetails={() => setDetailsService(service)}
              isHistoryView={false}
            />
          ))}
        </div>
      )}
      <ServiceRecordEditModal
        isOpen={!!editingService}
        service={editingService!}
        onClose={refreshOnEdit}
        onSuccess={refreshOnEdit}
      />
      <ServiceRecordDetailsModal
        isOpen={!!detailsService}
        service={detailsService!}
        onClose={() => setDetailsService(null)}
      />
    </div>
  );
};

export default ServiceRecordsActiveSection;
