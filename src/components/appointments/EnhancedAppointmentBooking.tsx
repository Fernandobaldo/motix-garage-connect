
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import { FormField } from '@/components/ui/form-field';
import { FormError } from '@/components/ui/form-error';
import { useAuth } from '@/hooks/useAuth';
import { useAppointmentBooking } from '@/hooks/useAppointmentBooking';
import DateTimeSelector from './DateTimeSelector';
import ServiceVehicleSelector from './ServiceVehicleSelector';
import { AlertCircle, Calendar, Clock, Car, Wrench, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { appointmentBookingSchema, type AppointmentBookingFormData } from '@/lib/validations/appointment';
import { cn } from '@/lib/utils';

interface EnhancedAppointmentBookingProps {
  onSuccess?: () => void;
}

const EnhancedAppointmentBooking = ({ onSuccess }: EnhancedAppointmentBookingProps) => {
  const { profile } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!selectedGarage) newErrors.workshopId = 'Please select a workshop';
      if (!serviceType) newErrors.serviceType = 'Please select a service type';
      if (!vehicleId) newErrors.vehicleId = 'Please select a vehicle';
    } else if (step === 2) {
      if (!selectedDate) newErrors.selectedDate = 'Please select a date';
      if (!selectedTime) newErrors.selectedTime = 'Please select a time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const formData: AppointmentBookingFormData = {
      workshopId: selectedGarage || '',
      serviceType: serviceType || '',
      vehicleId: vehicleId || '',
      selectedDate: selectedDate || new Date(),
      selectedTime: selectedTime || '',
      description: description || undefined,
    };

    const validation = appointmentBookingSchema.safeParse(formData);
    
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((error) => {
        if (error.path.length > 0) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    const success = await handleSubmit(e);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
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

  const steps = [
    { number: 1, title: 'Service & Vehicle', icon: Car },
    { number: 2, title: 'Date & Time', icon: Calendar },
    { number: 3, title: 'Review & Book', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                currentStep >= step.number
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-400 border-gray-300"
              )}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className={cn(
                "text-sm font-medium",
                currentStep >= step.number ? "text-blue-600" : "text-gray-500"
              )}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 h-0.5 mx-6 transition-colors",
                currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
              )} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Step 1: Service & Vehicle Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Select Service & Vehicle
              </CardTitle>
              <CardDescription>
                Choose the workshop, service type, and vehicle for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              
              <FormError message={errors.workshopId || errors.serviceType || errors.vehicleId} />
              
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!selectedGarage || !serviceType || !vehicleId}
                >
                  Next: Select Date & Time
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Date & Time Selection */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>
                Choose when you'd like to schedule your appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DateTimeSelector
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                selectedTime={selectedTime}
                onTimeChange={setSelectedTime}
                garageId={selectedGarage}
                serviceType={serviceType}
              />
              
              <FormError message={errors.selectedDate || errors.selectedTime} />
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!selectedDate || !selectedTime}
                >
                  Next: Review & Book
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Additional Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Review & Book Appointment
              </CardTitle>
              <CardDescription>
                Review your appointment details and add any additional information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appointment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Appointment Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Workshop:</span>
                    <p className="font-medium">{garages.find(g => g.id === selectedGarage)?.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Service:</span>
                    <p className="font-medium">{serviceType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Vehicle:</span>
                    <p className="font-medium">
                      {(() => {
                        const vehicle = vehicles.find(v => v.id === vehicleId);
                        return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
                      })()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date & Time:</span>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString()} at {selectedTime}
                    </p>
                  </div>
                </div>
              </div>

              <FormField label="Additional Notes" error={errors.description}>
                <Textarea
                  placeholder="Describe the issue or service needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </FormField>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <LoadingButton 
                  type="submit" 
                  loading={loading}
                  loadingText="Booking..."
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </LoadingButton>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
};

export default EnhancedAppointmentBooking;
