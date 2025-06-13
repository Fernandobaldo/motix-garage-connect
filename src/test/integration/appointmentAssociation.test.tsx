
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import ManualAppointmentBooking from '@/components/clients/ManualAppointmentBooking';

vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockClient, error: null })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  },
}));

const mockUseAuth = vi.mocked(useAuth);
const mockClient = {
  id: 'client-123',
  full_name: 'John Doe',
  phone: '123-456-7890',
  email: 'john@example.com',
};

describe('Appointment Association Integration', () => {
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
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      updateProfile: vi.fn(),
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  it('should create guest client and associate with workshop when booking appointment', async () => {
    const mockOnSuccess = vi.fn();
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Mock successful client creation
    const mockFromChain = {
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockClient, error: null })),
        })),
      })),
    };
    
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'clients') return mockFromChain as any;
      if (table === 'vehicles') return {
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: { id: 'vehicle-123', make: 'Toyota', model: 'Camry' }, 
              error: null 
            })),
          })),
        })),
      } as any;
      if (table === 'appointments') return {
        insert: vi.fn(() => Promise.resolve({ error: null })),
      } as any;
      return mockFromChain as any;
    });

    renderWithProviders(
      <ManualAppointmentBooking
        onSuccess={mockOnSuccess}
        existingClients={[]}
      />
    );

    // Switch to guest appointment tab
    const guestTab = screen.getByText('Guest Appointment');
    fireEvent.click(guestTab);

    // Fill in guest client form
    const nameInput = screen.getByLabelText(/full name/i);
    const phoneInput = screen.getByLabelText(/phone/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(phoneInput, { target: { value: '123-456-7890' } });

    // Fill in vehicle form
    const makeInput = screen.getByLabelText(/make/i);
    const modelInput = screen.getByLabelText(/model/i);
    const plateInput = screen.getByLabelText(/license plate/i);

    fireEvent.change(makeInput, { target: { value: 'Toyota' } });
    fireEvent.change(modelInput, { target: { value: 'Camry' } });
    fireEvent.change(plateInput, { target: { value: 'ABC123' } });

    // Fill in appointment details
    const serviceTypeInput = screen.getByLabelText(/service type/i);
    fireEvent.change(serviceTypeInput, { target: { value: 'Oil Change' } });

    // Set appointment date and time
    const dateInput = screen.getByRole('button', { name: /pick a date/i });
    fireEvent.click(dateInput);
    
    const timeSelect = screen.getByDisplayValue('09:00');
    fireEvent.change(timeSelect, { target: { value: '10:00' } });

    // Submit the form
    const submitButton = screen.getByText('Create Appointment');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFromChain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: 'workshop-tenant',
          full_name: 'John Doe',
          phone: '123-456-7890',
        })
      );
    });
  });

  it('should handle existing client selection with license plate search', async () => {
    const existingClients = [
      {
        id: 'existing-client',
        full_name: 'Jane Smith',
        phone: '987-654-3210',
        email: 'jane@example.com',
        vehicles: [
          {
            id: 'existing-vehicle',
            make: 'Honda',
            model: 'Civic',
            year: 2020,
            license_plate: 'XYZ789',
          },
        ],
      },
    ];

    renderWithProviders(
      <ManualAppointmentBooking
        onSuccess={vi.fn()}
        existingClients={existingClients}
      />
    );

    // Should be on existing client tab by default
    expect(screen.getByText('Search by License Plate')).toBeInTheDocument();

    // The license plate search field should be available
    const plateSearchInput = screen.getByPlaceholderText(/enter license plate/i);
    expect(plateSearchInput).toBeInTheDocument();
    
    // Client selector should also be available as fallback
    expect(screen.getByText('- OR -')).toBeInTheDocument();
  });
});
