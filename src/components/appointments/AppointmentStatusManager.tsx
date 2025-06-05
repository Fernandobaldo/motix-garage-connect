
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, Play, Pause } from 'lucide-react';

interface AppointmentStatusManagerProps {
  appointmentId: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
}

const AppointmentStatusManager = ({ 
  appointmentId, 
  currentStatus, 
  onStatusUpdate 
}: AppointmentStatusManagerProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'in_progress', label: 'In Progress', icon: Play, color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800' },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
  ];

  const currentStatusInfo = statusOptions.find(option => option.value === currentStatus);
  const StatusIcon = currentStatusInfo?.icon || Clock;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) {
        toast({
          title: 'Status Update Failed',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }

      onStatusUpdate(newStatus);
      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update appointment status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <Badge className={currentStatusInfo?.color}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {currentStatusInfo?.label}
      </Badge>
      
      <Select 
        value={currentStatus} 
        onValueChange={handleStatusChange}
        disabled={loading}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Change status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => {
            const OptionIcon = option.icon;
            return (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center space-x-2">
                  <OptionIcon className="h-4 w-4" />
                  <span>{option.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AppointmentStatusManager;
