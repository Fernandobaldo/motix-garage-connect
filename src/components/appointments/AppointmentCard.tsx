
import { Card, CardContent } from "@/components/ui/card";
import AppointmentCardHeader from "./AppointmentCardHeader";
import AppointmentCardInfo from "./AppointmentCardInfo";
import AppointmentCardActions from "./AppointmentCardActions";
import type { AppointmentCardProps } from "@/types/database";

const AppointmentCard = ({ 
  appointment, 
  onEdit, 
  onDelete, 
  onServiceReport, 
  onChatClick, 
  onStatusUpdate,
  isHistoryView = false
}: AppointmentCardProps) => {
  console.log('Rendering appointment card for:', appointment.id, 'client data:', appointment.client, 'client_id:', appointment.client_id);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <AppointmentCardHeader 
        appointment={appointment}
        onStatusUpdate={onStatusUpdate}
      />
      <CardContent>
        <AppointmentCardInfo appointment={appointment} />
        
        {appointment.description && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{appointment.description}</p>
          </div>
        )}

        <AppointmentCardActions
          appointment={appointment}
          onEdit={onEdit}
          onDelete={onDelete}
          onServiceReport={onServiceReport}
          onChatClick={onChatClick}
          isHistoryView={isHistoryView}
        />
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
