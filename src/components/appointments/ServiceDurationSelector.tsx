
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';

interface ServiceDurationSelectorProps {
  serviceType: string;
  duration: string;
  onDurationChange: (duration: string) => void;
}

const ServiceDurationSelector = ({
  serviceType,
  duration,
  onDurationChange,
}: ServiceDurationSelectorProps) => {
  // Get suggested duration based on service type
  const getServiceDurations = (service: string) => {
    const durations: { [key: string]: { default: string; options: string[] } } = {
      'oil_change': { default: '30', options: ['30', '45'] },
      'brake_service': { default: '90', options: ['60', '90', '120'] },
      'tire_service': { default: '60', options: ['45', '60', '90'] },
      'engine_diagnostic': { default: '60', options: ['45', '60', '90', '120'] },
      'transmission_service': { default: '120', options: ['90', '120', '180'] },
      'ac_service': { default: '60', options: ['45', '60', '90'] },
      'battery_service': { default: '30', options: ['30', '45', '60'] },
      'general_maintenance': { default: '60', options: ['45', '60', '90', '120'] },
      'inspection': { default: '45', options: ['30', '45', '60'] },
      'repair': { default: '120', options: ['60', '90', '120', '180', '240'] }
    };

    return durations[service] || { default: '60', options: ['30', '60', '90', '120', '180'] };
  };

  const serviceDurations = getServiceDurations(serviceType);

  // Set default duration when service type changes
  if (serviceType && duration === '60' && serviceDurations.default !== '60') {
    onDurationChange(serviceDurations.default);
  }

  const formatDuration = (minutes: string) => {
    const mins = parseInt(minutes);
    if (mins < 60) return `${mins} minutes`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${remainingMins}m`;
  };

  return (
    <div>
      <Label htmlFor="duration">Estimated Duration *</Label>
      <Select value={duration} onValueChange={onDurationChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select duration" />
        </SelectTrigger>
        <SelectContent>
          {serviceDurations.options.map((minutes) => (
            <SelectItem key={minutes} value={minutes}>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(minutes)}</span>
                {minutes === serviceDurations.default && (
                  <span className="text-xs text-blue-600">(Recommended)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-gray-500 mt-1">
        Duration can be adjusted based on actual service needs
      </p>
    </div>
  );
};

export default ServiceDurationSelector;
