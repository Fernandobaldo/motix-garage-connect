
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWorkshopAvailability } from '@/hooks/useWorkshopAvailability';

interface AvailableTimeSlotsProps {
  selectedDate: Date | undefined;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  workshopId: string;
  serviceType: string;
}

const AvailableTimeSlots = ({
  selectedDate,
  selectedTime,
  onTimeChange,
  workshopId,
  serviceType,
}: AvailableTimeSlotsProps) => {
  const { availableSlots, loading, isTimeSlotAvailable, getServiceDuration } = useWorkshopAvailability(
    workshopId,
    selectedDate
  );

  if (!selectedDate) {
    return (
      <div>
        <Label>Available Time Slots</Label>
        <p className="text-sm text-gray-500 mt-1">Please select a date first</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Label>Available Time Slots</Label>
        <div className="flex items-center space-x-2 mt-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-gray-500">Checking availability...</span>
        </div>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div>
        <Label>Available Time Slots</Label>
        <div className="flex items-center space-x-2 mt-2 p-3 bg-gray-50 rounded-md">
          <XCircle className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">No available slots for this date</span>
        </div>
      </div>
    );
  }

  const serviceDuration = getServiceDuration(serviceType);

  return (
    <div>
      <Label>Available Time Slots *</Label>
      <p className="text-xs text-gray-500 mb-3">
        {serviceType && `Estimated duration: ${serviceDuration} minutes`}
      </p>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
        {availableSlots.map((slot) => {
          const isAvailable = serviceType ? isTimeSlotAvailable(slot.time, serviceType) : slot.available;
          const isSelected = selectedTime === slot.time;
          
          return (
            <Button
              key={slot.time}
              type="button"
              variant={isSelected ? "default" : "outline"}
              size="sm"
              disabled={!isAvailable}
              onClick={() => onTimeChange(slot.time)}
              className={cn(
                "relative text-xs",
                isSelected && "bg-blue-600 hover:bg-blue-700",
                !isAvailable && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center space-x-1">
                {isAvailable ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                <span>{slot.time}</span>
              </div>
            </Button>
          );
        })}
      </div>
      
      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <XCircle className="h-3 w-3 text-red-500" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default AvailableTimeSlots;
