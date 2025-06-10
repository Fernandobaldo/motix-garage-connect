
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAppointmentActions = (refetch: () => void) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChatClick = (appointment: any) => {
    // Navigate to messages tab with appointment context
    const currentPath = window.location.pathname;
    if (currentPath === '/') {
      // If on main page, change tab to messages
      const messagesTab = document.querySelector('[value="messages"]') as HTMLElement;
      if (messagesTab) {
        messagesTab.click();
      }
    } else {
      // Navigate to main page with messages tab
      navigate('/?tab=messages&appointment=' + appointment.id);
    }
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
