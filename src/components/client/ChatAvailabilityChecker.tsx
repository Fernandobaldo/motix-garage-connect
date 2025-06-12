
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { hasAccess } from '@/utils/permissions';

interface ChatAvailabilityCheckerProps {
  appointment: any;
  onChatAvailable: () => void;
}

const ChatAvailabilityChecker = ({ appointment, onChatAvailable }: ChatAvailabilityCheckerProps) => {
  // Fetch workshop's tenant subscription plan
  const { data: workshopTenant, isLoading } = useQuery({
    queryKey: ['workshopTenant', appointment.workshop?.tenant_id],
    queryFn: async () => {
      if (!appointment.workshop?.tenant_id) return null;
      
      const { data, error } = await supabase
        .from('tenants')
        .select('subscription_plan')
        .eq('id', appointment.workshop.tenant_id)
        .single();

      if (error) {
        console.error('Error fetching workshop tenant:', error);
        return null;
      }

      return data;
    },
    enabled: !!appointment.workshop?.tenant_id,
  });

  if (isLoading) {
    return (
      <Button disabled variant="outline" size="sm">
        <MessageSquare className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    );
  }

  const workshopPlan = workshopTenant?.subscription_plan || 'free';
  const canUseChat = hasAccess(workshopPlan, 'chat');

  if (canUseChat) {
    return (
      <Button onClick={onChatAvailable} variant="outline" size="sm">
        <MessageSquare className="mr-2 h-4 w-4" />
        Chat with Workshop
      </Button>
    );
  }

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Chat is not available for this workshop. Please contact them directly at {appointment.workshop?.phone || 'their phone number'}.
      </AlertDescription>
    </Alert>
  );
};

export default ChatAvailabilityChecker;
