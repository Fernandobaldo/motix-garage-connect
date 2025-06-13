
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Car, User, Wrench, Download, Share2, Edit } from "lucide-react";
import { format } from "date-fns";
import ServiceStatusBadge from "./ServiceStatusBadge";
import type { ServiceRecordWithRelations, ServiceStatus } from "@/types/database";
import { formatCurrency, formatDistance } from "@/utils/currency";
import { useWorkshopPreferences } from "@/hooks/useWorkshopPreferences";

interface ServiceRecordCardProps {
  service: ServiceRecordWithRelations;
  onStatusUpdate: (id: string, status: ServiceStatus) => void;
  onEdit?: (service: ServiceRecordWithRelations) => void;
  onPdfExport?: (service: ServiceRecordWithRelations) => void;
  onShare?: (service: ServiceRecordWithRelations) => void;
  isHistoryView?: boolean;
}

const ServiceRecordCard = ({
  service,
  onStatusUpdate,
  onEdit,
  onPdfExport,
  onShare,
  isHistoryView = false
}: ServiceRecordCardProps) => {
  const { preferences } = useWorkshopPreferences();

  const handleStatusChange = (newStatus: ServiceStatus) => {
    onStatusUpdate(service.id, newStatus);
  };

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      oil_change: 'Oil Change',
      brake_service: 'Brake Service',
      tire_rotation: 'Tire Rotation',
      general_maintenance: 'General Maintenance',
      repair: 'Repair',
      inspection: 'Inspection',
      other: 'Other'
    };
    return labels[type] || type;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">
              {getServiceTypeLabel(service.service_type)}
            </h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(service.created_at), 'MMM dd, yyyy')}
              </div>
              {service.estimated_completion_date && (
                <div className="flex items-center gap-1">
                  <Wrench className="h-4 w-4" />
                  Due: {format(new Date(service.estimated_completion_date), 'MMM dd')}
                </div>
              )}
            </div>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Client & Vehicle Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {service.client && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">{service.client.full_name}</p>
                <p className="text-sm text-muted-foreground">{service.client.phone}</p>
              </div>
            </div>
          )}
          
          {service.vehicle && (
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {service.vehicle.year} {service.vehicle.make} {service.vehicle.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  {service.vehicle.license_plate}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Service Details */}
        {service.description && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">{service.description}</p>
          </div>
        )}

        {/* Service Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {service.cost && (
            <div>
              <p className="text-muted-foreground">Cost</p>
              <p className="font-medium">
                {formatCurrency(Number(service.cost), preferences?.currency_code)}
              </p>
            </div>
          )}
          {service.labor_hours && (
            <div>
              <p className="text-muted-foreground">Labor Hours</p>
              <p className="font-medium">{service.labor_hours}h</p>
            </div>
          )}
          {service.mileage && (
            <div>
              <p className="text-muted-foreground">
                {preferences?.distance_unit === 'km' ? 'Kilometers' : 'Mileage'}
              </p>
              <p className="font-medium">
                {formatDistance(service.mileage, preferences?.distance_unit)}
              </p>
            </div>
          )}
          {service.parts_used && Array.isArray(service.parts_used) && service.parts_used.length > 0 && (
            <div>
              <p className="text-muted-foreground">Parts</p>
              <p className="font-medium">{service.parts_used.length} items</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          {!isHistoryView && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Select value={service.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="awaiting_approval">Awaiting Approval</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onPdfExport && (
              <Button variant="outline" size="sm" onClick={() => onPdfExport(service)}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            )}
            {onShare && (
              <Button variant="outline" size="sm" onClick={() => onShare(service)}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRecordCard;
