
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FeatureAccess from '@/components/permissions/FeatureAccess';
import { TenantProvider } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';

// Mock the auth hook
vi.mock('@/hooks/useAuth');

const mockUseAuth = vi.mocked(useAuth);

describe('FeatureAccess Component', () => {
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

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          {ui}
        </TenantProvider>
      </QueryClientProvider>
    );
  };

  it('should allow pro plan users to access chat feature', async () => {
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
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    // Mock tenant with pro plan
    vi.doMock('@/hooks/useTenant', () => ({
      useTenant: () => ({
        tenant: {
          id: 'test-tenant',
          name: 'Test Garage',
          subscription_plan: 'pro',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subdomain: null,
          status: 'active',
          suspended_at: null,
          suspended_by: null,
          trial_until: null,
          is_blocked: false,
        },
        loading: false,
        updateTenant: vi.fn(),
        refreshTenant: vi.fn(),
      }),
    }));

    renderWithProviders(
      <FeatureAccess feature="chat">
        <div>Chat Feature Available</div>
      </FeatureAccess>
    );

    expect(screen.getByText('Chat Feature Available')).toBeInTheDocument();
  });

  it('should block free plan users from accessing chat feature', async () => {
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
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    // Mock tenant with free plan
    vi.doMock('@/hooks/useTenant', () => ({
      useTenant: () => ({
        tenant: {
          id: 'test-tenant',
          name: 'Test Garage',
          subscription_plan: 'free',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subdomain: null,
          status: 'active',
          suspended_at: null,
          suspended_by: null,
          trial_until: null,
          is_blocked: false,
        },
        loading: false,
        updateTenant: vi.fn(),
        refreshTenant: vi.fn(),
      }),
    }));

    renderWithProviders(
      <FeatureAccess feature="chat">
        <div>Chat Feature Available</div>
      </FeatureAccess>
    );

    expect(screen.queryByText('Chat Feature Available')).not.toBeInTheDocument();
    expect(screen.getByText(/upgrade/i)).toBeInTheDocument();
  });

  it('should show upgrade message for blocked features', async () => {
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
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    // Mock tenant with free plan
    vi.doMock('@/hooks/useTenant', () => ({
      useTenant: () => ({
        tenant: {
          id: 'test-tenant',
          name: 'Test Garage',
          subscription_plan: 'free',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subdomain: null,
          status: 'active',
          suspended_at: null,
          suspended_by: null,
          trial_until: null,
          is_blocked: false,
        },
        loading: false,
        updateTenant: vi.fn(),
        refreshTenant: vi.fn(),
      }),
    }));

    renderWithProviders(
      <FeatureAccess feature="inventory" fallbackMessage="Inventory requires Pro plan">
        <div>Inventory Feature</div>
      </FeatureAccess>
    );

    expect(screen.getByText('Inventory requires Pro plan')).toBeInTheDocument();
  });

  it('should allow unlimited features for enterprise plan', async () => {
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
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    // Mock tenant with enterprise plan
    vi.doMock('@/hooks/useTenant', () => ({
      useTenant: () => ({
        tenant: {
          id: 'test-tenant',
          name: 'Test Enterprise',
          subscription_plan: 'enterprise',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subdomain: null,
          status: 'active',
          suspended_at: null,
          suspended_by: null,
          trial_until: null,
          is_blocked: false,
        },
        loading: false,
        updateTenant: vi.fn(),
        refreshTenant: vi.fn(),
      }),
    }));

    renderWithProviders(
      <FeatureAccess feature="api_access">
        <div>API Access Available</div>
      </FeatureAccess>
    );

    expect(screen.getByText('API Access Available')).toBeInTheDocument();
  });

  it('should handle loading state', async () => {
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
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });

    // Mock tenant loading state
    vi.doMock('@/hooks/useTenant', () => ({
      useTenant: () => ({
        tenant: {
          id: 'test-tenant',
          name: 'Test Garage',
          subscription_plan: 'free',
          settings: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          subdomain: null,
          status: 'active',
          suspended_at: null,
          suspended_by: null,
          trial_until: null,
          is_blocked: false,
        },
        loading: true,
        updateTenant: vi.fn(),
        refreshTenant: vi.fn(),
      }),
    }));

    renderWithProviders(
      <FeatureAccess feature="chat">
        <div>Chat Feature</div>
      </FeatureAccess>
    );

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
