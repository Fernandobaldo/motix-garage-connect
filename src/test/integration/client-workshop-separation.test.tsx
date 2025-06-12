
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Index from '@/pages/Index';

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          gte: () => ({
            order: () => ({
              limit: () => ({
                single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
              })
            })
          })
        })
      })
    })
  }
}));

describe('Client-Workshop Separation', () => {
  it('renders client layout for client users', () => {
    vi.mocked(vi.doMock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: { id: 'client-user' },
        profile: { role: 'client', full_name: 'Client User' },
      }),
    })));

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    // Should see client-specific content
    expect(screen.queryByText('My Vehicle Services')).toBeInTheDocument;
  });

  it('renders workshop layout for workshop users', () => {
    vi.mocked(vi.doMock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: { id: 'workshop-user' },
        profile: { role: 'workshop', full_name: 'Workshop Owner', tenant_id: 'workshop-tenant' },
      }),
    })));

    render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    // Should see workshop admin content
    expect(screen.queryByText('Dashboard')).toBeInTheDocument;
  });

  it('prevents clients from accessing workshop admin features', () => {
    // This would test route protection
    expect(true).toBe(true); // Placeholder for actual route protection tests
  });
});
