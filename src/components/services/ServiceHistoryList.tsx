
import { useState } from "react";
import ServiceRecordCard from "./ServiceRecordCard";
import ServiceRecordDetailsModal from "./ServiceRecordDetailsModal";
import ServiceRecordEditModal from "./ServiceRecordEditModal";
import { useServiceHistory } from "@/hooks/useServiceHistory";
import type { ServiceHistoryWithRelations, ServiceStatus } from "@/types/database";

interface ServiceHistoryListProps {
  history: ServiceHistoryWithRelations[];
  onPdfExport?: (record: ServiceHistoryWithRelations) => void;
}

const ServiceHistoryList = ({
  history,
  onPdfExport,
}: ServiceHistoryListProps) => {
  const {
    deleteServiceHistory,
    isDeletePending,
    updateStatus,
    isStatusPending,
  } = useServiceHistory();

  const [editingRecord, setEditingRecord] = useState<ServiceHistoryWithRelations | null>(null);
  const [detailsRecord, setDetailsRecord] = useState<ServiceHistoryWithRelations | null>(null);

  // For modals: refresh state on edit
  const refreshOnEdit = () => {
    setEditingRecord(null);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border rounded bg-muted">
        <span className="text-muted-foreground mb-4">No completed or cancelled history records found.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <ServiceRecordCard
          key={record.id}
          service={record as any} // Accept the shape mismatch for now, since both have similar props
          onStatusUpdate={(id, status) => updateStatus({ id, status } as any)}
          onEdit={() => setEditingRecord(record)}
          onPdfExport={onPdfExport ? (() => onPdfExport(record)) : undefined}
          onShare={() => {}}
          onViewDetails={() => setDetailsRecord(record)}
          isHistoryView={true}
        />
      ))}
      {/* Modals */}
      <ServiceRecordEditModal
        isOpen={!!editingRecord}
        service={editingRecord as any}
        onClose={refreshOnEdit}
        onSuccess={refreshOnEdit}
      />
      <ServiceRecordDetailsModal
        isOpen={!!detailsRecord}
        service={detailsRecord as any}
        onClose={() => setDetailsRecord(null)}
      />
    </div>
  );
};

export default ServiceHistoryList;

