
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useAppointmentBooking } from '@/hooks/useAppointmentBooking';
import DateTimeSelector from './DateTimeSelector';
import ServiceVehicleSelector from './ServiceVehicleSelector';
import { AlertCircle, Calendar, Clock, Car, Wrench } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AppointmentBookingProps {
  onSuccess?: () => void;
}

const AppointmentBooking = ({ onSuccess }: AppointmentBookingProps) => {
  const { profile } = useAuth();
  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    serviceType,
    setServiceType,
    vehicleId,
    setVehicleId,
    description,
    setDescription,
    vehicles,
    workshops: garages,
    selectedWorkshop: selectedGarage,
    setSelectedWorkshop: setSelectedGarage,
    loading,
    handleSubmit,
  } = useAppointmentBooking();

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  if (profile?.role !== 'client') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>Appointment booking is only available for clients.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show helpful message if no vehicles exist
  if (vehicles.length === 0) {
    return (
      <div className="space-y-6">
        <Alert>
          <Car className="h-4 w-4" />
          <AlertDescription>
            You need to add a vehicle before you can book an appointment. Please add your vehicle information first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show helpful message if no garages available
  if (garages.length === 0) {
    return (
      <div className="space-y-6">
        <Alert>
          <Wrench className="h-4 w-4" />
          <AlertDescription>
            No garages are currently available for booking. Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceVehicleSelector
            workshops={garages}
            selectedWorkshop={selectedGarage}
            onWorkshopChange={setSelectedGarage}
            serviceType={serviceType}
            onServiceTypeChange={setServiceType}
            vehicles={vehicles}
            vehicleId={vehicleId}
            onVehicleChange={setVehicleId}
          />

          <DateTimeSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            garageId={selectedGarage}
            serviceType={serviceType}
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe the issue or service needed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide any additional details about the service you need
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          disabled={loading || !selectedDate || !selectedTime || !serviceType || !vehicleId || !selectedGarage}
          size="lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Booking...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Book Appointment</span>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AppointmentBooking;
