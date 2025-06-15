import { useState } from "react";
import { useServiceRecords } from "@/hooks/useServiceRecords";
import { useUnifiedServiceRecords } from "@/hooks/useUnifiedServiceRecords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import ServiceFilters from "./ServiceFilters";
import ServiceRecordCard from "./ServiceRecordCard";
import ServiceRecordEditModal from "./ServiceRecordEditModal";
import ServiceRecordDetailsModal from "./ServiceRecordDetailsModal";
import ServiceHistoryList from "./ServiceHistoryList";
import type { ServiceFilterState, ServiceRecordWithRelations, ServiceStatus } from "@/types/database";

interface ServiceRecordsListProps {
  filter?: 'active' | 'history' | 'all';
  onPdfExport?: (service: ServiceRecordWithRelations) => void;
}

const ServiceRecordsList = ({
  filter = "active",
  onPdfExport,
}: ServiceRecordsListProps) => {
  const {
    updateServiceStatus,
    getServiceRecordById,
    refetch,
  } = useServiceRecords(); 

  // Use unified hook for record/history
  const { serviceRecords, serviceHistory, isLoading } = useUnifiedServiceRecords();

  const [filters, setFilters] = useState<ServiceFilterState>({});

  // Modal/UI state for details & edit
  const [editingService, setEditingService] = useState<ServiceRecordWithRelations | null>(null);
  const [detailsService, setDetailsService] = useState<ServiceRecordWithRelations | null>(null);

  // Refresh list after add/edit modal closes or after updates
  const refreshOnEdit = () => {
    refetch();
    setEditingService(null);
  };

  // Filtering function for active/cancelled
  const filteredActive = serviceRecords.filter((service) => {
    // Apply main filter (active/history/all)
    if (filter === 'active') {
      const activeStatuses: ServiceStatus[] = ['pending', 'in_progress', 'awaiting_approval'];
      if (!activeStatuses.includes(service.status)) return false;
    } else if (filter === 'history') {
      // don't show in this list!
      return false;
    }

    // Apply status filter
    if (filters.status && service.status !== filters.status) return false;

    // Apply service type filter
    if (filters.serviceType && service.service_type !== filters.serviceType) return false;

    // Apply client name filter
    if (filters.clientName) {
      const clientName = service.client?.full_name?.toLowerCase() || '';
      if (!clientName.includes(filters.clientName.toLowerCase())) return false;
    }

    // Apply license plate filter
    if (filters.licensePlate) {
      const licensePlate = service.vehicle?.license_plate?.toLowerCase() || '';
      if (!licensePlate.includes(filters.licensePlate.toLowerCase())) return false;
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const serviceDate = new Date(service.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          const serviceToday = new Date(
            serviceDate.getFullYear(),
            serviceDate.getMonth(),
            serviceDate.getDate()
          );
          if (serviceToday.getTime() !== today.getTime()) return false;
          break;
          
        case 'week':
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          
          if (serviceDate < weekStart || serviceDate > weekEnd) return false;
          break;
          
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          
          if (serviceDate < monthStart || serviceDate > monthEnd) return false;
          break;
      }
    }

    return true;
  });

  // Add history-specific handlers for editing, details, PDF, delete, status
  const {
    deleteServiceHistory,
    isDeletePending,
    updateStatus: updateHistoryStatus,
    isStatusPending,
  } = useServiceHistory();
  const [editingHistory, setEditingHistory] = useState<ServiceRecordWithRelations | null>(null);
  const [detailsHistory, setDetailsHistory] = useState<ServiceRecordWithRelations | null>(null);

  // Filtering for service_history (completed/cancelled)
  const filteredHistory = serviceHistory.filter((record) => {
    // For history: show completed OR cancelled
    if (filter !== "history") return false;
    if (!["completed", "cancelled"].includes(record.status)) return false;

    // Apply serviceType
    if (filters.serviceType && record.service_type !== filters.serviceType) return false;

    // Apply client name (on client)
    if (filters.clientName) {
      const clientName = record.client?.full_name?.toLowerCase() || '';
      if (!clientName.includes(filters.clientName.toLowerCase())) return false;
    }

    // license plate
    if (filters.licensePlate) {
      const licensePlate = record.vehicle?.license_plate?.toLowerCase() || '';
      if (!licensePlate.includes(filters.licensePlate.toLowerCase())) return false;
    }

    // date filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const recordDate = record.completed_at ? new Date(record.completed_at) : new Date(record.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
      switch (filters.dateRange) {
        case 'today': {
          const recordToday = new Date(
            recordDate.getFullYear(),
            recordDate.getMonth(),
            recordDate.getDate()
          );
          if (recordToday.getTime() !== today.getTime()) return false;
          break;
        }
        case 'week': {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          if (recordDate < weekStart || recordDate > weekEnd) return false;
          break;
        }
        case 'month': {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          if (recordDate < monthStart || recordDate > monthEnd) return false;
          break;
        }
      }
    }
    return true;
  });

  // Sort services by date (newest first)
  const sortedActive = [...filteredActive].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    return new Date(b.completed_at ?? b.created_at).getTime() - new Date(a.completed_at ?? a.created_at).getTime();
  });

  const getFilterTitle = () => {
    switch (filter) {
      case 'active': return 'Active Services';
      case 'history': return 'Service History';
      case 'all': return 'All Services';
      default: return 'Services';
    }
  };

  const getFilterDescription = () => {
    switch (filter) {
      case 'active': return 'Services currently in progress or pending';
      case 'history': return 'Completed and cancelled services';
      case 'all': return 'All service records';
      default: return 'Manage your service records';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render for "history"
  if (filter === "history") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Service History
                  <Badge variant="secondary">{sortedHistory.length}</Badge>
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
        {/* Updated ServiceHistoryList for full actions */}
        <ServiceHistoryList
          history={sortedHistory as any}
          onPdfExport={onPdfExport}
        />
      </div>
    );
  }

  // Render for active (default)
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Active Services
                <Badge variant="secondary">{sortedActive.length}</Badge>
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

      {sortedActive.length === 0 ? (
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
          {sortedActive.map((service) => (
            <ServiceRecordCard
              key={service.id}
              service={service}
              onStatusUpdate={updateServiceStatus}
              onPdfExport={onPdfExport}
              onEdit={() => setEditingService(service)}
              onShare={() => {}} // implement if sharing feature
              onViewDetails={(s) => setDetailsService(s)}
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

export default ServiceRecordsList;
