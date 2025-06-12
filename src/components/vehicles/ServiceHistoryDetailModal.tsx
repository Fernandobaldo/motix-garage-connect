
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ServiceHistoryRecord } from './types';
import { Calendar, DollarSign, Gauge, Clock, User, FileText, Wrench } from 'lucide-react';

interface ServiceHistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: ServiceHistoryRecord | null;
}

const ServiceHistoryDetailModal = ({ isOpen, onClose, record }: ServiceHistoryDetailModalProps) => {
  if (!record) return null;

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(amount));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wrench className="h-5 w-5" />
            <span>Service Record Details</span>
          </DialogTitle>
          <DialogDescription>
            Complete service record information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Service Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">{record.service_type}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">{formatDate(record.completed_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-medium">{formatCurrency(record.cost)}</p>
                  </div>
                </div>

                {record.mileage && (
                  <div className="flex items-center space-x-2">
                    <Gauge className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-medium">{record.mileage.toLocaleString()} miles</p>
                    </div>
                  </div>
                )}

                {record.labor_hours && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Labor Hours</p>
                      <p className="font-medium">{record.labor_hours} hours</p>
                    </div>
                  </div>
                )}

                {record.workshop && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Workshop</p>
                      <p className="font-medium">{record.workshop.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          {record.vehicle && (
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="font-medium">
                      {record.vehicle.year} {record.vehicle.make} {record.vehicle.model}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      License Plate: {record.vehicle.license_plate}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {record.description && (
            <Card>
              <CardHeader>
                <CardTitle>Service Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{record.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Parts Used */}
          {record.parts_used && record.parts_used.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Parts Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {record.parts_used.map((part: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{part.name}</p>
                        {part.part_number && (
                          <p className="text-sm text-muted-foreground">Part #: {part.part_number}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Qty: {part.quantity}</p>
                        {part.cost && (
                          <p className="text-sm text-muted-foreground">{formatCurrency(part.cost)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technician Notes */}
          {record.technician_notes && (
            <Card>
              <CardHeader>
                <CardTitle>Technician Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{record.technician_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Warranty Information */}
          {record.warranty_until && (
            <Card>
              <CardHeader>
                <CardTitle>Warranty Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Warranty until {new Date(record.warranty_until).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Images */}
          {record.images && record.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Service Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {record.images.map((image: any, index: number) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Image {index + 1}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceHistoryDetailModal;
