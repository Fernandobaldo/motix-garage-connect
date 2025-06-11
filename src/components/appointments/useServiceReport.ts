
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PartUsed {
  name: string;
  quantity: number;
  price: number;
}

interface ServiceReportFormData {
  description: string;
  laborHours: number;
  mileage: string;
  cost: number;
  nextServiceDue: string;
  serviceType: string;
}

export const useServiceReport = (appointmentId: string, onSuccess: () => void, onClose: () => void) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ServiceReportFormData>({
    description: '',
    laborHours: 0,
    mileage: '',
    cost: 0,
    nextServiceDue: '',
    serviceType: '',
  });
  
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([
    { name: '', quantity: 1, price: 0 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First get appointment details to extract service_type, vehicle_id, and workshop_id
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('service_type, vehicle_id, workshop_id')
        .eq('id', appointmentId)
        .single();

      if (appointmentError || !appointment) {
        throw new Error('Failed to fetch appointment details');
      }

      const serviceData = {
        appointment_id: appointmentId,
        workshop_id: appointment.workshop_id,
        tenant_id: profile?.tenant_id,
        vehicle_id: appointment.vehicle_id,
        service_type: appointment.service_type,
        description: formData.description,
        labor_hours: formData.laborHours,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        cost: formData.cost,
        completed_at: new Date().toISOString(),
        next_service_due_at: formData.nextServiceDue ? new Date(formData.nextServiceDue).toISOString() : null,
        parts_used: JSON.stringify(partsUsed.filter(part => part.name.trim() !== '')),
      };

      const { error } = await supabase
        .from('service_history')
        .insert(serviceData);

      if (error) {
        console.error('Service report creation error:', error);
        throw new Error(`Failed to create service report: ${error.message}`);
      }

      toast({
        title: "Service Report Created",
        description: "The service report has been successfully submitted.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error in service report creation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    partsUsed,
    setPartsUsed,
    loading,
    handleSubmit,
  };
};
