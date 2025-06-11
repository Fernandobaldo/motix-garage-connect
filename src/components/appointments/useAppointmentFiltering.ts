
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
        // Show appointments that are pending, confirmed, or in_progress
        // Exclude completed and cancelled appointments regardless of date
        const isActiveStatus = apt.status === 'pending' || apt.status === 'confirmed' || apt.status === 'in_progress';
        const result = isActiveStatus;
        console.log('Upcoming filter for appointment:', apt.id, 'scheduled:', scheduledDate, 'status:', apt.status, 'result:', result);
        return result;
      } else if (filter === 'history') {
        // Show completed, cancelled appointments, or past appointments
        const isFinishedStatus = apt.status === 'completed' || apt.status === 'cancelled';
        const isPastAndNotActive = scheduledDate < now && apt.status !== 'pending' && apt.status !== 'confirmed' && apt.status !== 'in_progress';
        const result = isFinishedStatus || isPastAndNotActive;
        console.log('History filter for appointment:', apt.id, 'scheduled:', scheduledDate, 'status:', apt.status, 'result:', result);
        return result;
      }
      return true; // 'all' filter
    });

    console.log('Filtered result:', filtered.length, 'appointments for filter:', filter);
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
          if (filter === 'upcoming') {
            return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
          } else {
            return new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime();
          }
      }
    });
  }, [filteredAppointments, sortBy, filter]);

  return sortedAppointments;
};
