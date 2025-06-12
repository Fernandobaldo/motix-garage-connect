
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { Loader2, Wrench } from 'lucide-react';

const serviceRecordSchema = z.object({
  vehicle_id: z.string().min(1, 'Vehicle is required'),
  service_type: z.string().min(1, 'Service type is required'),
  description: z.string().optional(),
  cost: z.number().min(0, 'Cost must be positive').optional(),
  mileage: z.number().min(0, 'Mileage must be positive').optional(),
  labor_hours: z.number().min(0, 'Labor hours must be positive').optional(),
  technician_notes: z.string().optional(),
  workshop_id: z.string().min(1, 'Workshop is required'),
});

type ServiceRecordFormData = z.infer<typeof serviceRecordSchema>;

interface ServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedVehicleId?: string;
  vehicles: Array<{
    id: string;
    make: string;
    model: string;
    year: number;
    license_plate: string;
  }>;
}

const ServiceRecordModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  preselectedVehicleId,
  vehicles 
}: ServiceRecordModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tenant } = useTenant();

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<ServiceRecordFormData>({
    resolver: zodResolver(serviceRecordSchema),
    defaultValues: {
      vehicle_id: preselectedVehicleId || '',
      service_type: '',
      description: '',
      cost: undefined,
      mileage: undefined,
      labor_hours: undefined,
      technician_notes: '',
      workshop_id: '',
    },
  });

  const onSubmit = async (data: ServiceRecordFormData) => {
    if (!user || !tenant) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add service records',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const serviceRecord = {
        ...data,
        tenant_id: tenant.id,
        completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('service_history')
        .insert(serviceRecord);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service record added successfully',
      });

      reset();
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error adding service record:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add service record',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypes = [
    'Oil Change',
    'Brake Service',
    'Tire Rotation',
    'Engine Tune-up',
    'Transmission Service',
    'Battery Service',
    'Air Filter Replacement',
    'Brake Pad Replacement',
    'Coolant Service',
    'Other',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5" />
            <span>Add Service Record</span>
          </DialogTitle>
          <DialogDescription>
            Add a new service record for a vehicle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle *</Label>
              <Select onValueChange={(value) => setValue('vehicle_id', value)}>
                <SelectTrigger className={errors.vehicle_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicle_id && (
                <p className="text-sm text-red-500">{errors.vehicle_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select onValueChange={(value) => setValue('service_type', value)}>
                <SelectTrigger className={errors.service_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.service_type && (
                <p className="text-sm text-red-500">{errors.service_type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                {...register('cost', { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && (
                <p className="text-sm text-red-500">{errors.cost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                {...register('mileage', { valueAsNumber: true })}
                placeholder="Current mileage"
                className={errors.mileage ? 'border-red-500' : ''}
              />
              {errors.mileage && (
                <p className="text-sm text-red-500">{errors.mileage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor_hours">Labor Hours</Label>
              <Input
                id="labor_hours"
                type="number"
                step="0.5"
                {...register('labor_hours', { valueAsNumber: true })}
                placeholder="Hours worked"
                className={errors.labor_hours ? 'border-red-500' : ''}
              />
              {errors.labor_hours && (
                <p className="text-sm text-red-500">{errors.labor_hours.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workshop_id">Workshop *</Label>
              <Input
                id="workshop_id"
                {...register('workshop_id')}
                placeholder="Workshop ID"
                className={errors.workshop_id ? 'border-red-500' : ''}
              />
              {errors.workshop_id && (
                <p className="text-sm text-red-500">{errors.workshop_id.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Service description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="technician_notes">Technician Notes</Label>
            <Textarea
              id="technician_notes"
              {...register('technician_notes')}
              placeholder="Internal notes for technicians..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Service Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordModal;
