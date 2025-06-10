
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

interface GarageHours {
  [key: string]: {
    start: string;
    end: string;
    isOpen: boolean;
  };
}

export const useGarageAvailability = (garageId: string, selectedDate: Date | undefined) => {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [workingHours, setWorkingHours] = useState<GarageHours>({});
  const [loading, setLoading] = useState(false);

  // Default working hours if not set
  const defaultWorkingHours: GarageHours = {
    monday: { start: '08:00', end: '17:00', isOpen: true },
    tuesday: { start: '08:00', end: '17:00', isOpen: true },
    wednesday: { start: '08:00', end: '17:00', isOpen: true },
    thursday: { start: '08:00', end: '17:00', isOpen: true },
    friday: { start: '08:00', end: '17:00', isOpen: true },
    saturday: { start: '08:00', end: '13:00', isOpen: true },
    sunday: { start: '08:00', end: '13:00', isOpen: false },
  };

  useEffect(() => {
    const fetchGarageHours = async () => {
      if (!garageId) return;

      const { data, error } = await supabase
        .from('workshops')
        .select('working_hours')
        .eq('id', garageId)
        .single();

      if (error) {
        console.error('Error fetching garage hours:', error);
        setWorkingHours(defaultWorkingHours);
        return;
      }

      // Properly handle the JSON data and ensure type safety
      const hours = data?.working_hours;
      if (hours && typeof hours === 'object' && !Array.isArray(hours)) {
        setWorkingHours(hours as GarageHours);
      } else {
        setWorkingHours(defaultWorkingHours);
      }
    };

    fetchGarageHours();
  }, [garageId]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !garageId) {
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
          .eq('workshop_id', garageId)
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
  }, [selectedDate, garageId, workingHours]);

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

  const isTimeSlotAvailable = (timeSlot: string): boolean => {
    const slot = availableSlots.find(s => s.time === timeSlot);
    return slot?.available || false;
  };

  return {
    availableSlots,
    workingHours,
    loading,
    isTimeSlotAvailable
  };
};
