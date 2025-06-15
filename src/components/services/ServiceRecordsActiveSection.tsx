
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
              onPdfExport={onPdfExport}
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
