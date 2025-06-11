
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
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
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { sendNotification } = useNotificationSender();

  const getConfirmationMessage = (newStatus: string) => {
    switch (newStatus) {
      case 'completed':
        return 'Are you sure you want to mark this appointment as completed? This action will finalize the service.';
      case 'cancelled':
        return 'Are you sure you want to cancel this appointment? This action cannot be undone.';
      case 'in_progress':
        return 'Mark this appointment as in progress? This will notify the client that work has started.';
      default:
        return `Are you sure you want to change the status to ${newStatus}?`;
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) return;
    
    setPendingStatus(newStatus);
    setShowConfirmation(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;

    setIsUpdating(true);
    setShowConfirmation(false);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: pendingStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      // Send notification based on status change
      let triggerEvent = '';
      switch (pendingStatus) {
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
        sendNotification(appointmentId, triggerEvent);
      }

      onStatusUpdate(pendingStatus);
      
      toast({
        title: 'Status Updated',
        description: `Appointment status changed to ${pendingStatus}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
    }
  };

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus);

  return (
    <>
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

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus && getConfirmationMessage(pendingStatus)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentStatusManager;
