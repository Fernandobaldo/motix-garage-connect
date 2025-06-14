
// Shared test helpers, mocks, and setup for useServiceRecords tests

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, FC } from 'react';
import { supabase } from '@/integrations/supabase/client';
import * as useAuthModule from '@/hooks/useAuth';
import { vi } from 'vitest';

// Mock dependencies (these will have effect process-wide, as jest/vitest hoists)
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/useAuth');
vi.mock('@/hooks/use-toast');

export const mockSupabase = supabase as any;
export const mockUseAuth = vi.mocked(useAuthModule.useAuth);

// QueryClient Provider wrapper for react-query hooks
export const createWrapper = (): FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper: FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

export const setupBaseMockAuth = () => {
  mockUseAuth.mockImplementation(() => ({
    user: {
      id: 'user-123',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: 'user@example.com',
      email_confirmed_at: new Date().toISOString(),
      phone: null,
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: 'authenticated',
      factors: [],
      identities: []
    },
    profile: {
      id: 'user-123',
      full_name: 'Test User',
      phone: null,
      role: 'workshop',
      tenant_id: 'tenant-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null
    }
  }));
};
