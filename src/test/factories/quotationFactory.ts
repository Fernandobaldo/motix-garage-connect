
import { Quotation, QuotationItem } from '@/hooks/useQuotations';

export const createMockQuotation = (overrides: Partial<Quotation> = {}): Quotation => ({
  id: 'quote-123',
  tenant_id: 'tenant-123',
  client_id: 'client-123',
  workshop_id: 'workshop-123',
  vehicle_id: 'vehicle-123',
  quote_number: 'Q-2024-001',
  description: 'Brake service and inspection',
  status: 'pending',
  total_cost: 350.00,
  tax_rate: 0.13,
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  approved_at: null,
  appointment_id: null,
  parts_cost: 150.00,
  labor_cost: 200.00,
  client: { full_name: 'John Doe' },
  vehicle: { make: 'Toyota', model: 'Camry', year: 2020, license_plate: 'ABC123' },
  workshop: { name: 'Main Street Garage' },
  items: [
    createMockQuotationItem({ description: 'Brake Pads', quantity: 2, unit_price: 75.00 })
  ],
  ...overrides,
});

export const createMockQuotationItem = (overrides: Partial<QuotationItem> = {}): QuotationItem => ({
  id: 'item-123',
  quotation_id: 'quote-123',
  description: 'Service Item',
  quantity: 1,
  unit_price: 100.00,
  total_price: 100.00,
  item_type: 'service',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createQuotationScenarios = () => ({
  pending: createMockQuotation({ status: 'pending' }),
  approved: createMockQuotation({ 
    status: 'approved', 
    approved_at: new Date().toISOString() 
  }),
  rejected: createMockQuotation({ status: 'rejected' }),
  expired: createMockQuotation({ 
    status: 'pending',
    valid_until: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }),
});
