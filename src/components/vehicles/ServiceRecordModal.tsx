
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import LicensePlateSearchField from '@/components/common/LicensePlateSearchField';

interface ServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialVehicleId?: string;
}

const ServiceRecordModal = ({ isOpen, onClose, onSuccess, initialVehicleId }: ServiceRecordModalProps) => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; type: 'auth' | 'guest' } | null>(null);

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    cost: '',
    mileage: '',
    laborHours: '',
    technicianNotes: '',
    partsUsed: '',
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        serviceType: '',
        description: '',
        cost: '',
        mileage: '',
        laborHours: '',
        technicianNotes: '',
        partsUsed: '',
      });
      setSelectedVehicle(null);
      setSelectedClient(null);
    }
  }, [isOpen]);

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
  };

  const handleClientSelect = (clientId: string, clientName: string, clientType: 'auth' | 'guest') => {
    setSelectedClient({ id: clientId, name: clientName, type: clientType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicle || !selectedClient) {
      toast.error('Please select a vehicle using the license plate search');
      return;
    }

    if (!profile?.tenant_id) {
      toast.error('Unable to create service record - no workshop selected');
      return;
    }

    setIsSubmitting(true);

    try {
      const partsArray = formData.partsUsed 
        ? formData.partsUsed.split(',').map(part => ({ name: part.trim() }))
        : [];

      const { error } = await supabase
        .from('service_records')
        .insert({
          tenant_id: profile.tenant_id,
          vehicle_id: selectedVehicle.vehicle_id,
          workshop_id: profile.id,
          client_id: selectedClient.id,
          service_type: formData.serviceType,
          description: formData.description,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          mileage: formData.mileage ? parseInt(formData.mileage) : null,
          labor_hours: formData.laborHours ? parseFloat(formData.laborHours) : null,
          technician_notes: formData.technicianNotes || null,
          parts_used: partsArray,
          status: 'pending',
        });

      if (error) throw error;

      toast.success('Service record created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating service record:', error);
      toast.error('Failed to create service record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Service Record</DialogTitle>
          <DialogDescription>
            Add a new service record for a vehicle
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <LicensePlateSearchField
              label="Search Vehicle by License Plate"
              placeholder="Enter license plate to find vehicle and client..."
              onVehicleSelect={handleVehicleSelect}
              onClientSelect={handleClientSelect}
              required
            />

            {selectedVehicle && selectedClient && (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Vehicle:</span>
                      <span>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">License Plate:</span>
                      <Badge variant="outline">{selectedVehicle.license_plate}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Client:</span>
                      <div className="flex items-center space-x-2">
                        <span>{selectedClient.name}</span>
                        <Badge variant={selectedClient.type === 'auth' ? 'default' : 'secondary'} className="text-xs">
                          {selectedClient.type === 'auth' ? 'Account' : 'Guest'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="serviceType">Service Type *</Label>
              <Input
                id="serviceType"
                placeholder="e.g., Oil Change, Brake Repair"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the service performed..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mileage">Current Mileage</Label>
              <Input
                id="mileage"
                type="number"
                min="0"
                placeholder="e.g., 50000"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="laborHours">Labor Hours</Label>
              <Input
                id="laborHours"
                type="number"
                step="0.5"
                min="0"
                placeholder="e.g., 2.5"
                value={formData.laborHours}
                onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="partsUsed">Parts Used</Label>
            <Input
              id="partsUsed"
              placeholder="Comma-separated list: Oil Filter, Brake Pads, etc."
              value={formData.partsUsed}
              onChange={(e) => setFormData({ ...formData, partsUsed: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="technicianNotes">Technician Notes</Label>
            <Textarea
              id="technicianNotes"
              placeholder="Internal notes, observations, recommendations..."
              value={formData.technicianNotes}
              onChange={(e) => setFormData({ ...formData, technicianNotes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedVehicle || !selectedClient}
            >
              {isSubmitting ? 'Creating...' : 'Create Service Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceRecordModal;
