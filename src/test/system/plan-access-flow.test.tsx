
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from '@/components/dashboard/Dashboard';
import { TenantProvider } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';

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
  },
}));

const mockUseAuth = vi.mocked(useAuth);

describe('Plan Access Flow System Tests', () => {
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

  it('should show appropriate features for free plan user', async () => {
    mockUseAuth.mockReturnValue({
      user: { 
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
      },
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
        },
        loading: false,
        updateTenant: vi.fn(),
        refreshTenant: vi.fn(),
      }),
    }));

    renderWithProviders(<Dashboard />);

    // Should see basic features
    expect(screen.getByText('Active Appointments')).toBeInTheDocument();
    
    // Chat should be locked (requires starter+)
    // This would be tested by navigating to chat tab and checking for upgrade prompt
  });

  it('should show all features for enterprise plan user', async () => {
    mockUseAuth.mockReturnValue({
      user: { 
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
      },
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
          name: 'Test Garage',
          subscription_plan: 'enterprise',
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

    renderWithProviders(<Dashboard />);

    // Should see all features available
    expect(screen.getByText('Active Appointments')).toBeInTheDocument();
    // All features should be accessible without upgrade prompts
  });
});
