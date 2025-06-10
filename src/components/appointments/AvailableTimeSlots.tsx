
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle } from 'lucide-react';
import { useGarageAvailability } from '@/hooks/useGarageAvailability';

interface AvailableTimeSlotsProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  garageId: string;
  serviceType: string;
}

const AvailableTimeSlots = ({
  selectedDate,
  selectedTime,
  onTimeChange,
  garageId,
  serviceType,
}: AvailableTimeSlotsProps) => {
  const { availableSlots, loading } = useGarageAvailability(garageId, selectedDate);

  if (!selectedDate) {
    return (
      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
          Please select a date first
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="flex items-center justify-center p-4 border rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
          <span className="text-sm text-gray-600">Loading available times...</span>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <div className="flex items-center text-amber-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">No available times for the selected date. Garage may be closed or fully booked.</span>
          </div>
        </div>
      </div>
    );
  }

  const availableTimes = availableSlots.filter(slot => slot.available);

  if (availableTimes.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">No available times for the selected date. All slots are booked.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Available Times *</Label>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
        {availableTimes.map(({ time }) => (
          <Button
            key={time}
            type="button"
            variant={selectedTime === time ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeChange(time)}
            className="flex items-center justify-center space-x-1"
          >
            <Clock className="h-3 w-3" />
            <span>{time}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        All appointments are scheduled for 1 hour duration. The garage will adjust if needed.
      </p>
    </div>
  );
};

export default AvailableTimeSlots;
