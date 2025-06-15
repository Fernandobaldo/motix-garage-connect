
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ServiceFilters from "./ServiceFilters";
import ServiceHistoryList from "./ServiceHistoryList";
import type { ServiceHistoryWithRelations, ServiceFilterState } from "@/types/database";

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
        onPdfExport={onPdfExport}
      />
    </div>
  );
};

export default ServiceRecordsHistorySection;
