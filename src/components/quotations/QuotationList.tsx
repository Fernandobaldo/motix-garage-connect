
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Edit, Send, Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Quotation } from '@/hooks/useQuotations';

interface QuotationListProps {
  quotations: Quotation[];
  userRole: 'client' | 'workshop';
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (quotation: Quotation) => void;
}

const QuotationList = ({ quotations, userRole, onApprove, onReject, onView }: QuotationListProps) => {
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

  return (
    <div className="space-y-4">
      {quotations.map((quotation) => (
        <Card key={quotation.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <span>Quote #{quotation.quote_number}</span>
                  <Badge className={getStatusColor(
                    isExpired(quotation.valid_until) ? 'expired' : quotation.status || 'draft'
                  )}>
                    {isExpired(quotation.valid_until) ? 'expired' : quotation.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-2">
                  {userRole === 'workshop' ? (
                    <>Client: {quotation.client?.full_name}</>
                  ) : (
                    <>Workshop: {quotation.workshop?.name}</>
                  )}
                  {quotation.vehicle && (
                    <> • {quotation.vehicle.year} {quotation.vehicle.make} {quotation.vehicle.model}</>
                  )}
                  <> • Created: {format(new Date(quotation.created_at), 'MMM d, yyyy')}</>
                  {quotation.valid_until && (
                    <> • Valid until: {format(new Date(quotation.valid_until), 'MMM d, yyyy')}</>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${quotation.total_cost?.toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Items Preview */}
            {quotation.items && quotation.items.length > 0 && (
              <div className="mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.slice(0, 3).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {quotation.items.length > 3 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500">
                          ... and {quotation.items.length - 3} more items
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {quotation.description && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Description:</strong> {quotation.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onView(quotation)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {userRole === 'workshop' && (
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>

              {userRole === 'client' && quotation.status === 'pending' && !isExpired(quotation.valid_until) && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => onReject(quotation.id)}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => onApprove(quotation.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}

              {userRole === 'workshop' && (
                <div className="flex gap-2">
                  {quotation.status === 'draft' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Send className="h-4 w-4 mr-2" />
                      Send to Client
                    </Button>
                  )}
                  {quotation.status === 'rejected' && (
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Edit className="h-4 w-4 mr-2" />
                      Revise & Resend
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {quotations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">
              {userRole === 'workshop' 
                ? 'No quotations created yet. Create your first quote to get started.'
                : 'No quotations received yet. Your quotes from workshops will appear here.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuotationList;
