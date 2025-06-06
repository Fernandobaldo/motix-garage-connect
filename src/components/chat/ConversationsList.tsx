
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, MessageSquare, User } from "lucide-react";

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  participants?: Participant[];
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

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  currentUserId?: string;
}

const ConversationsList = ({ 
  conversations, 
  selectedConversation, 
  onSelectConversation,
  currentUserId 
}: ConversationsListProps) => {
  const getConversationPartner = (conversation: Conversation) => {
    const partner = conversation.participants?.find(p => p.user_id !== currentUserId);
    return partner?.user?.full_name || 'Unknown User';
  };

  return (
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
                onClick={() => onSelectConversation(conversation.id)}
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
  );
};

export default ConversationsList;
