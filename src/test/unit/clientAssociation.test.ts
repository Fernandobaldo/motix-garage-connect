
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClientAssociation } from '@/hooks/useClientAssociation';
import { useAuth } from '@/hooks/useAuth';
import React from 'react';

// Mock hooks
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);

describe('useClientAssociation Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseAuth.mockReturnValue({
      user: null,
      profile: {
        id: 'test-user',
        role: 'workshop',
        tenant_id: 'test-tenant',
        full_name: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: null,
        last_login_at: null,
      },
      session: null,
      loading: false,
      profileError: null,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  it('should fetch association statistics successfully', async () => {
    const mockStats = {
      authenticated_clients: 10,
      guest_clients: 5,
      total_clients: 15,
      vehicles: 20,
      appointments: 30,
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockStats, error: null });

    const { result } = renderHook(() => useClientAssociation(), { wrapper });

    await waitFor(() => {
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should handle association statistics error', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc).mockResolvedValue({ 
      data: null, 
      error: { message: 'Database error' }
    });

    const { result } = renderHook(() => useClientAssociation(), { wrapper });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should verify associations', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: {}, error: null }) // Initial stats call
      .mockResolvedValueOnce({ data: [], error: null }); // Verify call

    const { result } = renderHook(() => useClientAssociation(), { wrapper });

    await waitFor(() => {
      expect(result.current.verifyAssociations).toBeDefined();
    });

    const verifyPromise = result.current.verifyAssociations();
    
    await waitFor(() => {
      expect(result.current.verifying).toBe(false);
    });

    await expect(verifyPromise).resolves.toBeUndefined();
  });
});
