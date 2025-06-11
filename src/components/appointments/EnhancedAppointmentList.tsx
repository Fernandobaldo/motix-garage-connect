
import { useState } from "react";
import { useAppointmentData } from "./useAppointmentData";
import AppointmentEditModal from "./AppointmentEditModal";
import ServiceReportModal from "./ServiceReportModal";
import AppointmentCard from "./AppointmentCard";
import EmptyAppointmentState from "./EmptyAppointmentState";
import AppointmentLoadingState from "./AppointmentLoadingState";
import AppointmentFilters, { type AppointmentFilterState } from "./AppointmentFilters";
import { useAppointmentActions } from "./useAppointmentActions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isWithinInterval, parseISO } from "date-fns";
import type { AppointmentWithRelations } from "@/types/database";

interface EnhancedAppointmentListProps {
  filter?: 'upcoming' | 'history' | 'all';
}

const EnhancedAppointmentList = ({ filter = 'upcoming' }: EnhancedAppointmentListProps) => {
  const { appointments, isLoading, refetch } = useAppointmentData();
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [serviceReportAppointmentId, setServiceReportAppointmentId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilterState>({});

  const { handleChatClick, handleDelete, handleStatusUpdate } = useAppointmentActions(refetch);

  // Filter appointments based on the main filter and additional filters
  const filteredAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.scheduled_at);
    const now = new Date();

    // Apply main filter (upcoming/history/all)
    if (filter === 'upcoming' && appointmentDate < now) return false;
    if (filter === 'history' && appointmentDate >= now) return false;

    // Apply status filter
    if (filters.status && appointment.status !== filters.status) return false;

    // Apply workshop filter
    if (filters.workshop && appointment.workshop_id !== filters.workshop) return false;

    // Apply service type filter
    if (filters.serviceType && appointment.service_type !== filters.serviceType) return false;

    // Apply date range filter
    if (filters.dateRange?.from) {
      const appointmentDate = parseISO(appointment.scheduled_at);
      const rangeEnd = filters.dateRange.to || filters.dateRange.from;
      
      if (!isWithinInterval(appointmentDate, {
        start: filters.dateRange.from,
        end: rangeEnd
      })) {
        return false;
      }
    }

    return true;
  });

  // Sort appointments by date (newest first for history, soonest first for upcoming)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(a.scheduled_at);
    const dateB = new Date(b.scheduled_at);
    
    if (filter === 'history') {
      return dateB.getTime() - dateA.getTime(); // Newest first
    } else {
      return dateA.getTime() - dateB.getTime(); // Soonest first
    }
  });

  // Get unique workshops for filtering
  const workshops = Array.from(
    new Map(
      appointments
        .filter(apt => apt.workshop)
        .map(apt => [apt.workshop!.id, { id: apt.workshop!.id, name: apt.workshop!.name }])
    ).values()
  );

  const isHistoryView = filter === 'history';

  if (isLoading) {
    return <AppointmentLoadingState />;
  }

  const getFilterTitle = () => {
    switch (filter) {
      case 'upcoming': return 'Active Appointments';
      case 'history': return 'Appointment History';
      case 'all': return 'All Appointments';
      default: return 'Appointments';
    }
  };

  const getFilterDescription = () => {
    switch (filter) {
      case 'upcoming': return 'Your scheduled and confirmed appointments';
      case 'history': return 'Past appointments and service records';
      case 'all': return 'All your appointments across all time';
      default: return 'Manage your appointments';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getFilterTitle()}
                <Badge variant="secondary">{sortedAppointments.length}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getFilterDescription()}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AppointmentFilters
            onFilterChange={setFilters}
            workshops={workshops}
            showWorkshopFilter={workshops.length > 1}
          />
        </CardContent>
      </Card>

      {!sortedAppointments || sortedAppointments.length === 0 ? (
        <EmptyAppointmentState filter={filter} />
      ) : (
        <div className="space-y-4">
          {sortedAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={setEditingAppointment}
              onDelete={handleDelete}
              onServiceReport={setServiceReportAppointmentId}
              onChatClick={handleChatClick}
              onStatusUpdate={handleStatusUpdate}
              isHistoryView={isHistoryView}
            />
          ))}
        </div>
      )}

      <AppointmentEditModal
        appointment={editingAppointment}
        isOpen={!!editingAppointment}
        onClose={() => setEditingAppointment(null)}
        onUpdate={refetch}
      />

      {serviceReportAppointmentId && (
        <ServiceReportModal
          appointmentId={serviceReportAppointmentId}
          isOpen={!!serviceReportAppointmentId}
          onClose={() => setServiceReportAppointmentId(null)}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default EnhancedAppointmentList;
