
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useNotificationSender = () => {
  const sendNotification = async (
    appointmentId: string,
    triggerEvent: string,
    recipientEmail?: string,
    recipientPhone?: string
  ) => {
    console.log('Sending notification:', { appointmentId, triggerEvent });
    
    try {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: {
          appointmentId,
          triggerEvent,
          recipientEmail,
          recipientPhone,
        },
      });

      if (error) {
        console.error('Notification sending failed:', error);
        toast({
          title: 'Notification Error',
          description: 'Failed to send notification',
          variant: 'destructive',
        });
        return false;
      }

      console.log('Notification sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Error invoking notification function:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { sendNotification };
};
