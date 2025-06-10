
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface Garage {
  id: string;
  name: string;
  email: string;
  phone: string;
  tenant_id: string;
}

export const useAppointmentBooking = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workshops, setWorkshops] = useState<Garage[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user vehicles and available garages
  useEffect(() => {
    const loadData = async () => {
      if (profile?.role === 'client' && user) {
        console.log('Loading vehicles and garages for client:', user.id);
        
        // Load user's vehicles
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehicles')
          .select('*')
          .eq('owner_id', user.id);
        
        if (vehicleError) {
          console.error('Error loading vehicles:', vehicleError);
        } else {
          console.log('Loaded vehicles:', vehicleData);
          setVehicles(vehicleData || []);
        }

        // Load all public garages
        const { data: garageData, error: garageError } = await supabase
          .from('workshops')
          .select('*')
          .eq('is_public', true);
        
        if (garageError) {
          console.error('Error loading garages:', garageError);
        } else {
          console.log('Loaded garages:', garageData);
          setWorkshops(garageData || []);
        }
      }
    };

    loadData();
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !serviceType || !vehicleId || !selectedWorkshop) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return false;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to book an appointment.',
        variant: 'destructive'
      });
      return false;
    }

    setLoading(true);

    try {
      // Find the selected garage to get its tenant_id
      const garage = workshops.find(w => w.id === selectedWorkshop);
      if (!garage) {
        toast({
          title: 'Garage Error',
          description: 'Selected garage not found.',
          variant: 'destructive'
        });
        return false;
      }

      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      console.log('Creating appointment with data:', {
        tenant_id: garage.tenant_id,
        client_id: user.id,
        workshop_id: selectedWorkshop,
        vehicle_id: vehicleId,
        service_type: serviceType,
        description,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: 60, // Default 1 hour
        status: 'pending'
      });

      const { error } = await supabase
        .from('appointments')
        .insert({
          tenant_id: garage.tenant_id,
          client_id: user.id,
          workshop_id: selectedWorkshop,
          vehicle_id: vehicleId,
          service_type: serviceType,
          description,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 60, // Default 1 hour as requested
          status: 'pending'
        });

      if (error) {
        console.error('Appointment booking error:', error);
        toast({
          title: 'Booking Failed',
          description: error.message,
          variant: 'destructive'
        });
        return false;
      }

      toast({
        title: 'Appointment Booked!',
        description: 'Your appointment has been successfully scheduled.'
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setServiceType('');
      setVehicleId('');
      setDescription('');
      setSelectedWorkshop('');
      
      return true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
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
    workshops,
    selectedWorkshop,
    setSelectedWorkshop,
    loading,
    handleSubmit,
  };
};
