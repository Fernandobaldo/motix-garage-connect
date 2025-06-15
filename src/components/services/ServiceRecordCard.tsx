import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Car, User, Wrench, Download, Share2, Edit, BadgeInfo } from "lucide-react";
import { format } from "date-fns";
import ServiceStatusBadge from "./ServiceStatusBadge";
import type { ServiceRecordWithRelations, ServiceStatus } from "@/types/database";
import { formatCurrency, formatDistance } from "@/utils/currency";
import { useWorkshopPreferences } from "@/hooks/useWorkshopPreferences";
import { useState } from "react";
import ServiceRecordEditModal from "./ServiceRecordEditModal";
import ServiceRecordDetailsModal from "./ServiceRecordDetailsModal";
import { Trash2, Eye, Edit as EditIcon } from "lucide-react";
import { useServiceRecords } from "@/hooks/useServiceRecords";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader as AlertDialogHeaderUI, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useWorkshop } from "@/hooks/useWorkshop";
import { exportServiceRecordToPDF } from "@/utils/serviceRecordPdfExport";

/**
 * Helper to get label and icon for each service type.
 */
const getServiceTypeMeta = (type: string) => {
  switch (type) {
    case "oil_change":
      return { label: "Oil Change", color: "bg-green-100 text-green-600", icon: <Wrench className="w-3 h-3 mr-1 inline-block" /> };
    case "brake_service":
      return { label: "Brake Service", color: "bg-blue-100 text-blue-600", icon: <Wrench className="w-3 h-3 mr-1 inline-block" /> };
    case "tire_rotation":
      return { label: "Tire Rotation", color: "bg-yellow-100 text-yellow-600", icon: <Wrench className="w-3 h-3 mr-1 inline-block" /> };
    case "general_maintenance":
      return { label: "Maintenance", color: "bg-purple-100 text-purple-600", icon: <Wrench className="w-3 h-3 mr-1 inline-block" /> };
    case "repair":
      return { label: "Repair", color: "bg-red-100 text-red-600", icon: <Wrench className="w-3 h-3 mr-1 inline-block" /> };
    case "inspection":
      return { label: "Inspection", color: "bg-sky-100 text-sky-600", icon: <BadgeInfo className="w-3 h-3 mr-1 inline-block" /> };
    case "other":
      return { label: "Other", color: "bg-gray-100 text-gray-600", icon: <Wrench className="w-3 h-3 mr-1 inline-block" /> };
    default:
      // Accept free text/custom types as a fallback:
      return { label: type, color: "bg-gray-50 text-gray-700", icon: null };
  }
};

interface ServiceRecordCardProps {
  service: ServiceRecordWithRelations;
  onStatusUpdate: (id: string, status: ServiceStatus) => void;
  onEdit?: (service: ServiceRecordWithRelations) => void;
  onPdfExport?: (service: ServiceRecordWithRelations) => void;
  onShare?: (service: ServiceRecordWithRelations) => void;
  isHistoryView?: boolean;
  onViewDetails?: (service: ServiceRecordWithRelations) => void;
}

