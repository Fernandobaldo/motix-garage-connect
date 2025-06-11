
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import AppointmentStatusManager from "./AppointmentStatusManager";
import type { AppointmentWithRelations } from "@/types/database";

interface AppointmentCardHeaderProps {
  appointment: AppointmentWithRelations;
  onStatusUpdate: (newStatus: string) => void;
}

const AppointmentCardHeader = ({ appointment, onStatusUpdate }: AppointmentCardHeaderProps) => {
  const { profile } = useAuth();

  const canChangeStatus = () => {
    return profile?.role === 'workshop';
  };

  const scheduledDate = new Date(appointment.scheduled_at);
  const appointmentDate = format(scheduledDate, 'PPP');
  const appointmentTime = format(scheduledDate, 'HH:mm');

  return (
    <CardHeader>
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg">{appointment.service_type}</CardTitle>
          <CardDescription className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{appointmentDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{appointmentTime}</span>
            </div>
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {canChangeStatus() ? (
            <AppointmentStatusManager
              appointmentId={appointment.id}
              currentStatus={appointment.status || 'pending'}
              onStatusUpdate={onStatusUpdate}
            />
          ) : (
            <Badge className={
              appointment.status === 'pending' 
                ? 'bg-yellow-100 text-yellow-800'
                : appointment.status === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : appointment.status === 'in_progress'
                ? 'bg-purple-100 text-purple-800'
                : appointment.status === 'completed'
                ? 'bg-blue-100 text-blue-800'
                : appointment.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }>
              {appointment.status || 'pending'}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
};

export default AppointmentCardHeader;
