
// Simplified factory for development testing only
export const createBasicQuotation = (overrides: any = {}) => ({
  id: `quote-${Date.now()}`,
  tenant_id: 'dev-tenant',
  client_id: 'dev-client',
  workshop_id: 'dev-workshop',
  vehicle_id: 'dev-vehicle',
  quote_number: `Q-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
  description: 'Test quotation',
  status: 'pending',
  total_cost: 0,
  tax_rate: 0.13,
  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  approved_at: null,
  appointment_id: null,
  parts_cost: 0,
  labor_cost: 0,
  client: { full_name: 'Dev Client' },
  vehicle: { make: 'Test', model: 'Vehicle', year: 2023, license_plate: 'TEST123' },
  workshop: { name: 'Dev Workshop' },
  items: [],
  ...overrides,
});

export const createBasicQuotationItem = (overrides: any = {}) => ({
  id: `item-${Date.now()}`,
  quotation_id: 'quote-123',
  description: 'Test Item',
  quantity: 1,
  unit_price: 0,
  total_price: 0,
  item_type: 'service',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Remove all mock scenarios - use real data instead
export const createQuotationScenarios = () => ({});
