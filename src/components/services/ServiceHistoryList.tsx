
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { ServiceHistoryWithRelations } from "@/types/database";

interface ServiceHistoryListProps {
  history: ServiceHistoryWithRelations[];
}

const ServiceHistoryList = ({ history }: ServiceHistoryListProps) => {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No completed or cancelled history records found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((record) => (
        <Card key={record.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{record.service_type}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {record.completed_at ? format(new Date(record.completed_at), "MMM dd, yyyy") : "—"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {record.vehicle
                    ? `${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}`
                    : ""}
                </div>
              </div>
              <Badge variant={record.status === "completed" ? "default" : "destructive"}>
                {record.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm mb-2">
              {record.description}
            </div>
            {record.cost && (
              <div className="text-xs text-muted-foreground">
                Cost: ${record.cost}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceHistoryList;
