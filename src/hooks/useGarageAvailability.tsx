
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
      if (!garageId) {
        console.log('❌ No garageId provided');
        return;
      }

      console.log('🔍 Fetching garage hours for garageId:', garageId);

      const { data, error } = await supabase
        .from('workshops')
        .select('working_hours, name')
        .eq('id', garageId)
        .single();

      if (error) {
        console.error('❌ Error fetching garage hours:', error);
        console.log('📝 Using default working hours');
        setWorkingHours(defaultWorkingHours);
        return;
      }

      console.log('✅ Garage data fetched:', data);

      // Properly handle the JSON data and ensure type safety
      const hours = data?.working_hours;
      if (hours && typeof hours === 'object' && !Array.isArray(hours)) {
        console.log('✅ Working hours from database:', hours);
        setWorkingHours(hours as GarageHours);
      } else {
        console.log('📝 No working hours in database, using defaults');
        setWorkingHours(defaultWorkingHours);
      }
    };

    fetchGarageHours();
  }, [garageId]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !garageId) {
        console.log('❌ Missing required data - selectedDate:', !!selectedDate, 'garageId:', !!garageId);
        setAvailableSlots([]);
        return;
      }

      setLoading(true);
      console.log('🔍 Checking availability for date:', selectedDate.toDateString());

      try {
        const dayName = format(selectedDate, 'EEEE').toLowerCase();
        console.log('📅 Day name:', dayName);
        
        const dayHours = workingHours[dayName];
        console.log('🕒 Day hours:', dayHours);

        if (!dayHours?.isOpen) {
          console.log('❌ Garage is closed on', dayName);
          setAvailableSlots([]);
          setLoading(false);
          return;
        }

        // Generate time slots for the day
        const slots = generateTimeSlots(dayHours.start, dayHours.end);
        console.log('🕒 Generated time slots:', slots);

        // Fetch existing appointments for the selected date
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        console.log('🔍 Fetching appointments between:', startOfDay.toISOString(), 'and', endOfDay.toISOString());

        const { data: appointments, error } = await supabase
          .from('appointments')
          .select('scheduled_at, duration_minutes, id, status')
          .eq('workshop_id', garageId)
          .gte('scheduled_at', startOfDay.toISOString())
          .lte('scheduled_at', endOfDay.toISOString())
          .neq('status', 'cancelled');

        if (error) {
          console.error('❌ Error fetching appointments:', error);
          setAvailableSlots(slots.map(time => ({ time, available: true })));
          setLoading(false);
          return;
        }

        console.log('✅ Existing appointments:', appointments);

        // Check which slots are available
        const availableTimeSlots = slots.map(time => {
          const isAvailable = !isSlotOccupied(time, appointments || [], selectedDate);
          const occupyingAppointment = findOccupyingAppointment(time, appointments || [], selectedDate);
          
          console.log(`🕒 Slot ${time}: available=${isAvailable}`, occupyingAppointment ? `(blocked by ${occupyingAppointment.id})` : '');
          
          return {
            time,
            available: isAvailable,
            appointmentId: occupyingAppointment?.id
          };
        });

        console.log('✅ Final available slots:', availableTimeSlots);
        setAvailableSlots(availableTimeSlots);
      } catch (error) {
        console.error('❌ Error checking availability:', error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    // Only check availability if we have working hours
    if (Object.keys(workingHours).length > 0) {
      checkAvailability();
    }
  }, [selectedDate, garageId, workingHours]);

  const generateTimeSlots = (startTime: string, endTime: string): string[] => {
    console.log('🔧 Generating slots from', startTime, 'to', endTime);
    
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

    console.log('✅ Generated slots:', slots);
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
      
      const overlaps = (
        (slotDateTime >= aptStart && slotDateTime < aptEnd) ||
        (slotEnd > aptStart && slotEnd <= aptEnd) ||
        (slotDateTime <= aptStart && slotEnd >= aptEnd)
      );
      
      if (overlaps) {
        console.log(`⚠️ Slot ${timeSlot} overlaps with appointment ${apt.id} (${new Date(apt.scheduled_at).toLocaleTimeString()} - ${aptEnd.toLocaleTimeString()})`);
      }
      
      return overlaps;
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
