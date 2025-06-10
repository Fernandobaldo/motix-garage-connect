
import { useMemo } from 'react';

export const useAppointmentFiltering = (appointments: any[], filter: 'upcoming' | 'history' | 'all', sortBy: string) => {
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const scheduledDate = new Date(apt.scheduled_at);
      const now = new Date();
      
      if (filter === 'upcoming') {
        return scheduledDate > now && apt.status !== 'cancelled' && apt.status !== 'completed';
      } else if (filter === 'history') {
        return scheduledDate <= now || apt.status === 'completed' || apt.status === 'cancelled';
      }
      return true; // 'all' filter
    });
  }, [appointments, filter]);

  const sortedAppointments = useMemo(() => {
    return filteredAppointments?.sort((a, b) => {
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
          return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
      }
    });
  }, [filteredAppointments, sortBy]);

  return sortedAppointments;
};
