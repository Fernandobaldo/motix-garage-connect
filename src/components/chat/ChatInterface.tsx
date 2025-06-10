
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';

interface ChatInterfaceProps {
  appointmentId?: string;
}

const ChatInterface = ({ appointmentId }: ChatInterfaceProps) => {
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState([]);

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

  const handleSendMessage = () => {
    // Implementation for sending messages
  };

  const handleFileUploaded = () => {
    // Implementation for file uploads
  };

  const handleTranslationComplete = () => {
    // Implementation for translation completion
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ConversationsList 
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
        />
        <ChatWindow
          selectedConversation={selectedConversation}
          conversations={conversations}
          messages={messages}
          currentUserId={user?.id}
          onSendMessage={handleSendMessage}
          onFileUploaded={handleFileUploaded}
          onTranslationComplete={handleTranslationComplete}
        />
      </div>
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ConversationsList 
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <ChatWindow
        selectedConversation={selectedConversation}
        conversations={conversations}
        messages={messages}
        currentUserId={user?.id}
        onSendMessage={handleSendMessage}
        onFileUploaded={handleFileUploaded}
        onTranslationComplete={handleTranslationComplete}
      />
    </div>
  );
};

export default ChatInterface;
