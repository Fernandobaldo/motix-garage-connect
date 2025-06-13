
import { Badge } from "@/components/ui/badge";
import type { ServiceStatus } from "@/types/database";

interface ServiceStatusBadgeProps {
  status: ServiceStatus;
  className?: string;
}

const ServiceStatusBadge = ({ status, className }: ServiceStatusBadgeProps) => {
  const getStatusConfig = (status: ServiceStatus) => {
    switch (status) {
      case 'pending':
        return { variant: 'secondary', label: 'Pending' };
      case 'in_progress':
        return { variant: 'default', label: 'In Progress' };
      case 'awaiting_approval':
        return { variant: 'outline', label: 'Awaiting Approval' };
      case 'completed':
        return { variant: 'success', label: 'Completed' };
      case 'cancelled':
        return { variant: 'destructive', label: 'Cancelled' };
      default:
        return { variant: 'secondary', label: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant as any} 
      className={className}
    >
      {config.label}
    </Badge>
  );
};

export default ServiceStatusBadge;
