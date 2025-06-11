
import { useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, MessageSquare } from "lucide-react";
import MessageItem from './MessageItem';
import MessageInput from './MessageInput';
import type { ChatConversationWithParticipants, ChatMessageWithSender } from '@/types/database';

interface ChatWindowProps {
  selectedConversation: string | null;
  conversations: ChatConversationWithParticipants[];
  messages: ChatMessageWithSender[];
  currentUserId?: string;
  onSendMessage: (content: string, messageType?: string, fileUrl?: string, fileName?: string) => void;
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
  onTranslationComplete: (messageId: string, translatedText: string, targetLanguage: string) => void;
}

const ChatWindow = ({ 
  selectedConversation, 
  conversations, 
  messages, 
  currentUserId,
  onSendMessage,
  onFileUploaded,
  onTranslationComplete
}: ChatWindowProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getConversationPartner = (conversation: ChatConversationWithParticipants) => {
    const partner = conversation.chat_participants?.find(p => p.user_id !== currentUserId);
    return partner?.profiles?.full_name || 'Unknown User';
  };

  const selectedConv = conversations.find(c => c.id === selectedConversation);

  return (
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
                  {selectedConv?.title || (selectedConv ? getConversationPartner(selectedConv) : '')}
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
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isCurrentUser={msg.sender_id === currentUserId}
                    onTranslationComplete={onTranslationComplete}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <MessageInput
              onSendMessage={onSendMessage}
              onFileUploaded={onFileUploaded}
              disabled={!selectedConversation}
            />
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
  );
};

export default ChatWindow;
