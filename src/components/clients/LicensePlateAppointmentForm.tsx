
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import LicensePlateSearchField from '../common/LicensePlateSearchField';
import AppointmentDetailsForm from './AppointmentDetailsForm';

interface LicensePlateAppointmentFormProps {
  onSuccess: () => void;
}

const LicensePlateAppointmentForm = ({ onSuccess }: LicensePlateAppointmentFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Selected vehicle and client from plate search
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string, type: 'auth' | 'guest'} | null>(null);
  
  // Appointment details
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
  };

  const handleClientSelect = (clientId: string, clientName: string, clientType: 'auth' | 'guest') => {
    setSelectedClient({ id: clientId, name: clientName, type: clientType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedClient) return;

    setLoading(true);

    try {
      const scheduledAt = new Date(selectedDate!);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const appointmentData = {
        client_id: selectedClient.type === 'auth' ? selectedClient.id : null,
        guest_client_id: selectedClient.type === 'guest' ? selectedClient.id : null,
        workshop_id: profile?.tenant_id,
        vehicle_id: selectedVehicle.vehicle_id,
        service_type: serviceType,
        scheduled_at: scheduledAt.toISOString(),
        description: description,
        status: 'confirmed',
        tenant_id: profile?.tenant_id,
      };

      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData);

      if (appointmentError) {
        throw new Error(`Failed to create appointment: ${appointmentError.message}`);
      }

      toast({
        title: "Appointment Created",
        description: "The appointment has been successfully created.",
      });

      onSuccess();
    } catch (error: any) {
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
    return selectedVehicle && selectedClient && serviceType && selectedDate && selectedTime;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Client by License Plate</CardTitle>
        </CardHeader>
        <CardContent>
          <LicensePlateSearchField
            label="License Plate"
            placeholder="Enter license plate to find vehicle and client..."
            onVehicleSelect={handleVehicleSelect}
            onClientSelect={handleClientSelect}
            required
          />
          
          {selectedVehicle && selectedClient && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Selected for Appointment:</h4>
              <p className="text-green-700">
                <strong>Vehicle:</strong> {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} 
                ({selectedVehicle.license_plate})
              </p>
              <p className="text-green-700">
                <strong>Client:</strong> {selectedClient.name}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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

export default LicensePlateAppointmentForm;
