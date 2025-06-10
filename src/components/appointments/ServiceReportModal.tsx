
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface ServiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onSuccess: () => void;
}

interface PartUsed {
  name: string;
  quantity: number;
  price: number;
}

const ServiceReportModal = ({ isOpen, onClose, appointmentId, onSuccess }: ServiceReportModalProps) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    description: '',
    laborHours: 0,
    mileage: '',
    cost: 0,
    nextServiceDue: '',
  });
  
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([
    { name: '', quantity: 1, price: 0 }
  ]);

  const addPart = () => {
    setPartsUsed([...partsUsed, { name: '', quantity: 1, price: 0 }]);
  };

  const removePart = (index: number) => {
    setPartsUsed(partsUsed.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: keyof PartUsed, value: string | number) => {
    const updated = [...partsUsed];
    updated[index] = { ...updated[index], [field]: value };
    setPartsUsed(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const serviceData = {
        appointment_id: appointmentId,
        workshop_id: profile?.tenant_id,
        tenant_id: profile?.tenant_id,
        description: formData.description,
        labor_hours: formData.laborHours,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        cost: formData.cost,
        completed_at: new Date().toISOString(),
        next_service_due_at: formData.nextServiceDue ? new Date(formData.nextServiceDue).toISOString() : null,
        parts_used: JSON.stringify(partsUsed.filter(part => part.name.trim() !== '')) as any,
      };

      const { error } = await supabase
        .from('service_history')
        .insert(serviceData);

      if (error) {
        console.error('Service report creation error:', error);
        throw new Error(`Failed to create service report: ${error.message}`);
      }

      toast({
        title: "Service Report Created",
        description: "The service report has been successfully submitted.",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error in service report creation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create service report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Service Report</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Service Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the service performed..."
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Labor Hours</Label>
              <Input
                type="number"
                step="0.5"
                value={formData.laborHours}
                onChange={(e) => setFormData({ ...formData, laborHours: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Current Mileage</Label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                placeholder="Enter current mileage"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Total Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label>Next Service Due Date</Label>
              <Input
                type="date"
                value={formData.nextServiceDue}
                onChange={(e) => setFormData({ ...formData, nextServiceDue: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Parts Used</Label>
              <Button type="button" onClick={addPart} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Part
              </Button>
            </div>
            
            <div className="space-y-3">
              {partsUsed.map((part, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <div className="col-span-2">
                    <Input
                      placeholder="Part name"
                      value={part.name}
                      onChange={(e) => updatePart(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={part.quantity}
                      onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                      min={1}
                    />
                  </div>
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={part.price}
                      onChange={(e) => updatePart(index, 'price', parseFloat(e.target.value) || 0)}
                    />
                    {partsUsed.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePart(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !formData.description.trim()}
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
