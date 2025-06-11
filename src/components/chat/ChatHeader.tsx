
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ChatHeaderProps {
  appointment?: any;
  onCreateNewChat: () => void;
}

const ChatHeader = ({ appointment, onCreateNewChat }: ChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-semibold">
        {appointment 
          ? `Messages for ${appointment.service_type} appointment` 
          : 'Messages'
        }
      </h3>
      <Button onClick={onCreateNewChat} className="flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>New Chat</span>
      </Button>
    </div>
  );
};

export default ChatHeader;
