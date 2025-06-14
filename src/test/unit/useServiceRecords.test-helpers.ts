
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
export const createWrapper = (): FC<{ children: ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

export const setupBaseMockAuth = () => {
  mockUseAuth.mockImplementation(() => ({
    user: { id: 'user-123' },
    profile: { tenant_id: 'tenant-123', role: 'workshop' },
  }));
};
