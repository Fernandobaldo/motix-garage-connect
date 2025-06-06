
import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MessageTranslation from './MessageTranslation';
import { Image, FileText, Video } from "lucide-react";

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

interface MessageItemProps {
  message: Message;
  isCurrentUser: boolean;
  onTranslationComplete: (messageId: string, translatedText: string, targetLanguage: string) => void;
}

const MessageItem = ({ message: msg, isCurrentUser, onTranslationComplete }: MessageItemProps) => {
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

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          isCurrentUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {!isCurrentUser && (
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium opacity-75">
              {msg.sender?.full_name || 'Unknown'}
            </p>
            <MessageTranslation
              messageId={msg.id}
              originalText={msg.content}
              onTranslationComplete={(translatedText, targetLanguage) => 
                onTranslationComplete(msg.id, translatedText, targetLanguage)
              }
            />
          </div>
        )}
        {renderMessageContent(msg)}
        <p className={`text-xs mt-1 ${
          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
