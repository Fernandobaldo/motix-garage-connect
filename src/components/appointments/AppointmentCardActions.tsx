
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, FileText, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { AppointmentWithRelations } from "@/types/database";

interface AppointmentCardActionsProps {
  appointment: AppointmentWithRelations;
  onEdit: (appointment: AppointmentWithRelations) => void;
  onDelete: (appointmentId: string) => void;
  onServiceReport: (appointmentId: string) => void;
  onChatClick: (appointment: AppointmentWithRelations) => void;
  isHistoryView?: boolean;
}

const AppointmentCardActions = ({ 
  appointment, 
  onEdit, 
  onDelete, 
  onServiceReport, 
  onChatClick, 
  isHistoryView = false
}: AppointmentCardActionsProps) => {
  const { profile } = useAuth();

  const canEditAppointment = () => {
    // In history view, hide edit for completed appointments
    if (isHistoryView && appointment.status === 'completed') {
      return false;
    }
    return profile?.role === 'workshop' || appointment.client_id === profile?.id;
  };

  const canDeleteAppointment = () => {
    return profile?.role === 'workshop' || appointment.client_id === profile?.id;
  };

  const canAddServiceReport = () => {
    return profile?.role === 'workshop' && 
           (appointment.status === 'in_progress' || 
            appointment.status === 'confirmed' ||
            (isHistoryView && appointment.status === 'completed'));
  };

  const canAccessChat = () => {
    // In history view, hide chat for completed appointments
    if (isHistoryView && appointment.status === 'completed') {
      return false;
    }
    return appointment.status === 'confirmed' || 
           appointment.status === 'in_progress' || 
           appointment.status === 'completed';
  };

  const getServiceReportButtonText = () => {
    if (isHistoryView && appointment.status === 'completed') {
      return 'View Service Report';
    }
    return 'Complete Service';
  };

  return (
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
          {getServiceReportButtonText()}
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
  );
};

export default AppointmentCardActions;
