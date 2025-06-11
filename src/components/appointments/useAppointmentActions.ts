
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAppointmentActions = (refetch: () => void) => {
  const { toast } = useToast();

  const handleChatClick = (appointment: any) => {
    console.log('Chat clicked for appointment:', appointment.id);
    
    // Store appointment context for chat interface
    sessionStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    
    // Trigger a custom event to switch to messages tab with appointment context
    const event = new CustomEvent('switchToChat', { 
      detail: { 
        appointmentId: appointment.id,
        appointment: appointment
      } 
    });
    
    console.log('Dispatching switchToChat event:', event.detail);
    window.dispatchEvent(event);
    
    // Show feedback to user
    toast({
      title: 'Opening Chat',
      description: 'Switching to messages for this appointment.',
    });
  };

  const handleDelete = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: 'Appointment Deleted',
        description: 'The appointment has been successfully deleted.',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = () => {
    refetch();
  };

  return {
    handleChatClick,
    handleDelete,
    handleStatusUpdate,
  };
};
