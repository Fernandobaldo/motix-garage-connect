
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantProvider } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { FeatureAccess } from '@/components/permissions/FeatureAccess';
import { UsageDashboard } from '@/components/permissions/UsageDashboard';

// Mock the auth hook
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
    rpc: () => Promise.resolve({ data: [{ appointments_used: 15, storage_used: 50000000 }], error: null }),
  },
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Plan Workflow Integration Tests', () => {
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

  const renderWithProviders = (ui: React.ReactElement, plan = 'free') => {
    // Mock tenant with specific plan
    vi.doMock('@/hooks/useTenant', () => ({
      useTenant: () => ({
        tenant: {
          id: 'test-tenant',
          name: 'Test Garage',
          subscription_plan: plan,
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subdomain: null,
        },
        loading: false,
        updateTenant: vi.fn(),
        refreshTenant: vi.fn(),
      }),
    }));

    return render(
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          {ui}
        </TenantProvider>
      </QueryClientProvider>
    );
  };

  it('should show upgrade prompt for free user accessing chat', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user' } as any,
      profile: { id: 'test-user', role: 'workshop', tenant_id: 'test-tenant' } as any,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    renderWithProviders(
      <FeatureAccess feature="chat">
        <div>Chat Interface</div>
      </FeatureAccess>,
      'free'
    );

    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
    expect(screen.getByText('This feature is available starting from the Starter plan.')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('should allow starter user to access chat but restrict inventory', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user' } as any,
      profile: { id: 'test-user', role: 'workshop', tenant_id: 'test-tenant' } as any,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    const { rerender } = renderWithProviders(
      <FeatureAccess feature="chat">
        <div>Chat Interface</div>
      </FeatureAccess>,
      'starter'
    );

    expect(screen.getByText('Chat Interface')).toBeInTheDocument();

    rerender(
      <FeatureAccess feature="inventory">
        <div>Inventory Management</div>
      </FeatureAccess>
    );

    expect(screen.getByText('Premium Feature')).toBeInTheDocument();
  });

  it('should show usage dashboard with correct limits', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'test-user' } as any,
      profile: { id: 'test-user', role: 'workshop', tenant_id: 'test-tenant' } as any,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    renderWithProviders(<UsageDashboard />, 'free');

    await waitFor(() => {
      expect(screen.getByText('Usage & Limits')).toBeInTheDocument();
      expect(screen.getByText('Current Plan:')).toBeInTheDocument();
      expect(screen.getByText('free')).toBeInTheDocument();
    });
  });
});
