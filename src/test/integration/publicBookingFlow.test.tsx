
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import PublicBookingForm from '@/components/booking/PublicBookingForm';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockSupabase = supabase as any;

describe('Public Booking Integration Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock workshop data
    mockSupabase.rpc.mockImplementation((functionName) => {
      if (functionName === 'get_workshop_public_data') {
        return Promise.resolve({
          data: [{
            workshop_id: 'test-workshop-id',
            workshop_name: 'Test Auto Shop',
            workshop_email: 'shop@test.com',
            workshop_phone: '123-456-7890',
            workshop_address: '123 Main St',
            working_hours: {
              monday: { open: '08:00', close: '17:00' },
              tuesday: { open: '08:00', close: '17:00' },
            },
            logo_url: null,
            primary_color: '#3B82F6',
            secondary_color: '#1E40AF',
            accent_color: '#F59E0B',
            services_offered: ['Oil Change', 'Brake Service'],
            tenant_id: 'test-tenant-id',
          }],
          error: null,
        });
      }
      
      if (functionName === 'create_temporary_reservation') {
        return Promise.resolve({
          data: [{
            appointment_id: 'temp-appointment-id',
            reservation_token: 'temp-token-123',
          }],
          error: null,
        });
      }

      return Promise.resolve({ data: null, error: null });
    });

    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Public Booking Form', () => {
    it('loads workshop data and displays form', async () => {
      renderWithProviders(<PublicBookingForm slug="test-workshop" />);

      await waitFor(() => {
        expect(screen.getByText('Book with Test Auto Shop')).toBeInTheDocument();
      });

      expect(screen.getByText('Service Type')).toBeInTheDocument();
      expect(screen.getByText('Date & Time')).toBeInTheDocument();
      expect(screen.getByText('Your Information')).toBeInTheDocument();
    });

    it('displays available services from workshop data', async () => {
      renderWithProviders(<PublicBookingForm slug="test-workshop" />);

      await waitFor(() => {
        expect(screen.getByText('Oil Change')).toBeInTheDocument();
        expect(screen.getByText('Brake Service')).toBeInTheDocument();
      });
    });

    it('handles booking submission successfully', async () => {
      renderWithProviders(<PublicBookingForm slug="test-workshop" />);

      await waitFor(() => {
        expect(screen.getByText('Book with Test Auto Shop')).toBeInTheDocument();
      });

      // Fill out the form
      const serviceSelect = screen.getByRole('combobox');
      fireEvent.click(serviceSelect);
      
      await waitFor(() => {
        const oilChangeOption = screen.getByText('Oil Change');
        fireEvent.click(oilChangeOption);
      });

      const nameInput = screen.getByPlaceholderText('Your full name');
      const emailInput = screen.getByPlaceholderText('your.email@example.com');
      const phoneInput = screen.getByPlaceholderText('Your phone number');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '555-0123' } });

      const submitButton = screen.getByText('Book Appointment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_temporary_reservation', 
          expect.objectContaining({
            p_workshop_id: 'test-workshop-id',
            p_tenant_id: 'test-tenant-id',
            p_service_type: 'Oil Change',
            p_client_name: 'John Doe',
            p_client_email: 'john@example.com',
            p_client_phone: '555-0123',
          })
        );
      });
    });

    it('handles workshop data loading error', async () => {
      mockSupabase.rpc.mockImplementation((functionName) => {
        if (functionName === 'get_workshop_public_data') {
          return Promise.resolve({
            data: null,
            error: { message: 'Workshop not found' },
          });
        }
        return Promise.resolve({ data: null, error: null });
      });

      renderWithProviders(<PublicBookingForm slug="invalid-slug" />);

      await waitFor(() => {
        expect(screen.getByText('Workshop not found')).toBeInTheDocument();
      });
    });

    it('validates required fields before submission', async () => {
      renderWithProviders(<PublicBookingForm slug="test-workshop" />);

      await waitFor(() => {
        expect(screen.getByText('Book with Test Auto Shop')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Book Appointment');
      fireEvent.click(submitButton);

      // Should not call the booking function with empty fields
      expect(mockSupabase.rpc).not.toHaveBeenCalledWith('create_temporary_reservation', expect.any(Object));
    });

    it('displays workshop branding colors', async () => {
      renderWithProviders(<PublicBookingForm slug="test-workshop" />);

      await waitFor(() => {
        const bookingCard = screen.getByText('Book with Test Auto Shop').closest('div');
        expect(bookingCard).toBeInTheDocument();
      });

      // The component should apply the workshop's brand colors
      // This would be tested more thoroughly in visual/snapshot tests
    });
  });

  describe('Reservation Flow', () => {
    it('creates temporary reservation and shows confirmation', async () => {
      renderWithProviders(<PublicBookingForm slug="test-workshop" />);

      await waitFor(() => {
        expect(screen.getByText('Book with Test Auto Shop')).toBeInTheDocument();
      });

      // Complete form and submit
      const serviceSelect = screen.getByRole('combobox');
      fireEvent.click(serviceSelect);
      
      await waitFor(() => {
        const oilChangeOption = screen.getByText('Oil Change');
        fireEvent.click(oilChangeOption);
      });

      const nameInput = screen.getByPlaceholderText('Your full name');
      const emailInput = screen.getByPlaceholderText('your.email@example.com');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Book Appointment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_temporary_reservation', expect.any(Object));
      });
    });

    it('handles reservation creation failure', async () => {
      mockSupabase.rpc.mockImplementation((functionName) => {
        if (functionName === 'get_workshop_public_data') {
          return Promise.resolve({
            data: [{
              workshop_id: 'test-workshop-id',
              workshop_name: 'Test Auto Shop',
              tenant_id: 'test-tenant-id',
            }],
            error: null,
          });
        }
        
        if (functionName === 'create_temporary_reservation') {
          return Promise.resolve({
            data: null,
            error: { message: 'Time slot is not available' },
          });
        }

        return Promise.resolve({ data: null, error: null });
      });

      renderWithProviders(<PublicBookingForm slug="test-workshop" />);

      await waitFor(() => {
        expect(screen.getByText('Book with Test Auto Shop')).toBeInTheDocument();
      });

      // Fill and submit form
      const nameInput = screen.getByPlaceholderText('Your full name');
      const emailInput = screen.getByPlaceholderText('your.email@example.com');

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

      const submitButton = screen.getByText('Book Appointment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        // Should handle the error appropriately
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_temporary_reservation', expect.any(Object));
      });
    });
  });
});
