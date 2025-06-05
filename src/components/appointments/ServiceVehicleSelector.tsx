
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car } from 'lucide-react';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface Workshop {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ServiceVehicleSelectorProps {
  workshops: Workshop[];
  selectedWorkshop: string;
  onWorkshopChange: (workshop: string) => void;
  serviceType: string;
  onServiceTypeChange: (serviceType: string) => void;
  vehicles: Vehicle[];
  vehicleId: string;
  onVehicleChange: (vehicleId: string) => void;
}

const serviceTypes = [
  'Oil Change',
  'Brake Service', 
  'Engine Diagnostics',
  'Transmission Service',
  'Air Conditioning',
  'Tire Service',
  'Battery Service',
  'General Inspection',
  'Custom Service'
];

const ServiceVehicleSelector = ({
  workshops,
  selectedWorkshop,
  onWorkshopChange,
  serviceType,
  onServiceTypeChange,
  vehicles,
  vehicleId,
  onVehicleChange,
}: ServiceVehicleSelectorProps) => {
  return (
    <>
      <div>
        <Label htmlFor="workshop">Workshop *</Label>
        <Select value={selectedWorkshop} onValueChange={onWorkshopChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select workshop" />
          </SelectTrigger>
          <SelectContent>
            {workshops.map((workshop) => (
              <SelectItem key={workshop.id} value={workshop.id}>
                {workshop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="serviceType">Service Type *</Label>
        <Select value={serviceType} onValueChange={onServiceTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select service type" />
          </SelectTrigger>
          <SelectContent>
            {serviceTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="vehicle">Vehicle *</Label>
        <Select value={vehicleId} onValueChange={onVehicleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select vehicle" />
          </SelectTrigger>
          <SelectContent>
            {vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4" />
                  <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default ServiceVehicleSelector;
