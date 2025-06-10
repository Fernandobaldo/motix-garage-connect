// This factory is now simplified for manual testing scenarios only
export const createTestUser = (overrides: any = {}) => ({
  id: `test-user-${Date.now()}`,
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'client',
  tenant_id: null,
  phone: '+1234567890',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// Keep only basic scenarios for development testing
export const createUserScenarios = () => ({
  basicClient: createTestUser({ role: 'client' }),
  basicWorkshop: createTestUser({ role: 'workshop' }),
});
