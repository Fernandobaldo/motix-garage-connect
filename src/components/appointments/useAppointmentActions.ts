
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAppointmentActions = (refetch: () => void) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChatClick = (appointment: any) => {
    // Store appointment context for chat interface
    sessionStorage.setItem('selectedAppointment', JSON.stringify(appointment));
    
    // Trigger a custom event to switch to messages tab with appointment context
    window.dispatchEvent(new CustomEvent('switchToChat', { 
      detail: { 
        appointmentId: appointment.id,
        appointment: appointment
      } 
    }));
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
