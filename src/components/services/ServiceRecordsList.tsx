
import { useState } from "react";
import { useServiceRecords } from "@/hooks/useServiceRecords";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import ServiceFilters from "./ServiceFilters";
import ServiceRecordCard from "./ServiceRecordCard";
import type { ServiceFilterState, ServiceRecordWithRelations, ServiceStatus } from "@/types/database";

interface ServiceRecordsListProps {
  filter?: 'active' | 'history' | 'all';
  onCreateNew?: () => void;
  onPdfExport?: (service: ServiceRecordWithRelations) => void;
}

const ServiceRecordsList = ({ 
  filter = 'active', 
  onCreateNew,
  onPdfExport 
}: ServiceRecordsListProps) => {
  const { serviceRecords, isLoading, updateServiceStatus } = useServiceRecords();
  const [filters, setFilters] = useState<ServiceFilterState>({});

  // Filter services based on the main filter and additional filters
  const filteredServices = serviceRecords.filter((service) => {
    // Apply main filter (active/history/all)
    if (filter === 'active') {
      const activeStatuses: ServiceStatus[] = ['pending', 'in_progress', 'awaiting_approval'];
      if (!activeStatuses.includes(service.status)) return false;
    } else if (filter === 'history') {
      const historyStatuses: ServiceStatus[] = ['completed', 'cancelled'];
      if (!historyStatuses.includes(service.status)) return false;
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

  // Sort services by date (newest first)
  const sortedServices = [...filteredServices].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getFilterTitle()}
                <Badge variant="secondary">{sortedServices.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getFilterDescription()}
              </p>
            </div>
            {onCreateNew && (
              <Button onClick={onCreateNew} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Service
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ServiceFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </CardContent>
      </Card>

      {sortedServices.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="text-lg font-medium">No services found</h3>
                <p className="text-muted-foreground">
                  {filter === 'active' 
                    ? "No active services at the moment"
                    : filter === 'history'
                    ? "No service history available"
                    : "No services created yet"
                  }
                </p>
              </div>
              {onCreateNew && filter === 'active' && (
                <Button onClick={onCreateNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Service
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedServices.map((service) => (
            <ServiceRecordCard
              key={service.id}
              service={service}
              onStatusUpdate={updateServiceStatus}
              onPdfExport={onPdfExport}
              isHistoryView={filter === 'history'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServiceRecordsList;
