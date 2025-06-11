
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleData {
  make: string;
  model: string;
  year: number;
  license_plate: string;
  fuel_type: string;
  transmission: string;
}

interface VehicleFormProps {
  vehicleData: VehicleData;
  onVehicleDataChange: (data: VehicleData) => void;
}

const VehicleForm = ({ vehicleData, onVehicleDataChange }: VehicleFormProps) => {
  const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Natural Gas', 'Propane'];
  const transmissionTypes = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Enhanced list of famous car makes sorted in descending order
  const popularMakes = [
    'Volvo', 'Volkswagen', 'Toyota', 'Tesla', 'Subaru', 'Skoda', 'Seat',
    'Renault', 'Porsche', 'Peugeot', 'Opel', 'Nissan', 'Mini', 'Mercedes-Benz',
    'Mazda', 'Maserati', 'Lexus', 'Land Rover', 'Lamborghini', 'Kia', 
    'Jeep', 'Jaguar', 'Infiniti', 'Hyundai', 'Honda', 'GMC', 'Genesis',
    'Ford', 'Fiat', 'Ferrari', 'Dodge', 'Citroen', 'Chrysler', 'Chevrolet',
    'Cadillac', 'Buick', 'BMW', 'Bentley', 'Audi', 'Alfa Romeo', 'Acura', 'Other'
  ].sort((a, b) => b.localeCompare(a));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Make *</Label>
            <Select 
              value={vehicleData.make} 
              onValueChange={(value) => onVehicleDataChange({ ...vehicleData, make: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle make" />
              </SelectTrigger>
              <SelectContent>
                {popularMakes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {vehicleData.make === 'Other' && (
              <Input
                className="mt-2"
                placeholder="Enter vehicle make"
                value={vehicleData.make === 'Other' ? '' : vehicleData.make}
                onChange={(e) => onVehicleDataChange({ ...vehicleData, make: e.target.value })}
              />
            )}
          </div>
          
          <div>
            <Label>Model *</Label>
            <Input
              value={vehicleData.model}
              onChange={(e) => onVehicleDataChange({ ...vehicleData, model: e.target.value })}
              placeholder="e.g., Camry"
              required
            />
          </div>
          
          <div>
            <Label>Year *</Label>
            <Select 
              value={vehicleData.year.toString()} 
              onValueChange={(value) => onVehicleDataChange({ ...vehicleData, year: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>License Plate *</Label>
            <Input
              value={vehicleData.license_plate}
              onChange={(e) => onVehicleDataChange({ ...vehicleData, license_plate: e.target.value })}
              placeholder="Enter license plate"
              required
            />
          </div>
          
          <div>
            <Label>Fuel Type</Label>
            <Select 
              value={vehicleData.fuel_type} 
              onValueChange={(value) => onVehicleDataChange({ ...vehicleData, fuel_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                {fuelTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Transmission</Label>
            <Select 
              value={vehicleData.transmission} 
              onValueChange={(value) => onVehicleDataChange({ ...vehicleData, transmission: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                {transmissionTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleForm;
