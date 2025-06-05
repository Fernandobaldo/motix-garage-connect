
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Paperclip, 
  Image, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Languages,
  User,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatInterfaceProps {
  userRole: 'client' | 'workshop';
}

interface Message {
  id: number;
  text: string;
  sender: 'client' | 'workshop';
  timestamp: string;
  type: 'text' | 'image' | 'file';
  translated?: string;
  isTranslated?: boolean;
}

interface ChatContact {
  id: number;
  name: string;
  role: 'client' | 'workshop';
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar?: string;
}

const ChatInterface = ({ userRole }: ChatInterfaceProps) => {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showTranslated, setShowTranslated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const mockContacts: ChatContact[] = userRole === 'client' ? [
    {
      id: 1,
      name: 'AutoCare Plus',
      role: 'workshop',
      lastMessage: 'Your oil change is complete and ready for pickup!',
      timestamp: '2 min ago',
      unread: 1,
    },
    {
      id: 2,
      name: 'City Motors',
      role: 'workshop',
      lastMessage: 'We received your brake service request. When would you like to schedule?',
      timestamp: '1 hour ago',
      unread: 0,
    },
    {
      id: 3,
      name: 'Speed Shop Garage',
      role: 'workshop',
      lastMessage: 'Thank you for your visit today!',
      timestamp: '1 day ago',
      unread: 0,
    }
  ] : [
    {
      id: 1,
      name: 'John Smith',
      role: 'client',
      lastMessage: 'What time should I bring my car in?',
      timestamp: '5 min ago',
      unread: 2,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'client',
      lastMessage: 'Thank you for the excellent service!',
      timestamp: '30 min ago',
      unread: 0,
    },
    {
      id: 3,
      name: 'Mike Davis',
      role: 'client',
      lastMessage: 'Is the estimate ready?',
      timestamp: '2 hours ago',
      unread: 1,
    }
  ];

  const mockMessages: Message[] = [
    {
      id: 1,
      text: 'Hello! I need to schedule an oil change for my Honda Civic.',
      sender: 'client',
      timestamp: '10:30 AM',
      type: 'text',
      translated: 'Hola! Necesito programar un cambio de aceite para mi Honda Civic.'
    },
    {
      id: 2,
      text: 'Hi! We can schedule that for you. What day works best?',
      sender: 'workshop',
      timestamp: '10:32 AM',
      type: 'text',
      translated: 'Hola! Podemos programar eso para ti. ¿Qué día te conviene mejor?'
    },
    {
      id: 3,
      text: 'How about this Friday around 2 PM?',
      sender: 'client',
      timestamp: '10:35 AM',
      type: 'text',
      translated: '¿Qué tal este viernes alrededor de las 2 PM?'
    },
    {
      id: 4,
      text: 'Perfect! Friday at 2 PM is available. I\'ll book that for you.',
      sender: 'workshop',
      timestamp: '10:36 AM',
      type: 'text',
      translated: '¡Perfecto! El viernes a las 2 PM está disponible. Lo reservaré para ti.'
    },
    {
      id: 5,
      text: 'Great! Should I bring anything specific?',
      sender: 'client',
      timestamp: '10:38 AM',
      type: 'text',
      translated: '¡Genial! ¿Debo traer algo específico?'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mockMessages]);

  useEffect(() => {
    if (mockContacts.length > 0) {
      setSelectedContact(mockContacts[0]);
    }
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    toast({
      title: "Message Sent",
      description: "Your message has been delivered.",
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTranslation = () => {
    setShowTranslated(!showTranslated);
    toast({
      title: showTranslated ? "Translation Hidden" : "Translation Shown",
      description: showTranslated 
        ? "Now showing original messages" 
        : "Now showing translated messages",
    });
  };

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {userRole === 'client' ? 'Workshops' : 'Clients'}
            </h3>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Search conversations..." className="pl-10" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mockContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                selectedContact?.id === contact.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>
                    {contact.role === 'workshop' ? (
                      <Building className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 truncate">{contact.name}</h4>
                    <span className="text-xs text-gray-500">{contact.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">{contact.lastMessage}</p>
                </div>
                {contact.unread > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    {contact.unread}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedContact.avatar} />
                    <AvatarFallback>
                      {selectedContact.role === 'workshop' ? (
                        <Building className="h-4 w-4" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedContact.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{selectedContact.role}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={toggleTranslation}
                    className={showTranslated ? 'bg-blue-100 text-blue-600' : ''}
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((message) => {
                const isOwnMessage = message.sender === userRole;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">
                        {showTranslated && message.translated ? message.translated : message.text}
                      </p>
                      <span className={`text-xs mt-1 block ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp}
                      </span>
                      {showTranslated && message.translated && (
                        <p className={`text-xs mt-1 italic ${
                          isOwnMessage ? 'text-blue-200' : 'text-gray-600'
                        }`}>
                          Original: {message.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
