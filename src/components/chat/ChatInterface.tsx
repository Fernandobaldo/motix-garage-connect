
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, Plus } from 'lucide-react';
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

  // Fix: Add new chat functionality
  const handleCreateNewChat = async () => {
    if (!user) return;

    try {
      // Create new conversation
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          title: `New Chat - ${new Date().toLocaleDateString()}`,
          tenant_id: user.id, // This should be properly set based on tenant
          appointment_id: appointmentId || null
        })
        .select()
        .single();

      if (error) throw error;

      // Add current user as participant
      await supabase
        .from('chat_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id
        });

      // Refresh conversations list
      // This would trigger a refetch in the actual implementation
      setSelectedConversation(conversation.id);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
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
      <div className="space-y-4">
        {/* Fix: Add new chat button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Messages</h3>
          <Button onClick={handleCreateNewChat} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ConversationsList 
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
            currentUserId={user?.id}
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Messages</h3>
        <Button onClick={handleCreateNewChat} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Chat</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ConversationsList 
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          currentUserId={user?.id}
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
    </div>
  );
};

export default ChatInterface;
