import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import type { ChatConversationWithParticipants, ChatMessageWithSender } from '@/types/database';

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

  // Simplified conversations query with tenant_id filtering
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations', user?.id, profile?.tenant_id],
    queryFn: async (): Promise<ChatConversationWithParticipants[]> => {
      if (!user || !profile?.tenant_id) return [];

      console.log('Fetching conversations for user:', user.id, 'tenant:', profile.tenant_id);

      // First, get conversations where user is a participant AND within their tenant
      const { data: participantData, error: participantError } = await supabase
        .from('chat_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (participantError) {
        console.error('Error fetching user participations:', participantError);
        return [];
      }

      if (!participantData || participantData.length === 0) {
        return [];
      }

      const conversationIds = participantData.map(p => p.conversation_id);

      // Then get the conversation details with tenant_id filtering
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('chat_conversations')
        .select('*')
        .in('id', conversationIds)
        .eq('tenant_id', profile.tenant_id) // Enforce tenant isolation
        .order('updated_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        return [];
      }

      // For each conversation, get the participants separately
      const conversationsWithParticipants = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { data: participants, error: partError } = await supabase
            .from('chat_participants')
            .select(`
              user_id,
              profiles!inner(*)
            `)
            .eq('conversation_id', conv.id)
            .eq('profiles.tenant_id', profile.tenant_id); // Ensure participants are from same tenant

          if (partError) {
            console.error('Error fetching participants for conversation:', conv.id, partError);
            return { ...conv, chat_participants: [] };
          }

          return { 
            ...conv, 
            chat_participants: participants?.map(p => ({
              user_id: p.user_id,
              profiles: p.profiles
            })) || [] 
          };
        })
      );

      console.log('User conversations:', conversationsWithParticipants);
      return conversationsWithParticipants;
    },
    enabled: !!user && !!profile?.tenant_id,
  });

  // Fetch messages for selected conversation with tenant validation
  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['messages', selectedConversation, profile?.tenant_id],
    queryFn: async (): Promise<ChatMessageWithSender[]> => {
      if (!selectedConversation || !profile?.tenant_id) return [];

      // Verify conversation belongs to user's tenant before fetching messages
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('id, tenant_id')
        .eq('id', selectedConversation)
        .eq('tenant_id', profile.tenant_id)
        .single();

      if (convError || !conversation) {
        console.error('Conversation not found or access denied:', convError);
        return [];
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles!sender_id(*)
        `)
        .eq('conversation_id', selectedConversation)
        .eq('profiles.tenant_id', profile.tenant_id) // Ensure sender is from same tenant
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }

      return (data || []).map(msg => ({
        ...msg,
        sender: msg.profiles
      }));
    },
    enabled: !!selectedConversation && !!profile?.tenant_id,
  });

  // Fetch appointment with tenant validation
  const { data: appointment } = useQuery({
    queryKey: ['appointment', appointmentId, profile?.tenant_id],
    queryFn: async () => {
      if (!appointmentId || !profile?.tenant_id) return appointmentContext;

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .eq('tenant_id', profile.tenant_id) // Enforce tenant isolation
        .single();

      if (error) {
        console.error('Error fetching appointment or access denied:', error);
        return appointmentContext;
      }

      return data;
    },
    enabled: !!appointmentId && !!profile?.tenant_id,
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
          tenant_id: profile.tenant_id, // Ensure chat belongs to user's tenant
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
    if (!selectedConversation || !user || !content.trim() || !profile?.tenant_id) return;

    try {
      // Verify conversation belongs to user's tenant before sending message
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .select('id, tenant_id')
        .eq('id', selectedConversation)
        .eq('tenant_id', profile.tenant_id)
        .single();

      if (convError || !conversation) {
        throw new Error('Cannot send message: conversation access denied');
      }

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
        .eq('id', selectedConversation)
        .eq('tenant_id', profile.tenant_id); // Ensure we only update our tenant's conversation

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
