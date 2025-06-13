
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, DollarSign, FileText, Calculator } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LicensePlateSearchField from '@/components/common/LicensePlateSearchField';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemType: 'service' | 'part' | 'labor' | 'other';
}

interface QuotationFormProps {
  onSuccess: () => void;
}

const QuotationForm = ({ onSuccess }: QuotationFormProps) => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<{ id: string; name: string; type: 'auth' | 'guest' } | null>(null);
  
  const [formData, setFormData] = useState({
    description: '',
    validUntil: '',
    taxRate: 0,
  });

  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      itemType: 'service' as const,
    },
  ]);

  const handleVehicleSelect = (vehicle: any) => {
    setSelectedVehicle(vehicle);
  };

  const handleClientSelect = (clientId: string, clientName: string, clientType: 'auth' | 'guest') => {
    setSelectedClient({ id: clientId, name: clientName, type: clientType });
  };

  const addItem = () => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      itemType: 'service',
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * (formData.taxRate / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVehicle || !selectedClient) {
      toast.error('Please select a vehicle using the license plate search');
      return;
    }

    if (!profile?.tenant_id) {
      toast.error('Unable to create quotation - no workshop selected');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create quotation
      const { data: quotation, error: quotationError } = await supabase
        .from('quotations')
        .insert({
          tenant_id: profile.tenant_id,
          client_id: selectedClient.id,
          workshop_id: profile.id,
          vehicle_id: selectedVehicle.vehicle_id,
          description: formData.description,
          valid_until: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
          tax_rate: formData.taxRate / 100,
          total_cost: calculateTotal(),
          parts_cost: items.filter(i => i.itemType === 'part').reduce((sum, item) => sum + item.totalPrice, 0),
          labor_cost: items.filter(i => i.itemType === 'labor').reduce((sum, item) => sum + item.totalPrice, 0),
        })
        .select('id')
        .single();

      if (quotationError) throw quotationError;

      // Create quotation items
      const quotationItems = items.map(item => ({
        quotation_id: quotation.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        item_type: item.itemType,
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(quotationItems);

      if (itemsError) throw itemsError;

      toast.success('Quotation created successfully');
      onSuccess();
    } catch (error) {
      console.error('Error creating quotation:', error);
      toast.error('Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <LicensePlateSearchField
            label="Search Vehicle by License Plate"
            placeholder="Enter license plate to find vehicle and client..."
            onVehicleSelect={handleVehicleSelect}
            onClientSelect={handleClientSelect}
            required
          />

          {selectedVehicle && selectedClient && (
            <Card>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Vehicle:</span>
                    <span>{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">License Plate:</span>
                    <Badge variant="outline">{selectedVehicle.license_plate}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Client:</span>
                    <div className="flex items-center space-x-2">
                      <span>{selectedClient.name}</span>
                      <Badge variant={selectedClient.type === 'auth' ? 'default' : 'secondary'} className="text-xs">
                        {selectedClient.type === 'auth' ? 'Account' : 'Guest'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the work to be done..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="validUntil">Valid Until</Label>
            <Input
              id="validUntil"
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Quotation Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
              <div className="col-span-4">
                <Label htmlFor={`description-${item.id}`}>Description</Label>
                <Input
                  id={`description-${item.id}`}
                  placeholder="Item description..."
                  value={item.description}
                  onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`itemType-${item.id}`}>Type</Label>
                <select
                  id={`itemType-${item.id}`}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={item.itemType}
                  onChange={(e) => updateItem(item.id, 'itemType', e.target.value)}
                >
                  <option value="service">Service</option>
                  <option value="part">Part</option>
                  <option value="labor">Labor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-1">
                <Label htmlFor={`quantity-${item.id}`}>Qty</Label>
                <Input
                  id={`quantity-${item.id}`}
                  type="number"
                  min="1"
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor={`unitPrice-${item.id}`}>Unit Price</Label>
                <Input
                  id={`unitPrice-${item.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label>Total</Label>
                <div className="h-10 px-3 rounded-md border bg-muted flex items-center">
                  ${item.totalPrice.toFixed(2)}
                </div>
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addItem} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Quotation Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax ({formData.taxRate}%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting || !selectedVehicle || !selectedClient}
          className="flex items-center space-x-2"
        >
          <DollarSign className="h-4 w-4" />
          <span>{isSubmitting ? 'Creating...' : 'Create Quotation'}</span>
        </Button>
      </div>
    </form>
  );
};

export default QuotationForm;
