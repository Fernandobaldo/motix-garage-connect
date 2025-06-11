
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import FileUpload from './FileUpload';

interface MessageInputProps {
  onSendMessage: (content: string, messageType?: string, fileUrl?: string, fileName?: string) => void;
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, onFileUploaded, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex space-x-2">
        <FileUpload 
          onFileUploaded={onFileUploaded}
          disabled={disabled}
        />
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
          disabled={disabled}
        />
        <Button onClick={handleSendMessage} disabled={!message.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