// "service_type" is always one string, could be future comma-separated; supports array or string
function getServiceTypesArr(service: ServiceRecordWithRelations) {
  if (Array.isArray(service.service_type)) return service.service_type; // future-proof
  if (typeof service.service_type === "string") {
    return service.service_type.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}

const ServiceRecordCard = ({
  service,
  onStatusUpdate,
  onEdit,
  onPdfExport,
  onShare,
  isHistoryView = false,
  onViewDetails
}: ServiceRecordCardProps) => {
  const { preferences } = useWorkshopPreferences();
  const { workshop } = useWorkshop(); // Now includes workshop context

  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteServiceRecord, isDeletePending, refreshRecords } = useServiceRecords();

  const handleStatusChange = (newStatus: ServiceStatus) => {
    onStatusUpdate(service.id, newStatus);
  };

  const handleDelete = () => {
    deleteServiceRecord(service.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        refreshRecords?.();
      }
    });
  };

  // Vehicle main title and subtitle (plate on same line if known)
  const vehicleTitle = service.vehicle
    ? `${service.vehicle.year ?? ""} ${service.vehicle.make ?? ""} ${service.vehicle.model ?? ""} ${service.vehicle.license_plate ? `- ${service.vehicle.license_plate}` : ""}`.trim()
    : "Unknown vehicle";

  const serviceTypesArr = getServiceTypesArr(service);

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid="service-record-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Vehicle info as the main title */}
          <div className="flex flex-col w-full min-w-0">
            <h3 className="font-semibold text-lg truncate" title={vehicleTitle}>
              <Car className="inline mr-1 w-4 h-4 text-muted-foreground" />
              {vehicleTitle}
            </h3>

            {/* CLIENT INFO - subtitle */}
            {service.client && (
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{service.client.full_name}</span>
                <span className="text-sm text-muted-foreground">{service.client.phone}</span>
              </div>
            )}

            {/* SERVICE TYPE PREVIEW */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {serviceTypesArr.length > 0 ? (
                serviceTypesArr.map((type, i) => {
                  const meta = getServiceTypeMeta(type);
                  return (
                    <span
                      key={type + i}
                      className={`flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}
                      style={{ minWidth: 0, maxWidth: 140 }}
                    >
                      {meta.icon}
                      <span className="truncate">{meta.label}</span>
                    </span>
                  );
                })
              ) : (
                <span className="text-xs text-muted-foreground italic">No service type</span>
              )}
            </div>
          </div>
          <ServiceStatusBadge status={service.status} className="mt-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service Details */}
        {service.description && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">{service.description}</p>
          </div>
        )}

        {/* Service Stats WITHOUT Cost or Parts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
        </div>

        {/* Dates and estimated completion */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2 flex-wrap">
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

        {/* Actions & Status Control */}
        <div className="flex items-center justify-between pt-4 border-t mt-2">
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
            {/* Preview Button beside Edit */}
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={() => onViewDetails(service)}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            )}
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(service)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {/* PDF Button: provide correct info */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // If parent handles, use that, else direct export
                if (onPdfExport) {
                  onPdfExport(service);
                } else {
                  // Default: use export utility directly
                  // Parse grouped services, notes as in details modal
                  const serviceTypeStr = service.service_type;
                  // Safely ensure parts is always an array of objects
                  const parts = Array.isArray(service.parts_used) ? service.parts_used : [];
                  // Defensive filtering: only use objects
                  const validParts = parts.filter(
                    (p) => typeof p === "object" && p !== null
                  );

                  // Copy of parseServicesFromRecord:
                  const serviceTypes = typeof serviceTypeStr === 'string'
                    ? serviceTypeStr.split(",").map((v) => ({ value: v.trim() }))
                    : [{ value: "" }];
                  let hasTypes = validParts.length > 0 && validParts.every((p) => "serviceType" in p && typeof p.serviceType === "string");
                  let parsedServices = [];

                  if (hasTypes) {
                    const itemsGrouped: Record<string, any[]> = {};
                    for (const p of validParts) {
                      const tkey = typeof p.serviceType === "string" ? p.serviceType : "";
                      if (!itemsGrouped[tkey]) itemsGrouped[tkey] = [];
                      // Only destructure if p is object and not null
                      const { serviceType, ...rest } = p;
                      itemsGrouped[tkey].push(rest);
                    }
                    parsedServices = serviceTypes.map(stype => ({
                      serviceType: stype,
                      items: itemsGrouped[stype.value] || [],
                    }));
                  } else {
                    if (serviceTypes.length === 1) {
                      parsedServices = [{ serviceType: serviceTypes[0], items: validParts }];
                    } else {
                      const perSvc = serviceTypes.map((t) => ({
                        serviceType: t,
                        items: [],
                      }));
                      if (validParts.length > 0) {
                        perSvc[0].items = validParts;
                      }
                      parsedServices = perSvc;
                    }
                  }
                  // Notes extraction
                  let nextOilChangeMileage = "";
                  let plainNotes = "";
                  if (
                    typeof service.technician_notes === "string" &&
                    service.technician_notes.startsWith("{")
                  ) {
                    try {
                      const endIdx = service.technician_notes.indexOf("}\n");
                      if (endIdx !== -1) {
                        const jsonBlob = service.technician_notes.slice(0, endIdx + 1);
                        const parsed = JSON.parse(jsonBlob);
                        nextOilChangeMileage = parsed.nextOilChangeMileage ?? "";
                        plainNotes = service.technician_notes.slice(endIdx + 2) || "";
                      }
                    } catch {
                      plainNotes = service.technician_notes;
                    }
                  } else {
                    plainNotes = service.technician_notes || "";
                  }
                  const totalCost = parsedServices.reduce(
                    (svcTally, svc) =>
                      svcTally +
                      svc.items.reduce(
                        (itemTally, item) =>
                          itemTally +
                          (Number(item.quantity) || 0) * (Number(item.price) || 0),
                        0
                      ),
                    0
                  );
                  exportServiceRecordToPDF(
                    service,
                    parsedServices,
                    totalCost,
                    nextOilChangeMileage,
                    plainNotes,
                    // Send workshop header info (safeguarded)
                    workshop
                      ? {
                          name: workshop.name,
                          address: workshop.address,
                          phone: workshop.phone,
                          email: workshop.email,
                        }
                      : undefined,
                    preferences
                  );
                }
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            {/* ... rest of actions ... */}
            {onShare && (
              <Button variant="outline" size="sm" onClick={() => onShare(service)}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
            {/* --- DELETE BUTTON --- */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                  disabled={isDeletePending}
                  title="Delete Service Record"
                  aria-label="Delete Service Record"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeaderUI>
                  <AlertDialogTitle>Delete Service Record</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete this service record? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeaderUI>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/90"
                    disabled={isDeletePending}
                    onClick={handleDelete}
                  >
                    {isDeletePending ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* --- END DELETE BUTTON --- */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceRecordCard;
