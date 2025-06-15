import { useState } from "react";
import { useServiceRecords } from "@/hooks/useServiceRecords";
import { useUnifiedServiceRecords } from "@/hooks/useUnifiedServiceRecords";
import { useServiceHistory } from "@/hooks/useServiceHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import ServiceFilters from "./ServiceFilters";
import ServiceRecordCard from "./ServiceRecordCard";
import ServiceRecordEditModal from "./ServiceRecordEditModal";
import ServiceRecordDetailsModal from "./ServiceRecordDetailsModal";
import ServiceHistoryList from "./ServiceHistoryList";
import type { ServiceFilterState, ServiceRecordWithRelations, ServiceStatus, ServiceHistoryWithRelations } from "@/types/database";
import ServiceRecordsActiveSection from "./ServiceRecordsActiveSection";
import ServiceRecordsHistorySection from "./ServiceRecordsHistorySection";
import { useServiceRecordFilters } from "./useServiceRecordFilters";

interface ServiceRecordsListProps {
  filter?: "active" | "history" | "all";
  // Accept handler for both types, with overload
  onPdfExport?: (
    service: ServiceRecordWithRelations | ServiceHistoryWithRelations
  ) => void;
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

  const { serviceRecords, serviceHistory, isLoading } = useUnifiedServiceRecords();

  // Use refactored filter hook
  const { filters, setFilters } = useServiceRecordFilters();

  // Filtering logic for active services (in component)
  const filteredActive = serviceRecords.filter((service) => {
    if (filter === 'active') {
      const activeStatuses: ServiceStatus[] = ['pending', 'in_progress', 'awaiting_approval'];
      if (!activeStatuses.includes(service.status)) return false;
    } else if (filter === 'history') {
      return false;
    }
    if (filters.status && service.status !== filters.status) return false;
    if (filters.serviceType && service.service_type !== filters.serviceType) return false;
    if (filters.clientName) {
      const clientName = service.client?.full_name?.toLowerCase() || '';
      if (!clientName.includes(filters.clientName.toLowerCase())) return false;
    }
    if (filters.licensePlate) {
      const licensePlate = service.vehicle?.license_plate?.toLowerCase() || '';
      if (!licensePlate.includes(filters.licensePlate.toLowerCase())) return false;
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      const serviceDate = new Date(service.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (filters.dateRange) {
        case 'today': {
          const serviceToday = new Date(serviceDate.getFullYear(), serviceDate.getMonth(), serviceDate.getDate());
          if (serviceToday.getTime() !== today.getTime()) return false;
          break;
        }
        case 'week': {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);
          if (serviceDate < weekStart || serviceDate > weekEnd) return false;
          break;
        }
        case 'month': {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          monthEnd.setHours(23, 59, 59, 999);
          if (serviceDate < monthStart || serviceDate > monthEnd) return false;
          break;
        }
      }
    }
    return true;
  });

  // Filtering logic for history records (in component)
  const filteredHistory = serviceHistory.filter((record) => {
    if (filter !== "history") return false;
    if (!["completed", "cancelled"].includes(record.status)) return false;
    if (filters.serviceType && record.service_type !== filters.serviceType) return false;
    if (filters.clientName) {
      const clientName = record.client?.full_name?.toLowerCase() || '';
      if (!clientName.includes(filters.clientName.toLowerCase())) return false;
    }
    if (filters.licensePlate) {
      const licensePlate = record.vehicle?.license_plate?.toLowerCase() || '';
      if (!licensePlate.includes(filters.licensePlate.toLowerCase())) return false;
    }
    if (filters.dateRange && filters.dateRange !== 'all') {
      const recordDate = record.completed_at ? new Date(record.completed_at) : new Date(record.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      switch (filters.dateRange) {
        case 'today': {
          const recordToday = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
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

  // Sorting
  const sortedActive = [...filteredActive].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const sortedHistory = [...filteredHistory].sort((a, b) =>
    new Date(b.completed_at ?? b.created_at).getTime() - new Date(a.completed_at ?? a.created_at).getTime()
  );

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

  // Routing between history and active
  if (filter === "history") {
    return (
      <ServiceRecordsHistorySection
        historyRecords={sortedHistory}
        filters={filters}
        setFilters={setFilters}
        // Adapt onPdfExport for history, so it always receives a ServiceHistoryWithRelations
        onPdfExport={
          onPdfExport
            ? (record) => onPdfExport(record)
            : undefined
        }
      />
    );
  }
  // Active (default)
  return (
    <ServiceRecordsActiveSection
      activeRecords={sortedActive}
      filters={filters}
      setFilters={setFilters}
      onPdfExport={onPdfExport}
      refetch={refetch}
    />
  );
};

export default ServiceRecordsList;
