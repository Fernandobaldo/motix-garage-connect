
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppointmentStatusBadgeProps {
  status: string;
  className?: string;
}

const AppointmentStatusBadge = ({ status, className }: AppointmentStatusBadgeProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending_confirmation':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending_confirmation':
        return 'Awaiting Confirmation';
      default:
        return status;
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(getStatusColor(status), className)}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

export default AppointmentStatusBadge;
