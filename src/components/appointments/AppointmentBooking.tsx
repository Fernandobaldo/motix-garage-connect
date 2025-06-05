
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useAppointmentBooking } from '@/hooks/useAppointmentBooking';
import DateTimeSelector from './DateTimeSelector';
import ServiceVehicleSelector from './ServiceVehicleSelector';

const AppointmentBooking = () => {
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
    duration,
    setDuration,
    vehicles,
    workshops,
    selectedWorkshop,
    setSelectedWorkshop,
    loading,
    handleSubmit,
  } = useAppointmentBooking();

  if (profile?.role !== 'client') {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Appointment booking is only available for clients.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
        <p className="text-gray-600">Schedule a service appointment for your vehicle</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
          <CardDescription>
            Fill out the form below to schedule your appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ServiceVehicleSelector
                workshops={workshops}
                selectedWorkshop={selectedWorkshop}
                onWorkshopChange={setSelectedWorkshop}
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
                duration={duration}
                onDurationChange={setDuration}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue or service needed..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentBooking;
