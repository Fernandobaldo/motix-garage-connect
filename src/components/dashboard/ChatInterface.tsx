
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, User, Bot, Users } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';

interface ChatInterfaceProps {
  userRole: 'client' | 'workshop';
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  created_at: string;
  sender?: {
    full_name: string;
    role: string;
  };
}

const ChatInterface = ({ userRole }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { tenant } = useTenant();

  const fetchConversations = async () => {
    if (!user || !tenant) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      setConversations(data || []);
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:profiles(full_name, role)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (tenant) {
      fetchConversations();
    }
  }, [user, tenant]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: message,
          message_type: 'text'
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      setMessage('');
      await fetchMessages(selectedConversation);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-600">
            {userRole === 'client' ? 'Chat with workshops' : 'Chat with clients'}
          </p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          New Conversation
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Conversations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-b ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {userRole === 'client' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {conversation.title || `Conversation ${conversation.id.slice(0, 8)}`}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {new Date(conversation.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {userRole === 'client' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {tenant?.name || 'Conversation'}
                    </CardTitle>
                    <CardDescription>Tenant: {tenant?.name}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Messages Area */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No messages in this conversation
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender_id === user?.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.sender_id !== user?.id && (
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {msg.sender?.full_name || 'Unknown'}
                            </p>
                          )}
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-6 flex items-center justify-center h-96">
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
