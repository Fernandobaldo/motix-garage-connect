
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
          <p className="text-gray-600">Schedule a service appointment for your vehicle</p>
        </div>

        <Alert>
          <Car className="h-4 w-4" />
          <AlertDescription>
            You need to add a vehicle before you can book an appointment. Please add your vehicle information first.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show helpful message if no workshops available
  if (workshops.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
          <p className="text-gray-600">Schedule a service appointment for your vehicle</p>
        </div>

        <Alert>
          <Wrench className="h-4 w-4" />
          <AlertDescription>
            No workshops are currently available for booking. Please check back later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-blue-600" />
          <span>Book Appointment</span>
        </h2>
        <p className="text-gray-600">Schedule a service appointment for your vehicle</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span>Service Details</span>
          </CardTitle>
          <CardDescription>
            Fill out the form below to schedule your appointment. Available time slots are shown in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                workshopId={selectedWorkshop}
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
              disabled={loading || !selectedDate || !selectedTime || !serviceType || !vehicleId || !selectedWorkshop}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentBooking;
