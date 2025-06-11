
import { useState } from "react";
import { useAppointmentData } from "./useAppointmentData";
import AppointmentEditModal from "./AppointmentEditModal";
import ServiceReportModal from "./ServiceReportModal";
import AppointmentCard from "./AppointmentCard";
import AppointmentListHeader from "./AppointmentListHeader";
import EmptyAppointmentState from "./EmptyAppointmentState";
import AppointmentLoadingState from "./AppointmentLoadingState";
import { useAppointmentActions } from "./useAppointmentActions";
import { useAppointmentFiltering } from "./useAppointmentFiltering";

interface AppointmentListProps {
  filter?: 'upcoming' | 'history' | 'all';
}

const AppointmentList = ({ filter = 'upcoming' }: AppointmentListProps) => {
  const { appointments, isLoading, refetch } = useAppointmentData();
  const [sortBy, setSortBy] = useState<string>('date');
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [serviceReportAppointmentId, setServiceReportAppointmentId] = useState<string | null>(null);

  const { handleChatClick, handleDelete, handleStatusUpdate } = useAppointmentActions(refetch);
  const sortedAppointments = useAppointmentFiltering(appointments, filter, sortBy);

  const isHistoryView = filter === 'history';

  if (isLoading) {
    return <AppointmentLoadingState />;
  }

  return (
    <div className="space-y-4">
      <AppointmentListHeader 
        filter={filter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

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

export default AppointmentList;
