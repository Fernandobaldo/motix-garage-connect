
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';

export const useChatInterface = (appointmentId?: string | null) => {
  const { user, profile } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [appointmentContext, setAppointmentContext] = useState<any>(null);

  useEffect(() => {
    if (appointmentId) {
      const storedAppointment = sessionStorage.getItem('selectedAppointment');
      if (storedAppointment) {
        try {
          setAppointmentContext(JSON.parse(storedAppointment));
        } catch (error) {
          console.error('Error parsing stored appointment:', error);
        }
      }
    }
  }, [appointmentId]);

  // Fetch conversations for the current user with proper join
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', user?.id, profile?.tenant_id],
    queryFn: async () => {
      if (!user || !profile?.tenant_id) return [];

      console.log('Fetching conversations for user:', user.id, 'tenant:', profile.tenant_id);

      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_participants(
            user_id,
            profiles(
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

      // Filter conversations where user is a participant
      const userConversations = data?.filter(conv => 
        conv.chat_participants?.some((p: any) => p.user_id === user.id)
      ) || [];

      console.log('User conversations:', userConversations);
      return userConversations;
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
          profiles(
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
      if (!appointmentId) return appointmentContext;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (error) {
        console.error('Error fetching appointment:', error);
        return appointmentContext;
      }

      return data;
    },
    enabled: !!appointmentId,
  });

  const handleCreateNewChat = async () => {
    if (!user || !profile?.tenant_id) {
      toast({
        title: 'Error',
        description: 'Please ensure you are logged in and have a valid profile',
        variant: 'destructive'
      });
      return;
    }

    try {
      const currentAppointment = appointment || appointmentContext;
      
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          title: currentAppointment 
            ? `Chat for ${currentAppointment.service_type} appointment` 
            : `New Chat - ${new Date().toLocaleDateString()}`,
          tenant_id: profile.tenant_id,
          appointment_id: currentAppointment?.id || null
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      // Add current user as participant
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert({
          conversation_id: conversation.id,
          user_id: user.id
        });

      if (participantError) {
        console.error('Error adding participant:', participantError);
        throw participantError;
      }

      await refetchConversations();
      setSelectedConversation(conversation.id);
      
      toast({
        title: 'Success',
        description: 'New chat created successfully',
      });
    } catch (error: any) {
      console.error('Error creating new chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async (content: string, messageType = 'text', fileUrl?: string, fileName?: string) => {
    if (!selectedConversation || !user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: content.trim(),
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
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message: ' + error.message,
        variant: 'destructive'
      });
    }
  };

  const canAccessChat = () => {
    const currentAppointment = appointment || appointmentContext;
    if (!currentAppointment) return true; // Allow general chat
    return currentAppointment.status === 'confirmed' || 
           currentAppointment.status === 'in_progress' || 
           currentAppointment.status === 'completed';
  };

  return {
    user,
    selectedConversation,
    setSelectedConversation,
    conversations,
    messages,
    appointment: appointment || appointmentContext,
    canAccessChat,
    handleCreateNewChat,
    handleSendMessage,
  };
};
