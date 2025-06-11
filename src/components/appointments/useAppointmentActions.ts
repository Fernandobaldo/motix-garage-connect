
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAppointmentActions = (refetch: () => void) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChatClick = (appointment: any) => {
    // Store appointment context in sessionStorage for chat interface
    sessionStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    
    // Navigate to messages tab by updating the URL hash
    const url = new URL(window.location.href);
    url.searchParams.set('tab', 'messages');
    url.searchParams.set('appointment', appointment.id);
    window.history.pushState({}, '', url.toString());
    
    // Trigger a custom event to notify the tab change
    window.dispatchEvent(new CustomEvent('tabChange', { detail: 'messages' }));
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
