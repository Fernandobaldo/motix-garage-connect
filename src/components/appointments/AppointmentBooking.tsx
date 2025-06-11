
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
// Import the enhanced booking component
import EnhancedAppointmentBooking from './EnhancedAppointmentBooking';

interface AppointmentBookingProps {
  onSuccess?: () => void;
}

const AppointmentBooking = ({ onSuccess }: AppointmentBookingProps) => {
  // Use the enhanced component instead of the old one
  return <EnhancedAppointmentBooking onSuccess={onSuccess} />;
};

export default AppointmentBooking;
