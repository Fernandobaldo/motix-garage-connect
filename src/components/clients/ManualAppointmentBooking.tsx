
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ExistingClientSelector from "./ExistingClientSelector";
import GuestClientForm from "./GuestClientForm";
import VehicleForm from "./VehicleForm";
import AppointmentDetailsForm from "./AppointmentDetailsForm";
import LicensePlateSearchField from "../common/LicensePlateSearchField";
import { useClientLimits } from "@/hooks/useClientLimits";

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

interface ManualAppointmentBookingProps {
  onSuccess: () => void;
  existingClients: Client[];
}

const ManualAppointmentBooking = ({ onSuccess, existingClients }: ManualAppointmentBookingProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { canAddClient, isAtLimit } = useClientLimits();
  const [loading, setLoading] = useState(false);
  const [appointmentType, setAppointmentType] = useState<'existing' | 'new'>('existing');

  // Form states
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  // License plate search states
  const [selectedPlateVehicle, setSelectedPlateVehicle] = useState<any>(null);
  const [plateSearchClient, setPlateSearchClient] = useState<{id: string, name: string, type: 'auth' | 'guest'} | null>(null);

  // New client form - simplified for guest booking
  const [newClient, setNewClient] = useState({
    full_name: '',
    phone: '',
    email: '',
  });

  // New vehicle form
  const [newVehicle, setNewVehicle] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    fuel_type: '',
    transmission: '',
  });

  const handleVehicleSelect = (vehicle: any) => {
    console.log('Selected vehicle from plate search:', vehicle);
    setSelectedPlateVehicle(vehicle);
    setSelectedVehicle(vehicle.vehicle_id);
  };

  const handleClientSelect = (clientId: string, clientName: string, clientType: 'auth' | 'guest') => {
    console.log('Selected client from plate search:', { clientId, clientName, clientType });
    setPlateSearchClient({ id: clientId, name: clientName, type: clientType });
    setSelectedClient(clientId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let clientId = selectedClient;
      let vehicleId = selectedVehicle;
      let isGuestClient = false;

      if (appointmentType === 'new') {
        // Check client limits before creating new guest client
        if (isAtLimit) {
          toast({
            title: "Client Limit Reached",
            description: "You've reached your client limit. Please upgrade your plan to add more clients.",
            variant: "destructive",
          });
          return;
        }

        console.log('Creating guest client and vehicle');
        
        // Create guest client in the clients table
        const { data: createdClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            tenant_id: profile?.tenant_id,
            full_name: newClient.full_name,
            phone: newClient.phone,
            email: newClient.email || null,
          })
          .select()
          .single();

        if (clientError) {
          console.error('Client creation error:', clientError);
          throw new Error(`Failed to create client: ${clientError.message}`);
        }

        console.log('Created guest client:', createdClient);
        clientId = createdClient.id;
        isGuestClient = true;
        
        // Create vehicle for guest client
        const vehicleData = {
          ...newVehicle,
          client_id: createdClient.id, // Use client_id for guest clients
          owner_id: null, // No authenticated user
          tenant_id: profile?.tenant_id,
        };

        console.log('Inserting guest vehicle:', vehicleData);

        const { data: createdVehicle, error: vehicleError } = await supabase
          .from('vehicles')
          .insert(vehicleData)
          .select()
          .single();

        if (vehicleError) {
          console.error('Vehicle creation error:', vehicleError);
          throw new Error(`Failed to create vehicle: ${vehicleError.message}`);
        }

        console.log('Created guest vehicle:', createdVehicle);
        vehicleId = createdVehicle.id;
      } else if (selectedPlateVehicle) {
        // Use the vehicle and client from plate search
        vehicleId = selectedPlateVehicle.vehicle_id;
        clientId = plateSearchClient?.id || selectedClient;
        isGuestClient = plateSearchClient?.type === 'guest';
      }

      // Create appointment
      const scheduledAt = new Date(selectedDate!);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const appointmentData = {
        client_id: isGuestClient ? null : clientId, // null for guest appointments
        guest_client_id: isGuestClient ? clientId : null, // use guest_client_id for guest clients
        workshop_id: profile?.tenant_id,
        vehicle_id: vehicleId,
        service_type: serviceType,
        scheduled_at: scheduledAt.toISOString(),
        description: description,
        status: 'confirmed',
        tenant_id: profile?.tenant_id,
      };

      console.log('Creating appointment:', appointmentData);

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (appointmentError) {
        console.error('Appointment creation error:', appointmentError);
        throw new Error(`Failed to create appointment: ${appointmentError.message}`);
      }

      toast({
        title: "Appointment Created",
        description: appointmentType === 'new' 
          ? "Guest appointment created successfully."
          : "The appointment has been successfully created.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error in appointment creation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const basicValidation = serviceType && selectedDate && selectedTime;
    
    if (appointmentType === 'existing') {
      return basicValidation && ((selectedClient && selectedVehicle) || selectedPlateVehicle);
    } else {
      return basicValidation && 
        newClient.full_name && 
        newClient.phone && 
        newVehicle.make && 
        newVehicle.model && 
        newVehicle.license_plate;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={appointmentType} onValueChange={(value) => setAppointmentType(value as 'existing' | 'new')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Existing Client</span>
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center space-x-2" disabled={isAtLimit}>
            <UserPlus className="h-4 w-4" />
            <span>Guest Appointment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Search by License Plate</h3>
              <LicensePlateSearchField
                label="License Plate"
                placeholder="Enter license plate to find vehicle and client..."
                onVehicleSelect={handleVehicleSelect}
                onClientSelect={handleClientSelect}
                required
              />
            </div>
            
            {selectedPlateVehicle && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Selected for Appointment:</h4>
                <p className="text-blue-700">
                  <strong>Vehicle:</strong> {selectedPlateVehicle.year} {selectedPlateVehicle.make} {selectedPlateVehicle.model} 
                  ({selectedPlateVehicle.license_plate})
                </p>
                <p className="text-blue-700">
                  <strong>Client:</strong> {plateSearchClient?.name}
                </p>
              </div>
            )}

            <div className="text-center text-gray-500">
              <span>- OR -</span>
            </div>

            <ExistingClientSelector
              clients={existingClients}
              selectedClient={selectedClient}
              selectedVehicle={selectedVehicle}
              onClientChange={(clientId) => {
                setSelectedClient(clientId);
                setSelectedPlateVehicle(null);
                setPlateSearchClient(null);
              }}
              onVehicleChange={(vehicleId) => {
                setSelectedVehicle(vehicleId);
                setSelectedPlateVehicle(null);
                setPlateSearchClient(null);
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          {isAtLimit && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                You've reached your client limit. Please upgrade your plan to create guest appointments.
              </p>
            </div>
          )}
          <GuestClientForm
            clientData={newClient}
            onClientDataChange={setNewClient}
          />
          <VehicleForm
            vehicleData={newVehicle}
            onVehicleDataChange={setNewVehicle}
          />
        </TabsContent>
      </Tabs>

      <AppointmentDetailsForm
        serviceType={serviceType}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        description={description}
        onServiceTypeChange={setServiceType}
        onDateChange={setSelectedDate}
        onTimeChange={setSelectedTime}
        onDescriptionChange={setDescription}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={loading || !isFormValid()}
      >
        {loading ? 'Creating Appointment...' : 'Create Appointment'}
      </Button>
    </form>
  );
};

export default ManualAppointmentBooking;
