
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

interface UnifiedVehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  ownerId?: string;
  clientId?: string;
}

const UnifiedVehicleForm = ({ isOpen, onClose, onSuccess, ownerId, clientId }: UnifiedVehicleFormProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { tenant } = useTenant();
  
  const [formData, setFormData] = useState({
    license_plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    fuel_type: '',
    transmission: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile?.id || !tenant?.id) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.license_plate || !formData.make || !formData.model || !formData.year) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const vehicleData = {
        owner_id: ownerId || null,
        client_id: clientId || null,
        tenant_id: tenant.id,
        license_plate: formData.license_plate,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        fuel_type: formData.fuel_type || null,
        transmission: formData.transmission || null,
      };

      const { error } = await supabase
        .from('vehicles')
        .insert(vehicleData);

      if (error) {
        console.error('Error creating vehicle:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Vehicle created successfully",
      });

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        license_plate: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        fuel_type: '',
        transmission: '',
      });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to create vehicle",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="license_plate">License Plate *</Label>
            <Input
              id="license_plate"
              value={formData.license_plate}
              onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value }))}
              placeholder="ABC-123"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
                placeholder="Toyota"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="Camry"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select 
                value={formData.fuel_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, fuel_type: value }))}
              >
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
            
            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select 
                value={formData.transmission} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, transmission: value }))}
              >
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedVehicleForm;
