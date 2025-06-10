
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Appointment {
  id: string;
  service_type: string;
  vehicle_id: string | null;
  workshop_id: string;
  scheduled_at: string;
}

interface ServiceReportModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface PartUsed {
  name: string;
  quantity: number;
  cost: number;
}

const ServiceReportModal = ({ appointment, isOpen, onClose, onComplete }: ServiceReportModalProps) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [mileage, setMileage] = useState<number>(0);
  const [cost, setCost] = useState<number>(0);
  const [laborHours, setLaborHours] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [newPart, setNewPart] = useState({ name: '', quantity: 1, cost: 0 });

  const addPart = () => {
    if (newPart.name) {
      setPartsUsed([...partsUsed, newPart]);
      setNewPart({ name: '', quantity: 1, cost: 0 });
    }
  };

  const removePart = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('service_history')
        .insert({
          appointment_id: appointment.id,
          vehicle_id: appointment.vehicle_id,
          workshop_id: appointment.workshop_id,
          tenant_id: profile?.tenant_id,
          service_type: appointment.service_type,
          description,
          technician_notes: technicianNotes,
          mileage: mileage || null,
          cost: cost || null,
          labor_hours: laborHours || null,
          parts_used: partsUsed,
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Service Report Completed',
        description: 'The service report has been submitted and appointment marked as completed.',
      });

      onComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Report Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Service Report</DialogTitle>
          <DialogDescription>
            Fill out the service completion details for this appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Current Mileage</Label>
              <Input
                type="number"
                value={mileage || ''}
                onChange={(e) => setMileage(parseInt(e.target.value) || 0)}
                placeholder="Enter mileage"
              />
            </div>
            <div>
              <Label>Total Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={cost || ''}
                onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                placeholder="Enter total cost"
              />
            </div>
            <div>
              <Label>Labor Hours</Label>
              <Input
                type="number"
                step="0.1"
                value={laborHours || ''}
                onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                placeholder="Enter labor hours"
              />
            </div>
          </div>

          <div>
            <Label>Service Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work performed..."
              rows={3}
              required
            />
          </div>

          <div>
            <Label>Technician Notes</Label>
            <Textarea
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="Any additional notes or recommendations..."
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Parts Used</Label>
            
            {partsUsed.length > 0 && (
              <div className="space-y-2">
                {partsUsed.map((part, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Badge variant="outline">{part.name}</Badge>
                    <span className="text-sm">Qty: {part.quantity}</span>
                    <span className="text-sm">Cost: ${part.cost}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePart(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                placeholder="Part name"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={newPart.quantity}
                onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Cost"
                value={newPart.cost || ''}
                onChange={(e) => setNewPart({ ...newPart, cost: parseFloat(e.target.value) || 0 })}
              />
              <Button type="button" onClick={addPart} disabled={!newPart.name}>
                Add Part
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !description}
            >
              {loading ? 'Submitting...' : 'Complete Service'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceReportModal;
