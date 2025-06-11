
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Phone, Car, Plus, Trash2 } from 'lucide-react';

const clientSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  vehicles: z.array(z.object({
    make: z.string().min(1, 'Make is required'),
    model: z.string().min(1, 'Model is required'),
    year: z.number().min(1900).max(new Date().getFullYear() + 1),
    license_plate: z.string().min(1, 'License plate is required'),
    fuel_type: z.string().optional(),
    transmission: z.string().optional(),
  })).optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientCreationFormProps {
  onSuccess: () => void;
}

const ClientCreationForm = ({ onSuccess }: ClientCreationFormProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState([{
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    fuel_type: '',
    transmission: '',
  }]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const addVehicle = () => {
    setVehicles([...vehicles, {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      fuel_type: '',
      transmission: '',
    }]);
  };

  const removeVehicle = (index: number) => {
    if (vehicles.length > 1) {
      setVehicles(vehicles.filter((_, i) => i !== index));
    }
  };

  const updateVehicle = (index: number, field: string, value: string | number) => {
    const updated = vehicles.map((vehicle, i) => 
      i === index ? { ...vehicle, [field]: value } : vehicle
    );
    setVehicles(updated);
  };

  const onSubmit = async (data: ClientFormData) => {
    if (!profile?.tenant_id) return;

    setIsSubmitting(true);

    try {
      // Create the client profile
      const { data: clientProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          full_name: data.full_name,
          phone: data.phone,
          role: 'client',
          tenant_id: profile.tenant_id,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Create vehicles if any
      if (vehicles.length > 0 && vehicles[0].make) {
        const validVehicles = vehicles.filter(v => v.make && v.model && v.license_plate);
        
        if (validVehicles.length > 0) {
          const vehiclesToInsert = validVehicles.map(vehicle => ({
            owner_id: clientProfile.id,
            tenant_id: profile.tenant_id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            license_plate: vehicle.license_plate,
            fuel_type: vehicle.fuel_type || null,
            transmission: vehicle.transmission || null,
          }));

          const { error: vehicleError } = await supabase
            .from('vehicles')
            .insert(vehiclesToInsert);

          if (vehicleError) throw vehicleError;
        }
      }

      toast({
        title: 'Client Created',
        description: `${data.full_name} has been added to your client database.`,
      });

      reset();
      setVehicles([{
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        fuel_type: '',
        transmission: '',
      }]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error Creating Client',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Client Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Client Information</span>
          </CardTitle>
          <CardDescription>
            Basic information about the client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name')}
              placeholder="Enter client's full name"
            />
            {errors.full_name && (
              <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Vehicles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Vehicles</span>
            </div>
            <Button type="button" onClick={addVehicle} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Vehicle
            </Button>
          </CardTitle>
          <CardDescription>
            Add the client's vehicles (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {vehicles.map((vehicle, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Vehicle {index + 1}</h4>
                {vehicles.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeVehicle(index)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Make</Label>
                  <Input
                    value={vehicle.make}
                    onChange={(e) => updateVehicle(index, 'make', e.target.value)}
                    placeholder="Toyota, BMW, etc."
                  />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input
                    value={vehicle.model}
                    onChange={(e) => updateVehicle(index, 'model', e.target.value)}
                    placeholder="Corolla, X5, etc."
                  />
                </div>
                <div>
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={vehicle.year}
                    onChange={(e) => updateVehicle(index, 'year', parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                <div>
                  <Label>License Plate</Label>
                  <Input
                    value={vehicle.license_plate}
                    onChange={(e) => updateVehicle(index, 'license_plate', e.target.value)}
                    placeholder="ABC-123"
                  />
                </div>
                <div>
                  <Label>Fuel Type</Label>
                  <Input
                    value={vehicle.fuel_type}
                    onChange={(e) => updateVehicle(index, 'fuel_type', e.target.value)}
                    placeholder="Gasoline, Diesel, Electric"
                  />
                </div>
                <div>
                  <Label>Transmission</Label>
                  <Input
                    value={vehicle.transmission}
                    onChange={(e) => updateVehicle(index, 'transmission', e.target.value)}
                    placeholder="Manual, Automatic"
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
};

export default ClientCreationForm;
