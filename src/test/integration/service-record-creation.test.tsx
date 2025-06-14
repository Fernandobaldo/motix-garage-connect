import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ServiceRecordModal from '@/components/vehicles/ServiceRecordModal';
import { vi, describe, it, beforeEach } from 'vitest';
import { mockSupabase, mockUseAuth } from './service-record-test-shared';

// Test wrapper
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Service Record Creation Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();

    mockUseAuth.mockReturnValue({
      user: { id: 'user-123' },
      profile: {
        id: 'user-123',
        tenant_id: 'tenant-123',
        role: 'workshop',
        full_name: 'Test Workshop Owner'
      }
    } as any);
  });

  it('should handle complete service record creation workflow', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <ServiceRecordModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Create New Service Record')).toBeInTheDocument();

    // Add service
    fireEvent.click(screen.getByText(/add service/i));
    // Select service type for first (required)
    const dropdowns = screen.getAllByRole("button", { name: /select service type/i });
    fireEvent.mouseDown(dropdowns[0]);
    const oilChangeOpt = await screen.findByText("Oil Change");
    fireEvent.click(oilChangeOpt);

    // Add an item to that service
    const firstPartName = screen.getAllByPlaceholderText(/part name/i)[0];
    fireEvent.change(firstPartName, { target: { value: 'Oil Filter' } });

    const firstQty = screen.getAllByPlaceholderText(/qty/i)[0];
    fireEvent.change(firstQty, { target: { value: '2' } });

    const firstPrice = screen.getAllByPlaceholderText(/price/i)[0];
    fireEvent.change(firstPrice, { target: { value: '10' } });

    expect(screen.getByText(/total cost/i)).toHaveTextContent("$20");

    // Can add a second service
    fireEvent.click(screen.getByText(/add service/i));
    // Select service type for second
    const secondDropdown = screen.getAllByRole("button", { name: /select service type/i })[1];
    fireEvent.mouseDown(secondDropdown);
    const brakeOpt = await screen.findByText("Brake Service");
    fireEvent.click(brakeOpt);

    // Add an item to the second service
    const secondPartName = screen.getAllByPlaceholderText(/part name/i)[1];
    fireEvent.change(secondPartName, { target: { value: 'Brake Pad' } });
    const secondQty = screen.getAllByPlaceholderText(/qty/i)[1];
    fireEvent.change(secondQty, { target: { value: '1' } });
    const secondPrice = screen.getAllByPlaceholderText(/price/i)[1];
    fireEvent.change(secondPrice, { target: { value: '50' } });

    // Total cost should now reflect both services: 20 + 50 = 70
    expect(screen.getByText(/total cost/i)).toHaveTextContent("$70");

    // Deleting a service removes its items
    const removeBtns = screen.getAllByLabelText("Remove service");
    fireEvent.click(removeBtns[1]);
    // Only one service left; total cost returns to $20
    expect(screen.getByText(/total cost/i)).toHaveTextContent("$20");

    // (Tests for submission/validation in other tests)
  });
});
