
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';
import ChatAccessRestriction from './ChatAccessRestriction';
import ChatHeader from './ChatHeader';
import { useChatInterface } from '@/hooks/useChatInterface';
import type { ChatInterfaceProps } from '@/types/database';

const ChatInterface = ({ appointmentId }: ChatInterfaceProps) => {
  const {
    user,
    selectedConversation,
    setSelectedConversation,
    conversations,
    messages,
    appointment,
    canAccessChat,
    handleCreateNewChat,
    handleSendMessage,
  } = useChatInterface(appointmentId);

  const handleFileUploaded = (fileUrl: string, fileName: string, fileType: string) => {
    handleSendMessage(fileName, 'file', fileUrl, fileName);
  };

  const handleTranslationComplete = () => {
    // Implementation for translation completion
  };

  // Check if chat access is restricted
  if (appointmentId && appointment && !canAccessChat()) {
    return <ChatAccessRestriction appointment={appointment} />;
  }

  return (
    <div className="space-y-4">
      <ChatHeader 
        appointment={appointment}
        onCreateNewChat={handleCreateNewChat}
      />
      
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
