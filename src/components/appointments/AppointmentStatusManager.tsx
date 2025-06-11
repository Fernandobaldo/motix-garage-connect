
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNotificationSender } from '@/hooks/useNotificationSender';
import { ChevronDown } from 'lucide-react';

interface AppointmentStatusManagerProps {
  appointmentId: string;
  currentStatus: string;
  onStatusUpdate: (newStatus: string) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

const AppointmentStatusManager = ({ 
  appointmentId, 
  currentStatus, 
  onStatusUpdate 
}: AppointmentStatusManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { sendNotification } = useNotificationSender();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Send notification based on status change
      let triggerEvent = '';
      switch (newStatus) {
        case 'confirmed':
          triggerEvent = 'appointment_confirmed';
          break;
        case 'in_progress':
          triggerEvent = 'appointment_in_progress';
          break;
        case 'completed':
          triggerEvent = 'appointment_completed';
          break;
        case 'cancelled':
          triggerEvent = 'appointment_cancelled';
          break;
      }

      if (triggerEvent) {
        // Send notification asynchronously
        sendNotification(appointmentId, triggerEvent);
      }

      onStatusUpdate(newStatus);
      
      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isUpdating}
          className="flex items-center space-x-2"
        >
          <Badge className={currentStatusOption?.color || 'bg-gray-100 text-gray-800'}>
            {currentStatusOption?.label || currentStatus}
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {statusOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className={option.value === currentStatus ? 'bg-gray-100' : ''}
          >
            <Badge className={`${option.color} mr-2`}>
              {option.label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AppointmentStatusManager;
