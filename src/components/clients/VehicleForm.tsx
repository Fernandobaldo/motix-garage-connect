
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Make *</Label>
            <Input
              value={vehicleData.make}
              onChange={(e) => onVehicleDataChange({ ...vehicleData, make: e.target.value })}
              placeholder="e.g., Toyota"
              required
            />
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
            <Input
              type="number"
              value={vehicleData.year}
              onChange={(e) => onVehicleDataChange({ ...vehicleData, year: parseInt(e.target.value) })}
              min={1900}
              max={new Date().getFullYear() + 1}
              required
            />
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
            <Select value={vehicleData.fuel_type} onValueChange={(value) => onVehicleDataChange({ ...vehicleData, fuel_type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Transmission</Label>
            <Select value={vehicleData.transmission} onValueChange={(value) => onVehicleDataChange({ ...vehicleData, transmission: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="cvt">CVT</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleForm;
