
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';

interface Vehicle {
  id: string;
  license_plate: string;
  make: string;
  model: string;
  year: number;
}

interface ServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicles: Vehicle[];
  preselectedVehicleId?: string;
}

const ServiceRecordModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  vehicles, 
  preselectedVehicleId 
}: ServiceRecordModalProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { tenant } = useTenant();
  
  const [formData, setFormData] = useState({
    vehicle_id: preselectedVehicleId || '',
    service_type: '',
    description: '',
    cost: '',
    labor_hours: '',
    mileage: '',
    technician_notes: '',
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

    if (!formData.vehicle_id || !formData.service_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceRecord = {
        tenant_id: tenant.id,
        vehicle_id: formData.vehicle_id,
        workshop_id: profile.id,
        service_type: formData.service_type,
        description: formData.description || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        labor_hours: formData.labor_hours ? parseFloat(formData.labor_hours) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        technician_notes: formData.technician_notes || null,
        completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('service_history')
        .insert(serviceRecord);

      if (error) {
        console.error('Error creating service record:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Service record created successfully",
      });

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        vehicle_id: preselectedVehicleId || '',
        service_type: '',
        description: '',
        cost: '',
        labor_hours: '',
        mileage: '',
        technician_notes: '',
      });
    } catch (error) {
      console.error('Error creating service record:', error);
      toast({
        title: "Error",
        description: "Failed to create service record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service Record</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle">Vehicle *</Label>
              <Select 
                value={formData.vehicle_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle_id: value }))}
              >
                <SelectTrigger>
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
            </div>
            
            <div>
              <Label htmlFor="service_type">Service Type *</Label>
              <Select 
                value={formData.service_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="brake_service">Brake Service</SelectItem>
                  <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                  <SelectItem value="general_maintenance">General Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Service description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cost">Cost ($)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="labor_hours">Labor Hours</Label>
              <Input
                id="labor_hours"
                type="number"
                step="0.5"
                value={formData.labor_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, labor_hours: e.target.value }))}
                placeholder="0.0"
              />
            </div>
            
            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="technician_notes">Technician Notes</Label>
            <Textarea
              id="technician_notes"
              value={formData.technician_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, technician_notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Service Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordModal;
