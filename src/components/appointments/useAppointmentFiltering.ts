
import { useMemo } from 'react';
import type { AppointmentWithRelations } from '@/types/database';
import type { AppointmentFilterState } from './AppointmentFilters';

export const useAppointmentFiltering = (
  appointments: AppointmentWithRelations[],
  filters: AppointmentFilterState
) => {
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    return appointments.filter((appointment) => {
      // Status filter
      if (filters.status && appointment.status !== filters.status) {
        return false;
      }

      // Service type filter
      if (filters.serviceType && appointment.service_type !== filters.serviceType) {
        return false;
      }

      // Client name filter (case-insensitive)
      if (filters.clientName) {
        const clientName = appointment.client?.full_name?.toLowerCase() || '';
        if (!clientName.includes(filters.clientName.toLowerCase())) {
          return false;
        }
      }

      // License plate filter (case-insensitive)
      if (filters.licensePlate) {
        const licensePlate = appointment.vehicle?.license_plate?.toLowerCase() || '';
        if (!licensePlate.includes(filters.licensePlate.toLowerCase())) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const appointmentDate = new Date(appointment.scheduled_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (filters.dateRange) {
          case 'today':
            const appointmentToday = new Date(
              appointmentDate.getFullYear(),
              appointmentDate.getMonth(),
              appointmentDate.getDate()
            );
            if (appointmentToday.getTime() !== today.getTime()) {
              return false;
            }
            break;
            
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            
            if (appointmentDate < weekStart || appointmentDate > weekEnd) {
              return false;
            }
            break;
            
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);
            
            if (appointmentDate < monthStart || appointmentDate > monthEnd) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }, [appointments, filters]);

  const filterStats = useMemo(() => {
    const total = appointments?.length || 0;
    const filtered = filteredAppointments.length;
    const hidden = total - filtered;

    return {
      total,
      filtered,
      hidden,
      hasActiveFilters: Object.values(filters).some(Boolean),
    };
  }, [appointments, filteredAppointments, filters]);

  return {
    filteredAppointments,
    filterStats,
  };
};
