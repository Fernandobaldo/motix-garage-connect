
import { MapPin, Car, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AppointmentCardInfoProps {
  appointment: any;
}

const AppointmentCardInfo = ({ appointment }: AppointmentCardInfoProps) => {
  const { profile } = useAuth();

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

  return (
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
  );
};

export default AppointmentCardInfo;
