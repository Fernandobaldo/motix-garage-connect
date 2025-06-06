
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, FileText, Wrench, AlertTriangle } from 'lucide-react';
import { ServiceHistoryRecord } from './types';
import { format } from 'date-fns';

interface ServiceHistoryListProps {
  records: ServiceHistoryRecord[];
  onViewDetails: (record: ServiceHistoryRecord) => void;
}

const ServiceHistoryList = ({ records, onViewDetails }: ServiceHistoryListProps) => {
  const getServiceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'oil change':
        return <Wrench className="h-4 w-4" />;
      case 'brake service':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getServiceTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'oil change':
        return 'default';
      case 'brake service':
        return 'destructive';
      case 'tire rotation':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No service history records found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getServiceTypeIcon(record.service_type)}
                <div>
                  <CardTitle className="text-lg">{record.service_type}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {record.vehicle?.year} {record.vehicle?.make} {record.vehicle?.model}
                  </p>
                </div>
              </div>
              <Badge variant={getServiceTypeBadge(record.service_type)}>
                {record.service_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(new Date(record.completed_at), 'MMM dd, yyyy')}
                </span>
              </div>
              
              {record.mileage && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{record.mileage.toLocaleString()} miles</span>
                </div>
              )}
              
              {record.cost && (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">${record.cost.toFixed(2)}</span>
                </div>
              )}
              
              {record.labor_hours && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{record.labor_hours}h labor</span>
                </div>
              )}
            </div>
            
            {record.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {record.description}
              </p>
            )}
            
            {record.parts_used && record.parts_used.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Parts Used:</p>
                <div className="flex flex-wrap gap-1">
                  {record.parts_used.slice(0, 3).map((part, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {part.name} (x{part.quantity})
                    </Badge>
                  ))}
                  {record.parts_used.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{record.parts_used.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {record.workshop?.name || 'Unknown Workshop'}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onViewDetails(record)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceHistoryList;
