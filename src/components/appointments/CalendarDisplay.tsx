
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Appointment } from './types';

interface CalendarDisplayProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
}

const CalendarDisplay = ({ selectedDate, onDateSelect, appointments }: CalendarDisplayProps) => {
  // Get days with appointments for calendar highlighting
  const getDaysWithAppointments = () => {
    const daysWithAppointments = new Set();
    appointments.forEach(apt => {
      const date = new Date(apt.scheduled_at);
      daysWithAppointments.add(format(date, 'yyyy-MM-dd'));
    });
    return daysWithAppointments;
  };

  const daysWithAppointments = getDaysWithAppointments();

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className={cn("w-full pointer-events-auto")}
          modifiers={{
            hasAppointment: (date) => daysWithAppointments.has(format(date, 'yyyy-MM-dd'))
          }}
          modifiersStyles={{
            hasAppointment: {
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontWeight: 'bold'
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CalendarDisplay;
