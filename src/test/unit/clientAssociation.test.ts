
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useClientAssociation } from '@/hooks/useClientAssociation';
import { useAuth } from '@/hooks/useAuth';

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
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('should fetch association stats for workshop users', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: {
        id: 'workshop-user',
        role: 'workshop',
        tenant_id: 'workshop-tenant',
        full_name: 'Workshop User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: null,
        last_login_at: null,
      },
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    const mockStats = {
      authenticated_clients: 15,
      guest_clients: 8,
      total_clients: 23,
      vehicles: 35,
      appointments: 42,
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc).mockResolvedValue({ data: mockStats, error: null });

    const { result } = renderHook(() => useClientAssociation(), { wrapper });

    await waitFor(() => {
      expect(result.current.associationStats).toEqual(mockStats);
    });

    expect(supabase.rpc).toHaveBeenCalledWith('get_workshop_association_stats', {
      p_tenant_id: 'workshop-tenant',
    });
  });

  it('should not fetch data for non-workshop users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: {
        id: 'client-user',
        role: 'client',
        tenant_id: 'client-tenant',
        full_name: 'Client User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: null,
        last_login_at: null,
      },
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    const { result } = renderHook(() => useClientAssociation(), { wrapper });

    expect(result.current.statsLoading).toBe(false);
    expect(result.current.associationStats).toBeUndefined();
  });

  it('should detect association issues', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      profile: {
        id: 'workshop-user',
        role: 'workshop',
        tenant_id: 'workshop-tenant',
        full_name: 'Workshop User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: null,
        last_login_at: null,
      },
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    const mockIssues = [
      {
        appointment_id: 'apt-1',
        client_id: 'client-1',
        guest_client_id: null,
        vehicle_id: 'vehicle-1',
        workshop_tenant_id: 'workshop-tenant',
        association_status: 'client_mismatch',
      },
    ];

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: mockIssues, error: null });

    const { result } = renderHook(() => useClientAssociation(), { wrapper });

    await waitFor(() => {
      expect(result.current.hasIssues).toBe(true);
      expect(result.current.associationIssues).toEqual(mockIssues);
    });
  });
});
