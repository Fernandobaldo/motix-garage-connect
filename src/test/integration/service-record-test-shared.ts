
import { vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { ServiceStatus } from '@/types/database';

export const mockSupabase = vi.mocked(supabase);
export const mockUseAuth = vi.mocked(useAuth);

export const mockProfile: import('@/types/database').Profile = {
  id: 'client-123',
  full_name: 'John Doe',
  phone: '123-456-7890',
  role: 'client',
  tenant_id: 'tenant-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  last_login_at: '2024-01-01T00:00:00Z',
};

export const mockWorkshop: import('@/types/database').Workshop = {
  id: 'workshop-123',
  name: 'Best Auto Repair',
  email: 'workshop@example.com',
  phone: '555-000-1111',
  tenant_id: 'tenant-123',
  address: '123 Main St',
  logo_url: '',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  accent_color: '#F59E0B',
  primary_color: '#3B82F6',
  secondary_color: '#1E40AF',
  working_hours: {},
  services_offered: [],
  owner_id: 'user-123',
  is_public: false,
  languages_spoken: [],
};

export const createMockVehicle = (overrides = {}) => ({
  id: 'vehicle-123',
  make: 'Toyota',
  model: 'Camry',
  year: 2020,
  license_plate: 'ABC123',
  client_id: 'client-123',
  tenant_id: 'tenant-123',
  owner_id: 'owner-123',
  fuel_type: 'gasoline',
  transmission: 'automatic',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Here is the change: default status is 'pending' and type is ServiceStatus
export const createMockServiceRecord = (
  overrides: Partial<import('@/types/database').ServiceRecordWithRelations> & { status?: ServiceStatus } = {}
): import('@/types/database').ServiceRecordWithRelations => ({
  id: 'service-123',
  tenant_id: 'tenant-123',
  service_type: 'oil_change',
  description: 'Regular oil change',
  status: (overrides.status ?? 'pending') as ServiceStatus,
  cost: 75.00,
  labor_hours: 1.5,
  mileage: 50000,
  appointment_id: null,
  client_id: 'client-123',
  estimated_completion_date: null,
  images: [],
  parts_used: [],
  quotation_id: null,
  technician_notes: '',
  vehicle_id: 'vehicle-123',
  workshop_id: 'workshop-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  client: mockProfile,
  vehicle: createMockVehicle(),
  workshop: mockWorkshop,
  ...overrides,
});
