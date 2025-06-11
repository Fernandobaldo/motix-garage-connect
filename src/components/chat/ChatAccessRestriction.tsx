
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface ChatAccessRestrictionProps {
  appointment: any;
}

const ChatAccessRestriction = ({ appointment }: ChatAccessRestrictionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-orange-500" />
          <span>Chat Not Available</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-gray-600">
            Chat is only available for confirmed appointments.
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Current status:</span>
            <Badge 
              className={
                appointment.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {appointment.status}
            </Badge>
          </div>
          {appointment.status === 'pending' && (
            <p className="text-sm text-gray-500">
              Please wait for the workshop to confirm your appointment.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatAccessRestriction;
