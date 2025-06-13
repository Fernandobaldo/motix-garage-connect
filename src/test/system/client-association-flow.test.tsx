import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import ClientAssociationManager from '@/components/dashboard/ClientAssociationManager';
import { createMockAuthContext } from '@/test/utils/mockAuthProvider';

vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Client Association System Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseAuth.mockReturnValue(createMockAuthContext({
      user: { id: 'workshop-user' } as any,
      profile: {
        id: 'workshop-user',
        role: 'workshop',
        tenant_id: 'workshop-tenant',
        full_name: 'Workshop Owner',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        phone: null,
        last_login_at: null,
      },
    }));
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('should display association statistics correctly', async () => {
    const mockStats = {
      authenticated_clients: 25,
      guest_clients: 15,
      total_clients: 40,
      vehicles: 60,
      appointments: 120,
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: mockStats, error: null })
      .mockResolvedValueOnce({ data: [], error: null });

    renderWithProviders(<ClientAssociationManager />);

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
    });

    expect(screen.getByText('Account Clients')).toBeInTheDocument();
    expect(screen.getByText('Guest Clients')).toBeInTheDocument();
    expect(screen.getByText('Vehicles')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
  });

  it('should show association issues when detected', async () => {
    const mockStats = {
      authenticated_clients: 10,
      guest_clients: 5,
      total_clients: 15,
      vehicles: 20,
      appointments: 30,
    };

    const mockIssues = [
      {
        appointment_id: 'apt-123',
        client_id: 'client-456',
        guest_client_id: null,
        vehicle_id: 'vehicle-789',
        workshop_tenant_id: 'workshop-tenant',
        association_status: 'client_mismatch',
      },
      {
        appointment_id: 'apt-456',
        client_id: null,
        guest_client_id: 'guest-789',
        vehicle_id: 'vehicle-101',
        workshop_tenant_id: 'workshop-tenant',
        association_status: 'vehicle_mismatch',
      },
    ];

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: mockStats, error: null })
      .mockResolvedValueOnce({ data: mockIssues, error: null });

    renderWithProviders(<ClientAssociationManager />);

    await waitFor(() => {
      expect(screen.getByText(/2 association issues/i)).toBeInTheDocument();
      expect(screen.getByText('2 Issues Found')).toBeInTheDocument();
    });

    // Check that individual issues are displayed
    expect(screen.getByText(/Appointment apt-123/)).toBeInTheDocument();
    expect(screen.getByText(/client_mismatch/)).toBeInTheDocument();
    expect(screen.getByText(/Appointment apt-456/)).toBeInTheDocument();
    expect(screen.getByText(/vehicle_mismatch/)).toBeInTheDocument();
  });

  it('should handle association verification', async () => {
    const mockStats = {
      authenticated_clients: 5,
      guest_clients: 3,
      total_clients: 8,
      vehicles: 10,
      appointments: 15,
    };

    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc)
      .mockResolvedValueOnce({ data: mockStats, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({ data: [], error: null }); // verification call

    renderWithProviders(<ClientAssociationManager />);

    await waitFor(() => {
      expect(screen.getByText('All client and vehicle associations are properly configured.')).toBeInTheDocument();
    });

    const verifyButton = screen.getByText('Verify Associations');
    fireEvent.click(verifyButton);

    expect(screen.getByText('Verifying...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Verify Associations')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    vi.mocked(supabase.rpc).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<ClientAssociationManager />);

    expect(screen.getByText('Loading association data...')).toBeInTheDocument();
  });
});
