
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServiceReportModal from '@/components/appointments/ServiceReportModal';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/integrations/supabase/client');
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const mockUseAuth = useAuth as any;
const mockSupabase = supabase as any;

describe('ServiceReportModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    mockUseAuth.mockReturnValue({
      profile: {
        id: 'test-user-id',
        tenant_id: 'test-tenant-id',
        role: 'workshop',
      },
    });

    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              service_type: 'Oil Change',
              vehicle_id: 'test-vehicle-id',
              workshop_id: 'test-workshop-id',
            },
            error: null,
          }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
  });

  const renderServiceReportModal = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      appointmentId: 'test-appointment-id',
      onSuccess: vi.fn(),
      ...props,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <ServiceReportModal {...defaultProps} />
      </QueryClientProvider>
    );
  };

  it('renders service report modal when open', () => {
    renderServiceReportModal();
    
    expect(screen.getByText('Complete Service Report')).toBeInTheDocument();
    expect(screen.getByText('Complete Service')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderServiceReportModal({ isOpen: false });
    
    expect(screen.queryByText('Complete Service Report')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn();
    renderServiceReportModal({ onClose });
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables submit button when description is empty', () => {
    renderServiceReportModal();
    
    const submitButton = screen.getByText('Complete Service');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when description is provided', async () => {
    renderServiceReportModal();
    
    const descriptionField = screen.getByPlaceholderText(/describe the work/i) || 
                            screen.getByRole('textbox');
    
    if (descriptionField) {
      fireEvent.change(descriptionField, { target: { value: 'Oil change completed' } });
      
      await waitFor(() => {
        const submitButton = screen.getByText('Complete Service');
        expect(submitButton).not.toBeDisabled();
      });
    }
  });
});
