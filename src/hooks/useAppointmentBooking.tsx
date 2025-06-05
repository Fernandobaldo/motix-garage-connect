
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
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
}

export const useAppointmentBooking = () => {
  const { user, profile } = useAuth();
  const { tenant } = useTenant();
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
      if (profile?.role === 'client') {
        // Load user's vehicles
        const { data: vehicleData } = await supabase
          .from('vehicles')
          .select('*')
          .eq('owner_id', user?.id);
        
        if (vehicleData) setVehicles(vehicleData);

        // Load available workshops (public ones or tenant-specific)
        const { data: workshopData } = await supabase
          .from('workshops')
          .select('*')
          .or('is_public.eq.true,tenant_id.eq.' + tenant?.id);
        
        if (workshopData) setWorkshops(workshopData);
      }
    };

    loadData();
  }, [profile, tenant, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !serviceType || !vehicleId || !selectedWorkshop || !tenant) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from('appointments')
        .insert({
          tenant_id: tenant.id,
          client_id: user?.id,
          workshop_id: selectedWorkshop,
          vehicle_id: vehicleId,
          service_type: serviceType,
          description,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(duration)
        });

      if (error) {
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
