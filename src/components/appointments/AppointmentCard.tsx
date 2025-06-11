
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Clock, MapPin, Car, Edit, Trash2, FileText, MessageSquare, User } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import AppointmentStatusManager from "./AppointmentStatusManager";

interface AppointmentCardProps {
  appointment: any;
  onEdit: (appointment: any) => void;
  onDelete: (appointmentId: string) => void;
  onServiceReport: (appointmentId: string) => void;
  onChatClick: (appointment: any) => void;
  onStatusUpdate: (newStatus: string) => void;
}

const AppointmentCard = ({ 
  appointment, 
  onEdit, 
  onDelete, 
  onServiceReport, 
  onChatClick, 
  onStatusUpdate 
}: AppointmentCardProps) => {
  const { profile } = useAuth();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditAppointment = () => {
    return profile?.role === 'workshop' || appointment.client_id === profile?.id;
  };

  const canDeleteAppointment = () => {
    return profile?.role === 'workshop' || appointment.client_id === profile?.id;
  };

  const canChangeStatus = () => {
    return profile?.role === 'workshop';
  };

  const canAddServiceReport = () => {
    return profile?.role === 'workshop' && appointment.status === 'in_progress';
  };

  const canAccessChat = () => {
    return appointment.status === 'confirmed' || appointment.status === 'in_progress';
  };

  const scheduledDate = new Date(appointment.scheduled_at);
  const appointmentDate = format(scheduledDate, 'PPP');
  const appointmentTime = format(scheduledDate, 'HH:mm');

  // Get client display name
  const getClientDisplayName = () => {
    if (appointment.client && appointment.client.full_name) {
      return appointment.client.full_name;
    }
    if (appointment.client_id && !appointment.client) {
      return 'Client information unavailable';
    }
    return 'Guest Client';
  };

  const getClientPhone = () => {
    if (appointment.client && appointment.client.phone) {
      return appointment.client.phone;
    }
    return 'No phone available';
  };

  console.log('Rendering appointment card for:', appointment.id, 'client data:', appointment.client, 'client_id:', appointment.client_id);

  return (
    <Card className="hover:shadow-md transition-shadow">
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
                currentStatus={appointment.status}
                onStatusUpdate={onStatusUpdate}
              />
            ) : (
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Show workshop info for clients, client info for workshops */}
          {profile?.role === 'client' && appointment.workshop && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{appointment.workshop.name}</p>
                <p className="text-sm text-gray-600">{appointment.workshop.phone || 'No phone available'}</p>
              </div>
            </div>
          )}
          
          {profile?.role === 'workshop' && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{getClientDisplayName()}</p>
                <p className="text-sm text-gray-600">{getClientPhone()}</p>
              </div>
            </div>
          )}

          {appointment.vehicle && (
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">
                  {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                </p>
                <p className="text-sm text-gray-600">{appointment.vehicle.license_plate}</p>
              </div>
            </div>
          )}
        </div>
        
        {appointment.description && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{appointment.description}</p>
          </div>
        )}

        <div className="flex items-center justify-end space-x-2 mt-4">
          {canAccessChat() && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onChatClick(appointment)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
          )}
          
          {canAddServiceReport() && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onServiceReport(appointment.id)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Complete Service
            </Button>
          )}

          {canEditAppointment() && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(appointment)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {canDeleteAppointment() && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this appointment? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(appointment.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
