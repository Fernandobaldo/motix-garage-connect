
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Download, Send, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuotationManagerProps {
  userRole: 'client' | 'workshop';
}

interface QuoteItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Quote {
  id: number;
  clientName: string;
  vehicle: string;
  serviceType: string;
  status: 'pending' | 'approved' | 'rejected' | 'revised';
  date: string;
  total: number;
  items: QuoteItem[];
  notes?: string;
}

const QuotationManager = ({ userRole }: QuotationManagerProps) => {
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0
  });
  const { toast } = useToast();

  const mockQuotes: Quote[] = userRole === 'client' ? [
    {
      id: 1,
      clientName: 'John Doe', // Not applicable for client view
      vehicle: '2020 Honda Civic',
      serviceType: 'Brake Service',
      status: 'pending',
      date: '2024-06-07',
      total: 450.00,
      items: [
        { id: 1, description: 'Brake Pads (Front)', quantity: 1, unitPrice: 120.00, total: 120.00 },
        { id: 2, description: 'Brake Pads (Rear)', quantity: 1, unitPrice: 100.00, total: 100.00 },
        { id: 3, description: 'Labor - Brake Service', quantity: 2, unitPrice: 85.00, total: 170.00 },
        { id: 4, description: 'Shop Supplies', quantity: 1, unitPrice: 15.00, total: 15.00 },
        { id: 5, description: 'Tax', quantity: 1, unitPrice: 45.00, total: 45.00 }
      ],
      notes: 'Brake pads are worn and need immediate replacement for safety.'
    },
    {
      id: 2,
      clientName: 'John Doe',
      vehicle: '2018 Toyota Camry',
      serviceType: 'Oil Change',
      status: 'approved',
      date: '2024-06-05',
      total: 75.00,
      items: [
        { id: 1, description: 'Synthetic Oil (5 quarts)', quantity: 1, unitPrice: 35.00, total: 35.00 },
        { id: 2, description: 'Oil Filter', quantity: 1, unitPrice: 12.00, total: 12.00 },
        { id: 3, description: 'Labor - Oil Change', quantity: 1, unitPrice: 25.00, total: 25.00 },
        { id: 4, description: 'Tax', quantity: 1, unitPrice: 3.00, total: 3.00 }
      ]
    }
  ] : [
    {
      id: 1,
      clientName: 'Sarah Johnson',
      vehicle: '2019 BMW X3',
      serviceType: 'Engine Diagnostics',
      status: 'pending',
      date: '2024-06-07',
      total: 285.00,
      items: [
        { id: 1, description: 'Diagnostic Scan', quantity: 1, unitPrice: 150.00, total: 150.00 },
        { id: 2, description: 'Labor - Diagnosis', quantity: 1.5, unitPrice: 85.00, total: 127.50 },
        { id: 3, description: 'Tax', quantity: 1, unitPrice: 7.50, total: 7.50 }
      ],
      notes: 'Check engine light is on. Need to diagnose potential issues.'
    },
    {
      id: 2,
      clientName: 'Mike Davis',
      vehicle: '2017 Chevrolet Malibu',
      serviceType: 'Transmission Service',
      status: 'revised',
      date: '2024-06-06',
      total: 350.00,
      items: [
        { id: 1, description: 'Transmission Fluid', quantity: 6, unitPrice: 15.00, total: 90.00 },
        { id: 2, description: 'Transmission Filter', quantity: 1, unitPrice: 45.00, total: 45.00 },
        { id: 3, description: 'Labor - Transmission Service', quantity: 2.5, unitPrice: 85.00, total: 212.50 },
        { id: 4, description: 'Tax', quantity: 1, unitPrice: 2.50, total: 2.50 }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'revised': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApproveQuote = (quoteId: number) => {
    toast({
      title: "Quote Approved",
      description: "The quote has been approved and the workshop has been notified.",
    });
  };

  const handleRejectQuote = (quoteId: number) => {
    toast({
      title: "Quote Rejected",
      description: "The quote has been rejected. You can request revisions.",
    });
  };

  const addItemToQuote = () => {
    if (!newItem.description || newItem.unitPrice <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all item details.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Item Added",
      description: "Item has been added to the quote.",
    });

    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
  };

  const sendQuote = () => {
    toast({
      title: "Quote Sent",
      description: "The quote has been sent to the client for approval.",
    });
    setShowNewQuoteForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userRole === 'client' ? 'My Quotes' : 'Quotation Management'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'client' 
              ? 'Review and manage service quotes from workshops' 
              : 'Create and manage service quotations for clients'}
          </p>
        </div>
        {userRole === 'workshop' && (
          <Button 
            onClick={() => setShowNewQuoteForm(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        )}
      </div>

      {/* New Quote Form */}
      {showNewQuoteForm && userRole === 'workshop' && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Quote</CardTitle>
            <CardDescription>
              Build a detailed quote for your client with itemized pricing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quote Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input id="clientName" placeholder="Enter client name" />
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Input id="vehicle" placeholder="e.g., 2020 Honda Civic" />
              </div>
              <div>
                <Label htmlFor="serviceType">Service Type</Label>
                <Input id="serviceType" placeholder="e.g., Brake Service" />
              </div>
            </div>

            {/* Add Items */}
            <div>
              <Label className="text-base font-semibold">Quote Items</Label>
              <div className="mt-2 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Item description"
                      value={newItem.description}
                      onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Unit Price"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    />
                    <Button onClick={addItemToQuote} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or recommendations..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={sendQuote} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Send className="h-4 w-4 mr-2" />
                Send Quote
              </Button>
              <Button variant="outline" onClick={() => setShowNewQuoteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quotes List */}
      <div className="grid gap-4">
        {mockQuotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-3">
                    {userRole === 'workshop' && (
                      <span>Quote #{quote.id.toString().padStart(3, '0')}</span>
                    )}
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {userRole === 'workshop' ? `Client: ${quote.clientName}` : `Workshop Quote`} • 
                    {quote.vehicle} • {quote.serviceType} • {quote.date}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${quote.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Items Table */}
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
                  {quote.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {quote.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {quote.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  {userRole === 'workshop' && (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {userRole === 'client' && quote.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRejectQuote(quote.id)}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleApproveQuote(quote.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                )}

                {userRole === 'workshop' && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Send className="h-4 w-4 mr-2" />
                      Resend
                    </Button>
                    {quote.status !== 'approved' && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Revise
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuotationManager;
