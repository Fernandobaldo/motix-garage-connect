
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QuickVehicleAddProps {
  onVehicleAdded: () => void;
}

const QuickVehicleAdd = ({ onVehicleAdded }: QuickVehicleAddProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    license_plate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.make || !formData.model || !formData.license_plate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert({
          owner_id: user.id,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          license_plate: formData.license_plate
        });

      if (error) {
        toast({
          title: 'Failed to Add Vehicle',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Vehicle Added!',
        description: 'Your vehicle has been added successfully.'
      });

      // Reset form
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: ''
      });

      onVehicleAdded();
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="h-5 w-5 text-blue-600" />
          <span>Add Your Vehicle</span>
        </CardTitle>
        <CardDescription>
          Add your vehicle information to book appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                placeholder="e.g., Toyota"
                value={formData.make}
                onChange={(e) => setFormData({...formData, make: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                placeholder="e.g., Camry"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                required
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="license_plate">License Plate *</Label>
              <Input
                id="license_plate"
                placeholder="e.g., ABC-123"
                value={formData.license_plate}
                onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Adding Vehicle...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Vehicle</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default QuickVehicleAdd;
