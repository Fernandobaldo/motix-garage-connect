
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Display vehicle & client info as a card (read-only).
 * Used in ServiceRecordModal.
 */
export default function VehicleClientInfoCard({
  vehicle,
  client,
}: {
  vehicle?: any;
  client?: { id: string; name: string; type: "auth" | "guest" } | null;
}) {
  if (!vehicle || !client) return null;
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Vehicle:</span>
            <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">License Plate:</span>
            <Badge variant="outline">{vehicle.license_plate}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Client:</span>
            <div className="flex items-center space-x-2">
              <span>{client.name}</span>
              <Badge variant={client.type === "auth" ? "default" : "secondary"} className="text-xs">
                {client.type === "auth" ? "Account" : "Guest"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
