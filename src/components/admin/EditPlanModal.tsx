
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SuperAdminWorkshopData } from '@/hooks/useSuperAdminWorkshops';

interface EditPlanModalProps {
  workshop: SuperAdminWorkshopData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPlanModal = ({ workshop, open, onOpenChange }: EditPlanModalProps) => {
  const [newPlan, setNewPlan] = useState(workshop.tenant_plan);

  const handleSave = () => {
    // Plan update logic would go here
    console.log('Updating plan for workshop:', workshop.tenant_id, 'to:', newPlan);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Plan - {workshop.tenant_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Plan: {workshop.tenant_plan}</label>
          </div>
          <Select value={newPlan} onValueChange={setNewPlan}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanModal;
