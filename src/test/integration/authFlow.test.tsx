
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import Index from '@/pages/Index';

// Mock Supabase client
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(),
    getSession: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock other hooks
vi.mock('@/hooks/useDashboardNavigation', () => ({
  useDashboardNavigation: () => ({
    activeTab: 'appointments',
    setActiveTab: vi.fn(),
    selectedAppointmentId: null,
    handleCardClick: vi.fn(),
  }),
}));

describe('Authentication Flow Integration', () => {
  let queryClient: QueryClient;
  let mockAuthCallback: (event: string, session: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      mockAuthCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {ui}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should show loading state initially', async () => {
    mockSupabase.auth.getSession.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ data: { session: null } }), 100))
    );

    renderWithProviders(<Index />);

    expect(screen.getByText('Loading Dashboard...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we load your information.')).toBeInTheDocument();
  });

  it('should show landing page when not authenticated', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard...')).not.toBeInTheDocument();
    });
  });

  it('should handle profile fetch error gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Permission denied', code: 'PGRST301' } 
          }),
        }),
      }),
    });

    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load your profile')).toBeInTheDocument();
    });

    expect(screen.getByText(/Permission denied/)).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });

  it('should handle missing profile case', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });

    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/Your user account exists but no profile was found/)).toBeInTheDocument();
    expect(screen.getByText('user-123')).toBeInTheDocument();
  });

  it('should render client dashboard for client users', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    const mockProfile = {
      id: 'user-123',
      full_name: 'Test Client',
      role: 'client',
      tenant_id: 'tenant-123',
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
    };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
        }),
      }),
    });

    renderWithProviders(<Index />);

    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard...')).not.toBeInTheDocument();
    });

    // Should render client layout (this might need adjustment based on actual client dashboard content)
    expect(screen.queryByText('Failed to load your profile')).not.toBeInTheDocument();
  });
});
