
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Check, X, Download } from 'lucide-react';
import { format } from 'date-fns';
import type { Quotation } from '@/hooks/useQuotations';
import { exportQuotationToPDF } from '@/utils/pdfExport';

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

  const isExpired = (quotation: Quotation) => {
    if (!quotation.valid_until) return false;
    return new Date(quotation.valid_until) < new Date();
  };

  const handleDownloadPDF = (quotation: Quotation, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering row click
    exportQuotationToPDF(quotation);
  };

  if (quotations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No quotations found
          </h3>
          <p className="text-gray-600">
            {userRole === 'client' 
              ? 'You don\'t have any quotations yet.' 
              : 'Create your first quotation to get started.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userRole === 'client' ? 'My Quotations' : 'All Quotations'}
        </CardTitle>
        <CardDescription>
          {userRole === 'client' 
            ? 'Review quotes from workshops and take action' 
            : 'Manage and track all client quotations'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow 
                key={quotation.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onView(quotation)}
              >
                <TableCell className="font-medium">
                  {quotation.quote_number}
                </TableCell>
                <TableCell>
                  {quotation.client?.full_name || 'Unknown Client'}
                </TableCell>
                <TableCell>
                  {quotation.vehicle ? (
                    <div className="text-sm">
                      <div>{quotation.vehicle.year} {quotation.vehicle.make} {quotation.vehicle.model}</div>
                      <div className="text-gray-500">{quotation.vehicle.license_plate}</div>
                    </div>
                  ) : (
                    <span className="text-gray-500">No vehicle</span>
                  )}
                </TableCell>
                <TableCell className="font-semibold">
                  ${(quotation.total_cost || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(
                    isExpired(quotation) ? 'expired' : quotation.status || 'draft'
                  )}>
                    {isExpired(quotation) ? 'expired' : quotation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(quotation.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(quotation)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDownloadPDF(quotation, e)}
                      title="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {userRole === 'client' && quotation.status === 'pending' && !isExpired(quotation) && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(quotation.id);
                          }}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(quotation.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default QuotationList;
