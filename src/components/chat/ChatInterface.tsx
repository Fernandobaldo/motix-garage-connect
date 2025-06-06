import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Plus, User, Bot, Users, MessageSquare, Download, Image, FileText, Video } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RealtimeChannel } from '@supabase/supabase-js';
import FileUpload from './FileUpload';
import MessageTranslation from './MessageTranslation';

interface ChatInterfaceProps {
  userRole: 'client' | 'workshop';
}

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  participants?: Participant[];
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  message_type: string;
  created_at: string;
  conversation_id: string;
  file_url?: string;
  file_name?: string;
  translated_content?: any;
  sender?: {
    full_name: string;
    role: string;
  };
}

interface Participant {
  id: string;
  user_id: string;
  conversation_id: string;
  joined_at: string;
  user?: {
    full_name: string;
    role: string;
  };
}

interface Profile {
  id: string;
  full_name: string;
  role: string;
}

const ChatInterface = ({ userRole }: ChatInterfaceProps) => {
  const [message, setMessage] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [newConversationTitle, setNewConversationTitle] = useState('');
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const { user, profile } = useAuth();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchProfiles = async () => {
    if (!tenant) {
      console.log('No tenant available for fetching profiles');
      return;
    }

    try {
      const targetRole = userRole === 'client' ? 'workshop' : 'client';
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('tenant_id', tenant.id)
        .eq('role', targetRole);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      console.log('Fetched profiles:', data);
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const fetchConversations = async () => {
    if (!user || !tenant) {
      console.log('Missing user or tenant for fetching conversations');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching conversations for user:', user.id, 'tenant:', tenant.id);
      
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          id,
          title,
          created_at,
          updated_at,
          tenant_id,
          participants:chat_participants(
            id,
            user_id,
            conversation_id,
            joined_at,
            user:profiles(full_name, role)
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setLoading(false);
        return;
      }

      console.log('Raw conversations data:', data);

      const userConversations = (data || []).filter(conv => 
        conv.participants?.some(p => p.user_id === user.id)
      );

      console.log('Filtered user conversations:', userConversations);
      setConversations(userConversations);
      
      if (userConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(userConversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          id,
          content,
          sender_id,
          message_type,
          created_at,
          conversation_id,
          file_url,
          file_name,
          translated_content,
          sender:profiles(full_name, role)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!selectedConversation) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`conversation-${selectedConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${selectedConversation}`
      }, (payload) => {
        console.log('New message received:', payload);
        fetchMessages(selectedConversation);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations'
      }, (payload) => {
        console.log('Conversation updated:', payload);
        fetchConversations();
      })
      .subscribe();

    channelRef.current = channel;
  };

  useEffect(() => {
    console.log('ChatInterface mounted, user:', user?.id, 'tenant:', tenant?.id);
    
    if (user && tenant) {
      fetchConversations();
      fetchProfiles();
    } else {
      console.log('Missing dependencies for chat initialization');
      setLoading(false);
    }
  }, [user, tenant]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [selectedConversation]);

  const createNewConversation = async () => {
    if (!user || !tenant || !selectedProfileId) return;

    try {
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          title: newConversationTitle || `Chat with ${profiles.find(p => p.id === selectedProfileId)?.full_name}`,
          tenant_id: tenant.id
        })
        .select()
        .single();

      if (convError) {
        toast({
          title: 'Error',
          description: 'Failed to create conversation.',
          variant: 'destructive'
        });
        return;
      }

      const participants = [
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: selectedProfileId }
      ];

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) {
        toast({
          title: 'Error',
          description: 'Failed to add participants.',
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Conversation created successfully!'
      });

      setShowNewConversationDialog(false);
      setNewConversationTitle('');
      setSelectedProfileId('');
      fetchConversations();
      setSelectedConversation(conversation.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation.',
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = async (messageType: string = 'text', fileUrl?: string, fileName?: string) => {
    if ((!message.trim() && !fileUrl) || !selectedConversation || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: selectedConversation,
          sender_id: user.id,
          content: message || fileName || '',
          message_type: messageType,
          file_url: fileUrl,
          file_name: fileName
        });

      if (error) {
        console.error('Error sending message:', error);
        toast({
          title: 'Error',
          description: 'Failed to send message.',
          variant: 'destructive'
        });
        return;
      }

      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConversation);

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUploaded = (fileUrl: string, fileName: string, fileType: string) => {
    const messageType = fileType.startsWith('image/') ? 'image' : 
                       fileType.startsWith('video/') ? 'video' : 'file';
    handleSendMessage(messageType, fileUrl, fileName);
  };

  const handleTranslationComplete = async (messageId: string, translatedText: string, targetLanguage: string) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          translated_content: {
            [targetLanguage]: translatedText
          }
        })
        .eq('id', messageId);

      if (error) {
        console.error('Error saving translation:', error);
        return;
      }

      if (selectedConversation) {
        fetchMessages(selectedConversation);
      }
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const getConversationPartner = (conversation: Conversation) => {
    const partner = conversation.participants?.find(p => p.user_id !== user?.id);
    return partner?.user?.full_name || 'Unknown User';
  };

  const getFileIcon = (messageType: string) => {
    switch (messageType) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const renderMessageContent = (msg: Message) => {
    if (msg.file_url) {
      if (msg.message_type === 'image') {
        return (
          <div className="space-y-2">
            <img 
              src={msg.file_url} 
              alt={msg.file_name || 'Image'} 
              className="max-w-xs rounded-lg cursor-pointer"
              onClick={() => window.open(msg.file_url, '_blank')}
            />
            {msg.file_name && (
              <p className="text-xs opacity-75">{msg.file_name}</p>
            )}
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-2 bg-black bg-opacity-10 p-2 rounded">
            {getFileIcon(msg.message_type)}
            <div className="flex-1">
              <p className="text-sm font-medium">{msg.file_name || 'File'}</p>
              <a 
                href={msg.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs underline opacity-75 hover:opacity-100"
              >
                Download
              </a>
            </div>
          </div>
        );
      }
    }

    return (
      <div>
        <p className="break-words">{msg.content}</p>
        {msg.translated_content && Object.keys(msg.translated_content).length > 0 && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
            <p className="font-medium text-blue-800">Translations:</p>
            {Object.entries(msg.translated_content).map(([lang, translation]) => (
              <p key={lang} className="text-blue-700">
                <strong>{lang.toUpperCase()}:</strong> {translation as string}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Show loading only while initially fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  // Show message if no user or tenant
  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please log in to access messages.</p>
        </div>
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
        <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Conversation</DialogTitle>
              <DialogDescription>
                Choose someone to start a conversation with.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Conversation Title (Optional)</label>
                <Input
                  placeholder="Enter conversation title..."
                  value={newConversationTitle}
                  onChange={(e) => setNewConversationTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Select {userRole === 'client' ? 'Workshop' : 'Client'}
                </label>
                <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Choose a ${userRole === 'client' ? 'workshop' : 'client'}...`} />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createNewConversation} disabled={!selectedProfileId}>
                Create Conversation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Conversations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No conversations yet</p>
                  <p className="text-xs mt-1">Click "New Conversation" to start chatting</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-b transition-colors ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">
                          {conversation.title || getConversationPartner(conversation)}
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
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {conversations.find(c => c.id === selectedConversation)?.title || 
                       getConversationPartner(conversations.find(c => c.id === selectedConversation)!)}
                    </CardTitle>
                    <CardDescription>Click to send a message</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {/* Messages Area */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
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
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium opacity-75">
                                {msg.sender?.full_name || 'Unknown'}
                              </p>
                              <MessageTranslation
                                messageId={msg.id}
                                originalText={msg.content}
                                onTranslationComplete={(translatedText, targetLanguage) => 
                                  handleTranslationComplete(msg.id, translatedText, targetLanguage)
                                }
                              />
                            </div>
                          )}
                          {renderMessageContent(msg)}
                          <p className={`text-xs mt-1 ${
                            msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <FileUpload 
                      onFileUploaded={handleFileUploaded}
                      disabled={!selectedConversation}
                    />
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={() => handleSendMessage()} disabled={!message.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="p-6 flex items-center justify-center h-96">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;
