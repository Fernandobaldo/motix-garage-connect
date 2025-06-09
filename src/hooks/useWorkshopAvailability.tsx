
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

interface WorkshopHours {
  [key: string]: {
    start: string;
    end: string;
    isOpen: boolean;
  };
}

export const useWorkshopAvailability = (workshopId: string, selectedDate: Date | undefined) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkshopHours>({});
  const [loading, setLoading] = useState(false);

  // Default working hours if not set
  const defaultWorkingHours: WorkshopHours = {
    monday: { start: '08:00', end: '17:00', isOpen: true },
    tuesday: { start: '08:00', end: '17:00', isOpen: true },
    wednesday: { start: '08:00', end: '17:00', isOpen: true },
    thursday: { start: '08:00', end: '17:00', isOpen: true },
    friday: { start: '08:00', end: '17:00', isOpen: true },
    saturday: { start: '08:00', end: '13:00', isOpen: true },
    sunday: { start: '08:00', end: '13:00', isOpen: false },
  };

  useEffect(() => {
    const fetchWorkshopHours = async () => {
      if (!workshopId) return;

      const { data, error } = await supabase
        .from('workshops')
        .select('working_hours')
        .eq('id', workshopId)
        .single();

      if (error) {
        console.error('Error fetching workshop hours:', error);
        setWorkingHours(defaultWorkingHours);
        return;
      }

      setWorkingHours(data?.working_hours || defaultWorkingHours);
    };

    fetchWorkshopHours();
  }, [workshopId]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !workshopId) {
        setAvailableSlots([]);
        return;
      }

      setLoading(true);

      try {
        const dayName = format(selectedDate, 'EEEE').toLowerCase();
        const dayHours = workingHours[dayName];

        if (!dayHours?.isOpen) {
          setAvailableSlots([]);
          setLoading(false);
          return;
        }

        // Generate time slots for the day
        const slots = generateTimeSlots(dayHours.start, dayHours.end);

        // Fetch existing appointments for the selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('scheduled_at, duration_minutes, id, status')
          .eq('workshop_id', workshopId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .neq('status', 'cancelled');

        if (error) {
          console.error('Error fetching appointments:', error);
          setAvailableSlots(slots.map(time => ({ time, available: true })));
          setLoading(false);
          return;
        }

        // Check which slots are available
        const availableTimeSlots = slots.map(time => {
          const isAvailable = !isSlotOccupied(time, appointments || [], selectedDate);
          const occupyingAppointment = findOccupyingAppointment(time, appointments || [], selectedDate);
          
          return {
            time,
            available: isAvailable,
            appointmentId: occupyingAppointment?.id
          };
        });

        setAvailableSlots(availableTimeSlots);
      } catch (error) {
        console.error('Error checking availability:', error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    checkAvailability();
  }, [selectedDate, workshopId, workingHours]);

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(timeString);

      // Add 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    return slots;
  };

  const isSlotOccupied = (timeSlot: string, appointments: any[], date: Date): boolean => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return appointments.some(apt => {
      const aptStart = new Date(apt.scheduled_at);
      const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 60) * 60000);
      
      // Check if the slot overlaps with the appointment
      const slotEnd = new Date(slotDateTime.getTime() + 30 * 60000); // 30 min slot
      
      return (
        (slotDateTime >= aptStart && slotDateTime < aptEnd) ||
        (slotEnd > aptStart && slotEnd <= aptEnd) ||
        (slotDateTime <= aptStart && slotEnd >= aptEnd)
      );
    });
  };

  const findOccupyingAppointment = (timeSlot: string, appointments: any[], date: Date) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return appointments.find(apt => {
      const aptStart = new Date(apt.scheduled_at);
      const aptEnd = new Date(aptStart.getTime() + (apt.duration_minutes || 60) * 60000);
      
      return slotDateTime >= aptStart && slotDateTime < aptEnd;
    });
  };

  const getServiceDuration = (serviceType: string): number => {
    const serviceDurations: { [key: string]: number } = {
      'oil_change': 30,
      'brake_service': 90,
      'tire_service': 60,
      'engine_diagnostic': 60,
      'transmission_service': 120,
      'ac_service': 60,
      'battery_service': 30,
      'general_maintenance': 60,
      'inspection': 45,
      'repair': 120
    };

    return serviceDurations[serviceType] || 60;
  };

  const isTimeSlotAvailable = (timeSlot: string, serviceType: string): boolean => {
    const slot = availableSlots.find(s => s.time === timeSlot);
    if (!slot?.available) return false;

    const duration = getServiceDuration(serviceType);
    const slotsNeeded = Math.ceil(duration / 30);

    // Check if enough consecutive slots are available
    const slotIndex = availableSlots.findIndex(s => s.time === timeSlot);
    for (let i = 0; i < slotsNeeded; i++) {
      const checkSlot = availableSlots[slotIndex + i];
      if (!checkSlot?.available) return false;
    }

    return true;
  };

  return {
    availableSlots,
    workingHours,
    loading,
    isTimeSlotAvailable,
    getServiceDuration
  };
};
