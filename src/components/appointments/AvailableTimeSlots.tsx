
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, Info } from 'lucide-react';
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
  const { availableSlots, loading, workingHours } = useGarageAvailability(garageId, selectedDate);

  // Debug log the props
  console.log('🔍 AvailableTimeSlots props:', {
    selectedDate: selectedDate?.toDateString(),
    garageId,
    serviceType,
    availableSlotsCount: availableSlots.length
  });

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

  if (!garageId) {
    return (
      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span className="text-sm">No garage selected. Please select a garage first.</span>
          </div>
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

  // Check if garage is closed on selected day
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const dayHours = workingHours[dayName];
  
  if (dayHours && !dayHours.isOpen) {
    return (
      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
          <div className="flex items-center text-amber-700">
            <Info className="h-4 w-4 mr-2" />
            <span className="text-sm">Garage is closed on {dayName}s.</span>
          </div>
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
            <div className="text-sm">
              <p>No time slots generated for the selected date.</p>
              <p className="mt-1 text-xs">
                Expected hours: {dayHours ? `${dayHours.start} - ${dayHours.end}` : 'Not configured'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availableTimes = availableSlots.filter(slot => slot.available);

  if (availableTimes.length === 0) {
    const bookedSlots = availableSlots.filter(slot => !slot.available);
    return (
      <div className="space-y-2">
        <Label>Available Times</Label>
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center text-red-700">
            <AlertCircle className="h-4 w-4 mr-2" />
            <div className="text-sm">
              <p>All time slots are booked for the selected date.</p>
              <p className="mt-1 text-xs">
                Total slots: {availableSlots.length}, Booked: {bookedSlots.length}
              </p>
            </div>
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
      <p className="text-xs text-gray-400">
        Available: {availableTimes.length} / {availableSlots.length} slots
      </p>
    </div>
  );
};

export default AvailableTimeSlots;
