
import { useMemo } from 'react';

export const useAppointmentFiltering = (appointments: any[], filter: 'upcoming' | 'history' | 'all', sortBy: string) => {
  const filteredAppointments = useMemo(() => {
    console.log('Filtering appointments:', appointments?.length || 0, 'with filter:', filter);
    
    if (!appointments || appointments.length === 0) {
      console.log('No appointments to filter');
      return [];
    }

    const filtered = appointments.filter(apt => {
      const scheduledDate = new Date(apt.scheduled_at);
      const now = new Date();
      
      if (filter === 'upcoming') {
        // Show pending, confirmed, and in_progress appointments that are scheduled for today or future
        const isUpcoming = scheduledDate >= now || apt.status === 'confirmed' || apt.status === 'in_progress';
        const isNotCompleted = apt.status !== 'cancelled' && apt.status !== 'completed';
        const result = isUpcoming && isNotCompleted;
        console.log('Upcoming filter for appointment:', apt.id, 'scheduled:', scheduledDate, 'status:', apt.status, 'result:', result);
        return result;
      } else if (filter === 'history') {
        // Show completed, cancelled appointments, or past appointments
        const isPast = scheduledDate < now;
        const isFinished = apt.status === 'completed' || apt.status === 'cancelled';
        const result = isPast || isFinished;
        console.log('History filter for appointment:', apt.id, 'scheduled:', scheduledDate, 'status:', apt.status, 'result:', result);
        return result;
      }
      return true; // 'all' filter
    });

    console.log('Filtered result:', filtered.length, 'appointments');
    return filtered;
  }, [appointments, filter]);

  const sortedAppointments = useMemo(() => {
    if (!filteredAppointments || filteredAppointments.length === 0) {
      return [];
    }

    return [...filteredAppointments].sort((a, b) => {
      switch (sortBy) {
        case 'status':
          return a.status.localeCompare(b.status);
        case 'garage':
          return (a.workshop?.name || '').localeCompare(b.workshop?.name || '');
        case 'vehicle':
          const aVehicle = a.vehicle ? `${a.vehicle.make} ${a.vehicle.model}` : '';
          const bVehicle = b.vehicle ? `${b.vehicle.make} ${b.vehicle.model}` : '';
          return aVehicle.localeCompare(bVehicle);
        case 'date':
        default:
          // For upcoming appointments, show earliest first
          // For history, show most recent first
          if (filteredAppointments.some(apt => {
            const scheduledDate = new Date(apt.scheduled_at);
            const now = new Date();
            return scheduledDate >= now && apt.status !== 'cancelled' && apt.status !== 'completed';
          })) {
            return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
          } else {
            return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
          }
      }
    });
  }, [filteredAppointments, sortBy]);

  return sortedAppointments;
};
