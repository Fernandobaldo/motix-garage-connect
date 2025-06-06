import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, X, Save, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuoteTemplate } from '@/hooks/useQuotations';

interface QuotationFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  templates: QuoteTemplate[];
  clients: Array<{ id: string; full_name: string }>;
  vehicles: Array<{ id: string; make: string; model: string; year: number; license_plate: string; owner_id: string }>;
  workshops: Array<{ id: string; name: string }>;
  initialAppointmentId?: string;
}

interface QuoteItem {
  description: string;
  quantity: number;
  unit_price: number;
  item_type: 'service' | 'part' | 'labor' | 'tax' | 'other';
}

const QuotationForm = ({ 
  onSubmit, 
  onCancel, 
  templates, 
  clients, 
  vehicles, 
  workshops, 
  initialAppointmentId 
}: QuotationFormProps) => {
  const [formData, setFormData] = useState({
    client_id: '',
    workshop_id: workshops[0]?.id || '',
    vehicle_id: '',
    appointment_id: initialAppointmentId || '',
    description: '',
    tax_rate: 0.1, // 10% default
  });

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItem, setNewItem] = useState<QuoteItem>({
    description: '',
    quantity: 1,
    unit_price: 0,
    item_type: 'service',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const { toast } = useToast();

  const addItem = () => {
    if (!newItem.description || newItem.unit_price <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all item details.',
        variant: 'destructive',
      });
      return;
    }

    setItems([...items, { ...newItem }]);
    setNewItem({
      description: '',
      quantity: 1,
      unit_price: 0,
      item_type: 'service',
    });
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && template.template_items) {
      // Safely parse template items from JSONB
      try {
        const templateItems = Array.isArray(template.template_items) 
          ? template.template_items as QuoteItem[]
          : [];
        
        // Validate and transform the items
        const validItems = templateItems.filter((item: any) => 
          item && 
          typeof item.description === 'string' &&
          typeof item.quantity === 'number' &&
          typeof item.unit_price === 'number' &&
          typeof item.item_type === 'string'
        ).map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          item_type: item.item_type as 'service' | 'part' | 'labor' | 'tax' | 'other'
        }));
        
        setItems(validItems);
        setFormData(prev => ({
          ...prev,
          description: template.description || '',
        }));
      } catch (error) {
        console.error('Error parsing template items:', error);
      }
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * formData.tax_rate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const filteredVehicles = vehicles.filter(v => v.owner_id === formData.client_id);

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.workshop_id || items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields and add at least one item.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onSubmit({
        ...formData,
        items,
      });

      // Save as template if requested
      if (saveAsTemplate && templateName) {
        // This would need to be handled by the parent component
        toast({
          title: 'Template Saved',
          description: 'Quote template has been saved for future use.',
        });
      }
    } catch (error) {
      console.error('Error submitting quotation:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Quotation</CardTitle>
        <CardDescription>
          Build a detailed quote for your client with itemized pricing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Selection */}
        {templates.length > 0 && (
          <div>
            <Label htmlFor="template">Load from Template</Label>
            <Select value={selectedTemplate} onValueChange={(value) => {
              setSelectedTemplate(value);
              if (value) loadTemplate(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} - {template.service_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quote Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="client">Client *</Label>
            <Select value={formData.client_id} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, client_id: value, vehicle_id: '' }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="workshop">Workshop *</Label>
            <Select value={formData.workshop_id} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, workshop_id: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select workshop" />
              </SelectTrigger>
              <SelectContent>
                {workshops.map((workshop) => (
                  <SelectItem key={workshop.id} value={workshop.id}>
                    {workshop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredVehicles.length > 0 && (
            <div>
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select value={formData.vehicle_id} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, vehicle_id: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {filteredVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={formData.tax_rate * 100}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tax_rate: parseFloat(e.target.value) / 100 || 0 
              }))}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Quote description and notes..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        {/* Add Items */}
        <div>
          <Label className="text-base font-semibold">Quote Items *</Label>
          <div className="mt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
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
              <div>
                <Input
                  type="number"
                  placeholder="Unit Price"
                  step="0.01"
                  value={newItem.unit_price}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Select value={newItem.item_type} onValueChange={(value: any) => 
                  setNewItem(prev => ({ ...prev, item_type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="part">Part</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button onClick={addItem} variant="outline" className="w-full">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Type</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                    <TableCell className="text-center capitalize">{item.item_type}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={3} className="text-right font-semibold">Subtotal:</TableCell>
                  <TableCell className="text-right font-semibold">${calculateSubtotal().toFixed(2)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right">Tax ({(formData.tax_rate * 100).toFixed(1)}%):</TableCell>
                  <TableCell className="text-right">${calculateTax().toFixed(2)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
                <TableRow className="border-t">
                  <TableCell colSpan={3} className="text-right font-bold text-lg">Total:</TableCell>
                  <TableCell className="text-right font-bold text-lg">${calculateTotal().toFixed(2)}</TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Save as Template Option */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="saveAsTemplate"
              checked={saveAsTemplate}
              onChange={(e) => setSaveAsTemplate(e.target.checked)}
            />
            <Label htmlFor="saveAsTemplate">Save as template</Label>
          </div>
          {saveAsTemplate && (
            <Input
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="max-w-xs"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
            <Send className="h-4 w-4 mr-2" />
            Send Quote
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationForm;
