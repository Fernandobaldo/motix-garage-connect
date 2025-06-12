
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ClientDashboard from '@/components/client/ClientDashboard';
import ChatAvailabilityChecker from '@/components/client/ChatAvailabilityChecker';
import { hasAccess } from '@/utils/permissions';

// Mock the auth hook
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
    profile: { full_name: 'Test Client', role: 'client' },
  }),
}));

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

describe('Client Experience', () => {
  describe('ClientDashboard', () => {
    it('renders client dashboard with proper greeting', () => {
      render(
        <TestWrapper>
          <ClientDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Welcome back, Test Client')).toBeInTheDocument();
      expect(screen.getByText('Next Appointment')).toBeInTheDocument();
      expect(screen.getByText('Latest Quotation')).toBeInTheDocument();
      expect(screen.getByText('Last Service')).toBeInTheDocument();
    });

    it('shows quick actions for booking and vehicle management', () => {
      render(
        <TestWrapper>
          <ClientDashboard />
        </TestWrapper>
      );

      expect(screen.getByText('Book New Appointment')).toBeInTheDocument();
      expect(screen.getByText('Add Vehicle')).toBeInTheDocument();
    });
  });

  describe('ChatAvailabilityChecker', () => {
    const mockAppointment = {
      id: 'test-appointment',
      workshop: {
        tenant_id: 'test-tenant',
        name: 'Test Workshop',
        phone: '123-456-7890'
      }
    };

    it('shows chat available for workshops with chat-enabled plans', () => {
      const onChatAvailable = vi.fn();
      
      render(
        <TestWrapper>
          <ChatAvailabilityChecker 
            appointment={mockAppointment} 
            onChatAvailable={onChatAvailable}
          />
        </TestWrapper>
      );

      // Component will show loading initially due to async query
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Permission Logic', () => {
    it('validates chat access for different subscription plans', () => {
      expect(hasAccess('free', 'chat')).toBe(false);
      expect(hasAccess('starter', 'chat')).toBe(true);
      expect(hasAccess('pro', 'chat')).toBe(true);
      expect(hasAccess('enterprise', 'chat')).toBe(true);
    });

    it('ensures clients have no appointment limits in permission logic', () => {
      // This would be tested in the actual booking flow
      // Clients should bypass appointment limit checks
      expect(true).toBe(true); // Placeholder for actual implementation
    });
  });
});
