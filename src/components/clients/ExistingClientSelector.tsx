
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Client {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  }>;
}

interface ExistingClientSelectorProps {
  clients: Client[];
  selectedClient: string;
  selectedVehicle: string;
  onClientChange: (clientId: string) => void;
  onVehicleChange: (vehicleId: string) => void;
}

const ExistingClientSelector = ({
  clients,
  selectedClient,
  selectedVehicle,
  onClientChange,
  onVehicleChange
}: ExistingClientSelectorProps) => {
  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Select Client *</Label>
        <Select value={selectedClient} onValueChange={onClientChange}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.full_name} - {client.phone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Select Vehicle *</Label>
        <Select 
          value={selectedVehicle} 
          onValueChange={onVehicleChange}
          disabled={!selectedClient}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a vehicle" />
          </SelectTrigger>
          <SelectContent>
            {selectedClientData?.vehicles.map((vehicle) => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ExistingClientSelector;
