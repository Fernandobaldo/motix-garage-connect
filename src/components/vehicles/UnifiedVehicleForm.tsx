
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Car, Loader2 } from 'lucide-react';

const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  license_plate: z.string().min(1, 'License plate is required'),
  fuel_type: z.string().optional(),
  transmission: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface UnifiedVehicleFormProps {
  ownerId: string;
  tenantId?: string;
  onSuccess?: (vehicle: any) => void;
  onCancel?: () => void;
  initialData?: Partial<VehicleFormData>;
  mode?: 'create' | 'edit';
  showHeader?: boolean;
}

const UnifiedVehicleForm = ({ 
  ownerId, 
  tenantId, 
  onSuccess, 
  onCancel, 
  initialData,
  mode = 'create',
  showHeader = true 
}: UnifiedVehicleFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      make: initialData?.make || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      license_plate: initialData?.license_plate || '',
      fuel_type: initialData?.fuel_type || '',
      transmission: initialData?.transmission || '',
    },
  });

  const onSubmit = async (data: VehicleFormData) => {
    setIsSubmitting(true);
    
    try {
      const vehicleData = {
        ...data,
        owner_id: ownerId,
        tenant_id: tenantId,
      };

      const { data: vehicle, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Vehicle ${mode === 'create' ? 'added' : 'updated'} successfully`,
      });

      onSuccess?.(vehicle);
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${mode} vehicle`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1980 + 2 }, (_, i) => currentYear + 1 - i);

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            {...register('make')}
            placeholder="Toyota, Honda, Ford..."
            className={errors.make ? 'border-red-500' : ''}
          />
          {errors.make && (
            <p className="text-sm text-red-500">{errors.make.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            {...register('model')}
            placeholder="Camry, Civic, F-150..."
            className={errors.model ? 'border-red-500' : ''}
          />
          {errors.model && (
            <p className="text-sm text-red-500">{errors.model.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Year *</Label>
          <Select onValueChange={(value) => setValue('year', parseInt(value))}>
            <SelectTrigger className={errors.year ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.year && (
            <p className="text-sm text-red-500">{errors.year.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="license_plate">License Plate *</Label>
          <Input
            id="license_plate"
            {...register('license_plate')}
            placeholder="ABC-1234"
            className={errors.license_plate ? 'border-red-500' : ''}
          />
          {errors.license_plate && (
            <p className="text-sm text-red-500">{errors.license_plate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel_type">Fuel Type</Label>
          <Select onValueChange={(value) => setValue('fuel_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transmission">Transmission</Label>
          <Select onValueChange={(value) => setValue('transmission', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'Add Vehicle' : 'Update Vehicle'}
        </Button>
      </div>
    </form>
  );

  if (!showHeader) {
    return formContent;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5" />
          <span>{mode === 'create' ? 'Add New Vehicle' : 'Edit Vehicle'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};

export default UnifiedVehicleForm;
