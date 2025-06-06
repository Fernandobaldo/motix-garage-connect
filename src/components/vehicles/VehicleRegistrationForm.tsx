
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VehicleRegistrationFormProps {
  onVehicleAdded?: () => void;
  compact?: boolean;
  showHeader?: boolean;
}

const VehicleRegistrationForm = ({ 
  onVehicleAdded, 
  compact = false, 
  showHeader = true 
}: VehicleRegistrationFormProps) => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    fuel_type: '',
    transmission: ''
  });

  const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Natural Gas'];
  const transmissionTypes = ['Manual', 'Automatic', 'CVT'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const popularMakes = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Volkswagen', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.make || !formData.model || !formData.license_plate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (Make, Model, License Plate).',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const vehicleData = {
        ...formData,
        owner_id: user.id,
        tenant_id: tenant?.id || null,
        license_plate: formData.license_plate.toUpperCase()
      };

      const { error } = await supabase
        .from('vehicles')
        .insert(vehicleData);

      if (error) {
        toast({
          title: 'Registration Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Vehicle Registered! 🚗',
        description: `${formData.year} ${formData.make} ${formData.model} has been added to your garage.`
      });

      // Reset form
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        fuel_type: '',
        transmission: ''
      });

      onVehicleAdded?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while registering your vehicle.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        <div className={compact ? 'col-span-1' : 'md:col-span-2'}>
          <Label htmlFor="make">Vehicle Make *</Label>
          <Select value={formData.make} onValueChange={(value) => setFormData(prev => ({ ...prev, make: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle make" />
            </SelectTrigger>
            <SelectContent>
              {popularMakes.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formData.make === 'Other' && (
            <Input
              className="mt-2"
              placeholder="Enter vehicle make"
              value={formData.make === 'Other' ? '' : formData.make}
              onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
            />
          )}
        </div>

        <div>
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
            placeholder="e.g., Camry, Civic, F-150"
            required
          />
        </div>

        <div>
          <Label htmlFor="year">Year *</Label>
          <Select value={formData.year.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) }))}>
            <SelectTrigger>
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
        </div>

        <div>
          <Label htmlFor="license_plate">License Plate *</Label>
          <Input
            id="license_plate"
            value={formData.license_plate}
            onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value.toUpperCase() }))}
            placeholder="ABC-123"
            style={{ textTransform: 'uppercase' }}
            required
          />
        </div>

        {!compact && (
          <>
            <div>
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select value={formData.fuel_type} onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select value={formData.transmission} onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  {transmissionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Registering Vehicle...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Register Vehicle</span>
          </div>
        )}
      </Button>
    </form>
  );

  if (compact) {
    return content;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-blue-600" />
            <span>Register Your Vehicle</span>
          </CardTitle>
          <CardDescription>
            Add your vehicle information to start booking service appointments
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

export default VehicleRegistrationForm;
