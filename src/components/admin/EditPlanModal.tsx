
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WorkshopData {
  id: string;
  name: string;
  subscription_plan: string;
  status: string;
  trial_until: string | null;
}

interface EditPlanModalProps {
  workshop: WorkshopData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPlanModal = ({ workshop, open, onOpenChange }: EditPlanModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState(workshop.subscription_plan);
  const [trialUntil, setTrialUntil] = useState(
    workshop.trial_until ? format(new Date(workshop.trial_until), 'yyyy-MM-dd') : ''
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePlanMutation = useMutation({
    mutationFn: async () => {
      const trialDate = trialUntil ? new Date(trialUntil).toISOString() : null;
      
      const { error } = await supabase.rpc('update_workshop_plan', {
        p_tenant_id: workshop.id,
        p_new_plan: selectedPlan,
        p_trial_until: trialDate
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-workshops'] });
      toast({
        title: "Plan Updated",
        description: `Workshop plan has been updated to ${selectedPlan.toUpperCase()}.`,
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update workshop plan",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlanMutation.mutate();
  };

  const plans = [
    { value: 'free', label: 'Free', description: '20 appointments/month, 5 vehicles' },
    { value: 'starter', label: 'Starter', description: '50 appointments/month, 10 vehicles' },
    { value: 'pro', label: 'Pro', description: '200 appointments/month, 50 vehicles' },
    { value: 'enterprise', label: 'Enterprise', description: 'Unlimited everything' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Plan - {workshop.name}</DialogTitle>
          <DialogDescription>
            Update the subscription plan and trial period for this workshop.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan">Subscription Plan</Label>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.value} value={plan.value}>
                    <div>
                      <div className="font-medium">{plan.label}</div>
                      <div className="text-sm text-muted-foreground">{plan.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trial">Trial Until (Optional)</Label>
            <Input
              id="trial"
              type="date"
              value={trialUntil}
              onChange={(e) => setTrialUntil(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
            <p className="text-sm text-muted-foreground">
              Set a trial period for enhanced features
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatePlanMutation.isPending}>
              {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlanModal;
