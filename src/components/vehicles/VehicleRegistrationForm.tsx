
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Car, Plus, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: '',
    fuel_type: '',
    transmission: '',
    // Additional optional fields
    vin: '',
    engine_size: '',
    color: '',
    mileage: '',
    purchase_date: '',
    insurance_company: '',
    policy_number: ''
  });

  const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Natural Gas', 'Propane'];
  const transmissionTypes = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Enhanced list of famous car makes sorted in descending order
  const popularMakes = [
    'Volvo', 'Volkswagen', 'Toyota', 'Tesla', 'Subaru', 'Skoda', 'Seat',
    'Renault', 'Porsche', 'Peugeot', 'Opel', 'Nissan', 'Mini', 'Mercedes-Benz',
    'Mazda', 'Maserati', 'Lexus', 'Land Rover', 'Lamborghini', 'Kia', 
    'Jeep', 'Jaguar', 'Infiniti', 'Hyundai', 'Honda', 'GMC', 'Genesis',
    'Ford', 'Fiat', 'Ferrari', 'Dodge', 'Citroen', 'Chrysler', 'Chevrolet',
    'Cadillac', 'Buick', 'BMW', 'Bentley', 'Audi', 'Alfa Romeo', 'Acura', 'Other'
  ].sort((a, b) => b.localeCompare(a));

  const colors = [
    'White', 'Black', 'Silver', 'Gray', 'Red', 'Blue', 'Green', 'Yellow',
    'Orange', 'Brown', 'Purple', 'Gold', 'Bronze', 'Beige', 'Other'
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
        make: formData.make,
        model: formData.model,
        year: formData.year,
        license_plate: formData.license_plate.toUpperCase(),
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
        owner_id: user.id,
        tenant_id: tenant?.id || null,
        // Store additional details in a JSON field or separate columns as needed
        additional_details: {
          vin: formData.vin || null,
          engine_size: formData.engine_size || null,
          color: formData.color || null,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          purchase_date: formData.purchase_date || null,
          insurance_company: formData.insurance_company || null,
          policy_number: formData.policy_number || null
        }
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
        transmission: '',
        vin: '',
        engine_size: '',
        color: '',
        mileage: '',
        purchase_date: '',
        insurance_company: '',
        policy_number: ''
      });
      setShowAdvanced(false);

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
      {/* Basic Information */}
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

      {/* Additional Details - Collapsible Section */}
      {!compact && (
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-between"
            >
              <span>Additional Details (Optional)</span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="vin">VIN Number</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value.toUpperCase() }))}
                  placeholder="17-character VIN"
                  maxLength={17}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div>
                <Label htmlFor="engine_size">Engine Size</Label>
                <Input
                  id="engine_size"
                  value={formData.engine_size}
                  onChange={(e) => setFormData(prev => ({ ...prev, engine_size: e.target.value }))}
                  placeholder="e.g., 2.0L, 3.5L V6"
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mileage">Current Mileage</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                  placeholder="Miles or kilometers"
                />
              </div>

              <div>
                <Label htmlFor="purchase_date">Purchase Date</Label>
                <Input
                  id="purchase_date"
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="insurance_company">Insurance Company</Label>
                <Input
                  id="insurance_company"
                  value={formData.insurance_company}
                  onChange={(e) => setFormData(prev => ({ ...prev, insurance_company: e.target.value }))}
                  placeholder="Insurance provider name"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="policy_number">Insurance Policy Number</Label>
                <Input
                  id="policy_number"
                  value={formData.policy_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, policy_number: e.target.value }))}
                  placeholder="Policy number"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

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
