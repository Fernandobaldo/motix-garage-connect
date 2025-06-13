
import { vi } from 'vitest';
import type { AuthContextType } from '@/types/auth';

export const createMockAuthContext = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  profile: null,
  session: null,
  loading: false,
  profileError: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  updateProfile: vi.fn(),
  ...overrides,
});

export const createMockProfile = (overrides: any = {}) => ({
  id: 'test-user',
  role: 'workshop' as const,
  tenant_id: 'test-tenant',
  full_name: 'Test User',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  phone: null,
  last_login_at: null,
  ...overrides,
});

export const createMockUser = (overrides: any = {}) => ({
  id: 'test-user',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  email: 'test@example.com',
  email_confirmed_at: new Date().toISOString(),
  phone: null,
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  role: 'authenticated',
  factors: [],
  identities: [],
  ...overrides,
});
