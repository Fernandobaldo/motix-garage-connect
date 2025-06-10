
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ChatWindow from './ChatWindow';

interface ChatInterfaceProps {
  appointmentId?: string;
}

const ChatInterface = ({ appointmentId }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single();

        if (error) throw error;
        setAppointment(data);
      } catch (error) {
        console.error('Error fetching appointment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const canAccessChat = () => {
    if (!appointment) return false;
    return appointment.status === 'confirmed' || appointment.status === 'in_progress';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!appointmentId || !appointment) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select an appointment to start chatting</p>
        </CardContent>
      </Card>
    );
  }

  if (!canAccessChat()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span>Chat Not Available</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-600">
              Chat is only available for confirmed appointments.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Current status:</span>
              <Badge 
                className={
                  appointment.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {appointment.status}
              </Badge>
            </div>
            {appointment.status === 'pending' && (
              <p className="text-sm text-gray-500">
                Please wait for the workshop to confirm your appointment.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showChat) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Appointment Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Chat with the workshop about your {appointment.service_type} appointment.
            </p>
            <Button onClick={() => setShowChat(true)} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ChatWindow appointment={appointment} onClose={() => setShowChat(false)} />;
};

export default ChatInterface;
