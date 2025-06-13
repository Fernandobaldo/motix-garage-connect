
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthState } from '@/hooks/useAuthState';
import React from 'react';

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

describe('useAuthState Hook', () => {
  let queryClient: QueryClient;
  let mockSubscription: { unsubscribe: ReturnType<typeof vi.fn> };
  let mockAuthCallback: (event: string, session: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockSubscription = { unsubscribe: vi.fn() };
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      mockAuthCallback = callback;
      return { data: { subscription: mockSubscription } };
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  it('should initialize with loading state', () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    
    const { result } = renderHook(() => useAuthState(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
    expect(result.current.profile).toBe(null);
  });

  it('should handle successful profile fetch', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    const mockProfile = {
      id: 'user-123',
      full_name: 'Test User',
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

    const { result } = renderHook(() => useAuthState(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.profileError).toBe(null);
  });

  it('should handle profile fetch error gracefully', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    const mockError = { message: 'Profile not found', code: 'PGRST116' };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      }),
    });

    const { result } = renderHook(() => useAuthState(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toBe(null);
    expect(result.current.profileError).toBe('Profile not found');
  });

  it('should retry profile fetch on network errors', async () => {
    vi.useFakeTimers();
    
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };
    const mockProfile = {
      id: 'user-123',
      full_name: 'Test User',
      role: 'client',
      tenant_id: 'tenant-123',
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
    };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    
    let callCount = 0;
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
              return Promise.resolve({ data: null, error: { code: 'PGRST000', message: 'Network error' } });
            }
            return Promise.resolve({ data: mockProfile, error: null });
          }),
        }),
      }),
    });

    const { result } = renderHook(() => useAuthState(), { wrapper });

    // Fast-forward time to trigger retry
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(callCount).toBe(2); // Initial call + 1 retry
  });

  it('should handle auth state changes', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockSession = { user: mockUser };

    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
        }),
      }),
    });

    const { result } = renderHook(() => useAuthState(), { wrapper });

    // Simulate auth state change
    mockAuthCallback('SIGNED_IN', mockSession);

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('should cleanup subscription on unmount', () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    
    const { unmount } = renderHook(() => useAuthState(), { wrapper });
    
    unmount();
    
    expect(mockSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should set loading to false when no user session exists', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    
    const { result } = renderHook(() => useAuthState(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.profile).toBe(null);
  });
});
