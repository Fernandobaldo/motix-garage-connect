
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info,
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';
import type { Notification } from './types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getRelatedIcon = () => {
    switch (notification.related_type) {
      case 'appointment': return Calendar;
      case 'quotation': return FileText;
      case 'chat': return MessageSquare;
      default: return Bell;
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const Icon = getIcon();
  const RelatedIcon = getRelatedIcon();

  return (
    <div className={`p-4 border rounded-lg hover:shadow-sm transition-shadow ${
      notification.read_at ? 'bg-gray-50' : 'bg-white border-blue-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${getTypeColor()}`}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">{notification.title}</h4>
              {notification.related_type && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <RelatedIcon className="h-3 w-3" />
                  <span className="capitalize">{notification.related_type}</span>
                </Badge>
              )}
            </div>
            {!notification.read_at && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="text-xs"
              >
                Mark as read
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          
          <p className="text-xs text-gray-400 mt-2">
            {format(new Date(notification.created_at), 'MMM d, yyyy • h:mm a')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
