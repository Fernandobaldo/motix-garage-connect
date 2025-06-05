
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

interface Workshop {
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
  const [duration, setDuration] = useState('60');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user vehicles and available workshops
  useEffect(() => {
    const loadData = async () => {
      if (profile?.role === 'client' && user) {
        console.log('Loading vehicles and workshops for client:', user.id);
        
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

        // Load all public workshops
        const { data: workshopData, error: workshopError } = await supabase
          .from('workshops')
          .select('*')
          .eq('is_public', true);
        
        if (workshopError) {
          console.error('Error loading workshops:', workshopError);
        } else {
          console.log('Loaded workshops:', workshopData);
          setWorkshops(workshopData || []);
        }
      }
    };

    loadData();
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !serviceType || !vehicleId || !selectedWorkshop) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to book an appointment.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Find the selected workshop to get its tenant_id
      const workshop = workshops.find(w => w.id === selectedWorkshop);
      if (!workshop) {
        toast({
          title: 'Workshop Error',
          description: 'Selected workshop not found.',
          variant: 'destructive'
        });
        return;
      }

      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      console.log('Creating appointment with data:', {
        tenant_id: workshop.tenant_id,
        client_id: user.id,
        workshop_id: selectedWorkshop,
        vehicle_id: vehicleId,
        service_type: serviceType,
        description,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: parseInt(duration),
        status: 'pending'
      });

      const { error } = await supabase
        .from('appointments')
        .insert({
          tenant_id: workshop.tenant_id,
          client_id: user.id,
          workshop_id: selectedWorkshop,
          vehicle_id: vehicleId,
          service_type: serviceType,
          description,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(duration),
          status: 'pending'
        });

      if (error) {
        console.error('Appointment booking error:', error);
        toast({
          title: 'Booking Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
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
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
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
    duration,
    setDuration,
    vehicles,
    workshops,
    selectedWorkshop,
    setSelectedWorkshop,
    loading,
    handleSubmit,
  };
};
