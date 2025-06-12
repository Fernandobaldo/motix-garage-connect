
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

  const mockWorkshop = {
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
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Mock create_temporary_reservation function
    mockSupabase.rpc.mockImplementation((functionName) => {
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
      const mockOnReservationCreated = vi.fn();
      
      renderWithProviders(
        <PublicBookingForm 
          workshop={mockWorkshop} 
          onReservationCreated={mockOnReservationCreated} 
        />
      );

      expect(screen.getByText('Book Your Appointment')).toBeInTheDocument();
      expect(screen.getByText('Service Type')).toBeInTheDocument();
      expect(screen.getByText('Your Information')).toBeInTheDocument();
    });

    it('displays available services from workshop data', async () => {
      const mockOnReservationCreated = vi.fn();
      
      renderWithProviders(
        <PublicBookingForm 
          workshop={mockWorkshop} 
          onReservationCreated={mockOnReservationCreated} 
        />
      );

      // Check if services are available in the select dropdown
      const serviceSelect = screen.getByDisplayValue('');
      expect(serviceSelect).toBeInTheDocument();
    });

    it('handles booking submission successfully', async () => {
      const mockOnReservationCreated = vi.fn();
      
      renderWithProviders(
        <PublicBookingForm 
          workshop={mockWorkshop} 
          onReservationCreated={mockOnReservationCreated} 
        />
      );

      // Fill out the form
      const serviceSelect = screen.getByDisplayValue('');
      fireEvent.change(serviceSelect, { target: { value: 'Oil Change' } });

      const nameInput = screen.getByPlaceholderText('Enter your full name');
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const dateInput = screen.getByDisplayValue('');
      const timeInput = screen.getAllByDisplayValue('')[1]; // Second empty input should be time

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      fireEvent.change(timeInput, { target: { value: '10:00' } });

      const submitButton = screen.getByText('Reserve Appointment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_temporary_reservation', 
          expect.objectContaining({
            p_workshop_id: 'test-workshop-id',
            p_tenant_id: 'test-tenant-id',
            p_service_type: 'Oil Change',
            p_client_name: 'John Doe',
            p_client_email: 'john@example.com',
          })
        );
      });
    });

    it('validates required fields before submission', async () => {
      const mockOnReservationCreated = vi.fn();
      
      renderWithProviders(
        <PublicBookingForm 
          workshop={mockWorkshop} 
          onReservationCreated={mockOnReservationCreated} 
        />
      );

      const submitButton = screen.getByText('Reserve Appointment');
      fireEvent.click(submitButton);

      // Should not call the booking function with empty fields
      expect(mockSupabase.rpc).not.toHaveBeenCalledWith('create_temporary_reservation', expect.any(Object));
    });

    it('displays workshop branding colors', async () => {
      const mockOnReservationCreated = vi.fn();
      
      renderWithProviders(
        <PublicBookingForm 
          workshop={mockWorkshop} 
          onReservationCreated={mockOnReservationCreated} 
        />
      );

      const submitButton = screen.getByText('Reserve Appointment');
      expect(submitButton).toHaveStyle({ backgroundColor: mockWorkshop.primary_color });
    });
  });

  describe('Reservation Flow', () => {
    it('creates temporary reservation and shows confirmation', async () => {
      const mockOnReservationCreated = vi.fn();
      
      renderWithProviders(
        <PublicBookingForm 
          workshop={mockWorkshop} 
          onReservationCreated={mockOnReservationCreated} 
        />
      );

      // Complete form and submit
      const serviceSelect = screen.getByDisplayValue('');
      fireEvent.change(serviceSelect, { target: { value: 'Oil Change' } });

      const nameInput = screen.getByPlaceholderText('Enter your full name');
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const dateInput = screen.getByDisplayValue('');
      const timeInput = screen.getAllByDisplayValue('')[1];

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      fireEvent.change(timeInput, { target: { value: '10:00' } });

      const submitButton = screen.getByText('Reserve Appointment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_temporary_reservation', expect.any(Object));
      });

      await waitFor(() => {
        expect(mockOnReservationCreated).toHaveBeenCalledWith({
          appointment_id: 'temp-appointment-id',
          reservation_token: 'temp-token-123',
        });
      });
    });

    it('handles reservation creation failure', async () => {
      mockSupabase.rpc.mockImplementation((functionName) => {
        if (functionName === 'create_temporary_reservation') {
          return Promise.resolve({
            data: null,
            error: { message: 'Time slot is not available' },
          });
        }

        return Promise.resolve({ data: null, error: null });
      });

      const mockOnReservationCreated = vi.fn();
      
      renderWithProviders(
        <PublicBookingForm 
          workshop={mockWorkshop} 
          onReservationCreated={mockOnReservationCreated} 
        />
      );

      // Fill and submit form
      const serviceSelect = screen.getByDisplayValue('');
      const nameInput = screen.getByPlaceholderText('Enter your full name');
      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const dateInput = screen.getByDisplayValue('');
      const timeInput = screen.getAllByDisplayValue('')[1];

      fireEvent.change(serviceSelect, { target: { value: 'Oil Change' } });
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      fireEvent.change(timeInput, { target: { value: '10:00' } });

      const submitButton = screen.getByText('Reserve Appointment');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSupabase.rpc).toHaveBeenCalledWith('create_temporary_reservation', expect.any(Object));
      });

      // Should not call onReservationCreated on error
      expect(mockOnReservationCreated).not.toHaveBeenCalled();
    });
  });
});
