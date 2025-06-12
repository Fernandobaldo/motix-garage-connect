
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, isSameDay, isAfter, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkshopData {
  workshop_id: string;
  workshop_name: string;
  services_offered: string[];
  working_hours: any;
  tenant_id: string;
}

interface PublicBookingFormProps {
  workshop: WorkshopData;
  onReservationCreated: (reservation: { appointment_id: string; reservation_token: string }) => void;
}

const PublicBookingForm = ({ workshop, onReservationCreated }: PublicBookingFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    service_type: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    vehicle_info: '',
    notes: ''
  });

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', 
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !formData.service_type || !formData.client_name || !formData.client_email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const { data, error } = await supabase
        .rpc('create_temporary_reservation', {
          p_workshop_id: workshop.workshop_id,
          p_tenant_id: workshop.tenant_id,
          p_scheduled_at: scheduledAt.toISOString(),
          p_service_type: formData.service_type,
          p_client_email: formData.client_email,
          p_client_name: formData.client_name,
          p_client_phone: formData.client_phone || null,
          p_vehicle_info: formData.vehicle_info || null,
          p_notes: formData.notes || null
        });

      if (error) throw error;

      if (data && data.length > 0) {
        onReservationCreated({
          appointment_id: data[0].appointment_id,
          reservation_token: data[0].reservation_token
        });
      }

      toast({
        title: 'Reservation Created',
        description: 'Your appointment has been temporarily reserved. Please complete the registration to confirm.',
      });

    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create reservation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates
    return !isAfter(date, startOfDay(new Date())) && !isSameDay(date, new Date());
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book Your Appointment</CardTitle>
        <CardDescription>
          Fill in the details below to reserve your service appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <Label htmlFor="service">Service Type *</Label>
            <Select value={formData.service_type} onValueChange={(value) => handleInputChange('service_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {workshop.services_offered?.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                )) || (
                  <>
                    <SelectItem value="Oil Change">Oil Change</SelectItem>
                    <SelectItem value="Brake Service">Brake Service</SelectItem>
                    <SelectItem value="Tire Service">Tire Service</SelectItem>
                    <SelectItem value="Engine Diagnostics">Engine Diagnostics</SelectItem>
                    <SelectItem value="General Maintenance">General Maintenance</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time *</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Full Name *</Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => handleInputChange('client_name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => handleInputChange('client_email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_phone">Phone Number</Label>
              <Input
                id="client_phone"
                type="tel"
                value={formData.client_phone}
                onChange={(e) => handleInputChange('client_phone', e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_info">Vehicle Information</Label>
              <Input
                id="vehicle_info"
                value={formData.vehicle_info}
                onChange={(e) => handleInputChange('vehicle_info', e.target.value)}
                placeholder="e.g., 2020 Honda Civic, License: ABC-123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information about your service request..."
                rows={3}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            style={{ backgroundColor: workshop.primary_color || '#3b82f6' } as any}
          >
            {loading ? 'Creating Reservation...' : 'Reserve Appointment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PublicBookingForm;
