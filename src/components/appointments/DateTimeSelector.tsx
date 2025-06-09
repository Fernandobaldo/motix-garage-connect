
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import AvailableTimeSlots from './AvailableTimeSlots';
import ServiceDurationSelector from './ServiceDurationSelector';

interface DateTimeSelectorProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  duration: string;
  onDurationChange: (duration: string) => void;
  workshopId: string;
  serviceType: string;
}

const DateTimeSelector = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  duration,
  onDurationChange,
  workshopId,
  serviceType,
}: DateTimeSelectorProps) => {
  return (
    <>
      <div>
        <Label>Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateChange}
              disabled={(date) => date < new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <ServiceDurationSelector
        serviceType={serviceType}
        duration={duration}
        onDurationChange={onDurationChange}
      />

      <AvailableTimeSlots
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onTimeChange={onTimeChange}
        workshopId={workshopId}
        serviceType={serviceType}
      />
    </>
  );
};

export default DateTimeSelector;
