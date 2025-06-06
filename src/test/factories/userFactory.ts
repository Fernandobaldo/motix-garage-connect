
export const createMockUser = (role: 'client' | 'workshop' | 'admin' = 'client') => ({
  id: `user-${role}-123`,
  email: `${role}@example.com`,
  full_name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
  role,
  tenant_id: 'tenant-123',
  phone: '+1234567890',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export const createUserScenarios = () => ({
  client: createMockUser('client'),
  workshop: createMockUser('workshop'),
  admin: createMockUser('admin'),
});
