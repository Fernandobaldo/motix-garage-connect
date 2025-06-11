
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, XCircle, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppointmentStatusBadgeProps {
  status: string;
  className?: string;
}

const AppointmentStatusBadge = ({ status, className }: AppointmentStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          label: 'Pending',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          icon: CheckCircle,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'in_progress':
        return {
          label: 'In Progress',
          icon: Play,
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: CheckCircle,
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: XCircle,
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          icon: AlertCircle,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, "flex items-center gap-1 font-medium", className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default AppointmentStatusBadge;
