
import ChatInterface from '@/components/chat/ChatInterface';

interface ChatInterfaceProps {
  userRole: 'client' | 'workshop';
}

const DashboardChatInterface = ({ userRole }: ChatInterfaceProps) => {
  return <ChatInterface userRole={userRole} />;
};

export default DashboardChatInterface;
