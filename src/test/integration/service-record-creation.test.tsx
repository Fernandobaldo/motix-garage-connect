
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

describe('Service Record Creation Flow (Unified Modal)', () => {
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

  it('should handle complete service record creation workflow with shared form', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <ServiceRecordModal isOpen={true} onClose={onClose} onSuccess={onSuccess} mode="create" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Create New Service Record')).toBeInTheDocument();

    // Vehicle/client selection should initially be empty
    expect(screen.queryByText(/vehicle:/i)).not.toBeInTheDocument();

    // Fill out required service type and parts/items
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

    // Can add another service
    fireEvent.click(screen.getByText(/add service/i));
    const secondDropdown = screen.getAllByRole("button", { name: /select service type/i })[1];
    fireEvent.mouseDown(secondDropdown);
    const brakeOpt = await screen.findByText("Brake Service");
    fireEvent.click(brakeOpt);

    // Add an item to the new service
    const secondPartName = screen.getAllByPlaceholderText(/part name/i)[1];
    fireEvent.change(secondPartName, { target: { value: 'Brake Pad' } });
    const secondQty = screen.getAllByPlaceholderText(/qty/i)[1];
    fireEvent.change(secondQty, { target: { value: '1' } });
    const secondPrice = screen.getAllByPlaceholderText(/price/i)[1];
    fireEvent.change(secondPrice, { target: { value: '50' } });

    expect(screen.getByText(/total cost/i)).toHaveTextContent("$70");

    // Remove the second service, expect total cost to update
    const removeBtns = screen.getAllByLabelText("Remove service");
    fireEvent.click(removeBtns[1]);
    expect(screen.getByText(/total cost/i)).toHaveTextContent("$20");

    // Simulate vehicle and client selection (normally from LicensePlateSearchField)
    // We'll directly call the handler due to modal logic
    // In real tests this should use UI interaction; here we test modal logic.
  });
});
