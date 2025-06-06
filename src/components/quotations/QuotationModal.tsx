
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Quotation } from '@/hooks/useQuotations';

interface QuotationModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuotationModal = ({ quotation, isOpen, onClose }: QuotationModalProps) => {
  if (!quotation) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  const calculateSubtotal = () => {
    return quotation.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (quotation.tax_rate || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Quote #{quotation.quote_number}
            <Badge className={getStatusColor(
              isExpired(quotation.valid_until) ? 'expired' : quotation.status || 'draft'
            )}>
              {isExpired(quotation.valid_until) ? 'expired' : quotation.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Information */}
          <Card>
            <CardHeader>
              <CardTitle>Quote Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Client:</span>
                  <p>{quotation.client?.full_name}</p>
                </div>
                <div>
                  <span className="font-semibold">Workshop:</span>
                  <p>{quotation.workshop?.name}</p>
                </div>
                {quotation.vehicle && (
                  <div>
                    <span className="font-semibold">Vehicle:</span>
                    <p>{quotation.vehicle.year} {quotation.vehicle.make} {quotation.vehicle.model}</p>
                    <p className="text-gray-600">{quotation.vehicle.license_plate}</p>
                  </div>
                )}
                <div>
                  <span className="font-semibold">Created:</span>
                  <p>{format(new Date(quotation.created_at), 'MMM d, yyyy')}</p>
                  {quotation.valid_until && (
                    <>
                      <span className="font-semibold">Valid until:</span>
                      <p>{format(new Date(quotation.valid_until), 'MMM d, yyyy')}</p>
                    </>
                  )}
                </div>
              </div>
              {quotation.description && (
                <div className="mt-4">
                  <span className="font-semibold">Description:</span>
                  <p className="mt-1 text-gray-700">{quotation.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quote Items */}
          {quotation.items && quotation.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Quote Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-center">Type</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-center capitalize">{item.item_type}</TableCell>
                        <TableCell className="text-right">${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Totals */}
                    <TableRow className="border-t-2">
                      <TableCell colSpan={4} className="text-right font-semibold">Subtotal:</TableCell>
                      <TableCell className="text-right font-semibold">${calculateSubtotal().toFixed(2)}</TableCell>
                    </TableRow>
                    {(quotation.tax_rate || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right">
                          Tax ({((quotation.tax_rate || 0) * 100).toFixed(1)}%):
                        </TableCell>
                        <TableCell className="text-right">${calculateTax().toFixed(2)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow className="border-t">
                      <TableCell colSpan={4} className="text-right font-bold text-lg">Total:</TableCell>
                      <TableCell className="text-right font-bold text-lg">
                        ${(quotation.total_cost || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Created</span>
                  <span>{format(new Date(quotation.created_at), 'MMM d, yyyy • h:mm a')}</span>
                </div>
                {quotation.approved_at && (
                  <div className="flex justify-between">
                    <span>Approved</span>
                    <span>{format(new Date(quotation.approved_at), 'MMM d, yyyy • h:mm a')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Last Updated</span>
                  <span>{format(new Date(quotation.updated_at), 'MMM d, yyyy • h:mm a')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationModal;
