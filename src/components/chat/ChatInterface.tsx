
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertCircle, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';

interface ChatInterfaceProps {
  appointmentId?: string | null;
}

const ChatInterface = ({ appointmentId }: ChatInterfaceProps) => {
  const { user, profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Fetch conversations for the current user
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', user?.id, profile?.tenant_id],
    queryFn: async () => {
      if (!user || !profile?.tenant_id) return [];

      console.log('Fetching conversations for user:', user.id, 'tenant:', profile.tenant_id);

      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_participants!inner(
            user_id,
            profiles!chat_participants_user_id_fkey(
              id,
              full_name,
              role
            )
          )
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }

      console.log('Raw conversations data:', data);
      return data || [];
    },
    enabled: !!user && !!profile?.tenant_id,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!chat_messages_sender_id_fkey(
            full_name,
            role
          )
        `)
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!selectedConversation,
  });

  // Fetch appointment if appointmentId is provided
  const { data: appointment } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (error) {
        console.error('Error fetching appointment:', error);
        return null;
      }

      return data;
    },
    enabled: !!appointmentId,
  });

  const canAccessChat = () => {
    if (!appointment) return true; // Allow general chat
    return appointment.status === 'confirmed' || appointment.status === 'in_progress' || appointment.status === 'completed';
  };

  const handleCreateNewChat = async () => {
    if (!user || !profile?.tenant_id) return;

    try {
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          title: `New Chat - ${new Date().toLocaleDateString()}`,
          tenant_id: profile.tenant_id,
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

      await refetchConversations();
      setSelectedConversation(conversation.id);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSendMessage = async (content: string, messageType = 'text', fileUrl?: string, fileName?: string) => {
    if (!selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      await refetchMessages();
      await refetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUploaded = (fileUrl: string, fileName: string, fileType: string) => {
    handleSendMessage(fileName, 'file', fileUrl, fileName);
  };

  const handleTranslationComplete = () => {
    // Implementation for translation completion
  };

  if (appointmentId && appointment && !canAccessChat()) {
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
