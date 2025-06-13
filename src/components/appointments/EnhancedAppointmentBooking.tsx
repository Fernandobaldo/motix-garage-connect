
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Car, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ServiceDurationSelector from './ServiceDurationSelector';
import AvailableTimeSlots from './AvailableTimeSlots';
import ExistingClientSelector from '@/components/clients/ExistingClientSelector';
import LicensePlateSearchField from '@/components/common/LicensePlateSearchField';

interface EnhancedAppointmentBookingProps {
  onSuccess?: () => void;
}

const EnhancedAppointmentBooking = ({ onSuccess }: EnhancedAppointmentBookingProps) => {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useExistingClient, setUseExistingClient] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; type: 'auth' | 'guest' } | null>(null);

  const [appointmentData, setAppointmentData] = useState({
    serviceType: '',
    description: '',
    selectedDate: '',
    selectedTime: '',
    duration: '60',
    clientId: '',
    guestClientId: '',
    vehicleId: '',
  });

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setAppointmentData(prev => ({ ...prev, vehicleId: vehicle.vehicle_id }));
  };

  const handleClientSelect = (clientId: string, clientName: string, clientType: 'auth' | 'guest') => {
    setSelectedClient({ id: clientId, name: clientName, type: clientType });
    if (clientType === 'auth') {
      setAppointmentData(prev => ({ 
        ...prev, 
        clientId: clientId,
        guestClientId: '' 
      }));
    } else {
      setAppointmentData(prev => ({ 
        ...prev, 
        clientId: '',
        guestClientId: clientId 
      }));
    }
  };

  const handleExistingClientSelect = (client: { id: string; name: string; type: 'auth' | 'guest' }) => {
    setSelectedClient(client);
    if (client.type === 'auth') {
      setAppointmentData(prev => ({ ...prev, clientId: client.id, guestClientId: '' }));
    } else {
      setAppointmentData(prev => ({ ...prev, guestClientId: client.id, clientId: '' }));
    }
  };

  const handleDateTimeSelect = (date: string, time: string) => {
    setAppointmentData(prev => ({ ...prev, selectedDate: date, selectedTime: time }));
  };

  const handleSubmit = async () => {
    if (!profile?.tenant_id) {
      toast.error('Unable to create appointment - no workshop selected');
      return;
    }

    if (!appointmentData.serviceType || !appointmentData.selectedDate || !appointmentData.selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!appointmentData.clientId && !appointmentData.guestClientId) {
      toast.error('Please select a client');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${appointmentData.selectedDate}T${appointmentData.selectedTime}`);

      const { error } = await supabase
        .from('appointments')
        .insert({
          tenant_id: profile.tenant_id,
          workshop_id: profile.id,
          client_id: appointmentData.clientId || null,
          guest_client_id: appointmentData.guestClientId || null,
          vehicle_id: appointmentData.vehicleId || null,
          service_type: appointmentData.serviceType,
          description: appointmentData.description,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(appointmentData.duration),
          status: 'confirmed',
        });

      if (error) throw error;

      toast.success('Appointment booked successfully');
      onSuccess?.();
      
      // Reset form
      setCurrentStep(1);
      setAppointmentData({
        serviceType: '',
        description: '',
        selectedDate: '',
        selectedTime: '',
        duration: '60',
        clientId: '',
        guestClientId: '',
        vehicleId: '',
      });
      setSelectedVehicle(null);
      setSelectedClient(null);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Service Details', icon: FileText },
    { number: 2, title: 'Client & Vehicle', icon: User },
    { number: 3, title: 'Date & Time', icon: Calendar },
    { number: 4, title: 'Review', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center space-x-2 ${
              currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step.number 
                  ? 'border-blue-600 bg-blue-600 text-white' 
                  : 'border-gray-300'
              }`}>
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <span className="font-medium">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="serviceType">Service Type *</Label>
                <Input
                  id="serviceType"
                  placeholder="e.g., Oil Change, Brake Inspection"
                  value={appointmentData.serviceType}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, serviceType: e.target.value }))}
                  required
                />
              </div>

              <ServiceDurationSelector
                serviceType={appointmentData.serviceType}
                duration={appointmentData.duration}
                onDurationChange={(duration) => setAppointmentData(prev => ({ ...prev, duration }))}
              />

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about the service needed..."
                  value={appointmentData.description}
                  onChange={(e) => setAppointmentData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-4">
                <Button
                  type="button"
                  variant={!useExistingClient ? "default" : "outline"}
                  onClick={() => setUseExistingClient(false)}
                  className="flex-1"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Search by License Plate
                </Button>
                <Button
                  type="button"
                  variant={useExistingClient ? "default" : "outline"}
                  onClick={() => setUseExistingClient(true)}
                  className="flex-1"
                >
                  <User className="h-4 w-4 mr-2" />
                  Select Existing Client
                </Button>
              </div>

              {!useExistingClient ? (
                <div className="space-y-4">
                  <LicensePlateSearchField
                    label="Search Vehicle by License Plate"
                    placeholder="Enter license plate to find vehicle and client..."
                    onVehicleSelect={handleVehicleSelect}
                    onClientSelect={handleClientSelect}
                    required
                  />

                  {selectedVehicle && selectedClient && (
                    <Card>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Vehicle:</span>
                            <span>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">License Plate:</span>
                            <Badge variant="outline">{selectedVehicle.license_plate}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Client:</span>
                            <div className="flex items-center space-x-2">
                              <span>{selectedClient.name}</span>
                              <Badge variant={selectedClient.type === 'auth' ? 'default' : 'secondary'} className="text-xs">
                                {selectedClient.type === 'auth' ? 'Account' : 'Guest'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <ExistingClientSelector
                  onClientSelect={handleExistingClientSelect}
                />
              )}
            </div>
          )}

          {currentStep === 3 && (
            <AvailableTimeSlots
              serviceType={appointmentData.serviceType}
              duration={parseInt(appointmentData.duration)}
              onDateTimeSelect={handleDateTimeSelect}
              selectedDate={appointmentData.selectedDate}
              selectedTime={appointmentData.selectedTime}
            />
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Review Appointment Details</h3>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Service Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Type:</span>
                      <span className="font-medium">{appointmentData.serviceType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{appointmentData.duration} minutes</span>
                    </div>
                    {appointmentData.description && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium">{appointmentData.description}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {(selectedClient || appointmentData.clientId || appointmentData.guestClientId) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Client Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedClient && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Client:</span>
                            <span className="font-medium">{selectedClient.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Type:</span>
                            <Badge variant={selectedClient.type === 'auth' ? 'default' : 'secondary'}>
                              {selectedClient.type === 'auth' ? 'Account' : 'Guest'}
                            </Badge>
                          </div>
                        </>
                      )}
                      {selectedVehicle && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Vehicle:</span>
                            <span className="font-medium">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">License Plate:</span>
                            <Badge variant="outline">{selectedVehicle.license_plate}</Badge>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(appointmentData.selectedDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{appointmentData.selectedTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={() => {
              if (currentStep === 1 && !appointmentData.serviceType) {
                toast.error('Please enter a service type');
                return;
              }
              if (currentStep === 2 && !appointmentData.clientId && !appointmentData.guestClientId) {
                toast.error('Please select a client');
                return;
              }
              if (currentStep === 3 && (!appointmentData.selectedDate || !appointmentData.selectedTime)) {
                toast.error('Please select a date and time');
                return;
              }
              setCurrentStep(currentStep + 1);
            }}
            disabled={
              (currentStep === 1 && !appointmentData.serviceType) ||
              (currentStep === 2 && !appointmentData.clientId && !appointmentData.guestClientId) ||
              (currentStep === 3 && (!appointmentData.selectedDate || !appointmentData.selectedTime))
            }
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedAppointmentBooking;
