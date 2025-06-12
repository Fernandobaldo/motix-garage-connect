
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, Mail, Phone, Car, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkshopData {
  workshop_id: string;
  workshop_name: string;
  workshop_email: string;
  workshop_phone: string;
  workshop_address: string;
  working_hours: any;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  services_offered: string[];
  tenant_id: string;
}

interface ReservationData {
  appointment_id: string;
  reservation_token: string;
}

interface PublicBookingFormProps {
  workshop: WorkshopData;
  onReservationCreated: (reservation: ReservationData) => void;
}

const PublicBookingForm = ({ workshop, onReservationCreated }: PublicBookingFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: '',
    scheduledDate: '',
    scheduledTime: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    vehicleInfo: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceType || !formData.scheduledDate || !formData.scheduledTime || 
        !formData.clientName || !formData.clientEmail) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const { data, error } = await supabase.rpc('create_temporary_reservation', {
        p_workshop_id: workshop.workshop_id,
        p_tenant_id: workshop.tenant_id,
        p_scheduled_at: scheduledAt.toISOString(),
        p_service_type: formData.serviceType,
        p_client_email: formData.clientEmail,
        p_client_name: formData.clientName,
        p_client_phone: formData.clientPhone,
        p_vehicle_info: formData.vehicleInfo,
        p_notes: formData.notes
      });

      if (error) throw error;

      if (data && data.length > 0) {
        onReservationCreated({
          appointment_id: data[0].appointment_id,
          reservation_token: data[0].reservation_token
        });
        
        toast({
          title: 'Reservation Created',
          description: 'Your appointment slot has been reserved. Please complete your registration.',
        });
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create reservation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const availableServices = workshop.services_offered || ['General Service', 'Oil Change', 'Brake Service', 'Inspection'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Book Your Appointment</span>
          </CardTitle>
          <CardDescription>
            Complete the form below to reserve your service appointment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <select
                id="serviceType"
                value={formData.serviceType}
                onChange={(e) => handleInputChange('serviceType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a service</option>
                {availableServices.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Preferred Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Preferred Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Your Information</span>
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="clientName">Full Name *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email Address *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone Number</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-2">
              <Label htmlFor="vehicleInfo" className="flex items-center space-x-2">
                <Car className="h-4 w-4" />
                <span>Vehicle Information</span>
              </Label>
              <Input
                id="vehicleInfo"
                value={formData.vehicleInfo}
                onChange={(e) => handleInputChange('vehicleInfo', e.target.value)}
                placeholder="e.g., 2020 Honda Civic, License: ABC123"
              />
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Additional Notes</span>
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any specific concerns or requests?"
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              style={{ backgroundColor: workshop.primary_color }}
            >
              {loading ? 'Creating Reservation...' : 'Reserve Appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Workshop Information */}
      <Card>
        <CardHeader>
          <CardTitle>Workshop Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Contact Information */}
          <div className="space-y-3">
            {workshop.workshop_phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <span>{workshop.workshop_phone}</span>
              </div>
            )}
            {workshop.workshop_email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <span>{workshop.workshop_email}</span>
              </div>
            )}
          </div>

          {/* Working Hours */}
          {workshop.working_hours && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Working Hours</span>
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                {Object.entries(workshop.working_hours).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">{day}:</span>
                    <span>{hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Services Offered */}
          <div className="space-y-2">
            <h4 className="font-semibold">Services Offered</h4>
            <div className="flex flex-wrap gap-2">
              {availableServices.map((service) => (
                <span
                  key={service}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertDescription>
              Your appointment slot will be reserved for 30 minutes. Please complete your registration 
              to confirm the booking. You'll receive a confirmation email once your account is created.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicBookingForm;
