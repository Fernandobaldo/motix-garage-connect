
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import QuotationManager from '../QuotationManager';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('QuotationManager Integration Tests', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('should complete full quote creation workflow', async () => {
    const user = userEvent.setup();
    render(<QuotationManager userRole="workshop" />);
    
    // Step 1: Open new quote form
    await user.click(screen.getByText('New Quote'));
    expect(screen.getByText('Create New Quote')).toBeInTheDocument();
    
    // Step 2: Fill quote details
    await user.type(screen.getByLabelText('Client Name'), 'Test Client');
    await user.type(screen.getByLabelText('Vehicle'), '2020 Honda Civic');
    await user.type(screen.getByLabelText('Service Type'), 'Brake Service');
    
    // Step 3: Add first item
    const descriptionInput = screen.getByPlaceholderText('Item description');
    const quantityInput = screen.getByPlaceholderText('Qty');
    const priceInput = screen.getByPlaceholderText('Unit Price');
    
    await user.type(descriptionInput, 'Brake Pads');
    await user.clear(quantityInput);
    await user.type(quantityInput, '2');
    await user.type(priceInput, '75.00');
    
    await user.click(screen.getByRole('button', { name: /plus/i }));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Item Added',
        description: 'Item has been added to the quote.',
      });
    });
    
    // Step 4: Add notes
    await user.type(screen.getByLabelText('Notes'), 'Brake pads need immediate replacement');
    
    // Step 5: Send quote
    await user.click(screen.getByText('Send Quote'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Quote Sent',
        description: 'The quote has been sent to the client for approval.',
      });
    });
  });

  it('should handle client approval workflow', async () => {
    const user = userEvent.setup();
    render(<QuotationManager userRole="client" />);
    
    // Verify client can see quotes
    expect(screen.getByText('My Quotes')).toBeInTheDocument();
    
    // Find and approve first pending quote
    const approveButton = screen.getAllByText('Approve')[0];
    await user.click(approveButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Quote Approved',
        description: 'The quote has been approved and the workshop has been notified.',
      });
    });
  });

  it('should handle quote rejection workflow', async () => {
    const user = userEvent.setup();
    render(<QuotationManager userRole="client" />);
    
    // Find and reject first pending quote
    const rejectButton = screen.getAllByText('Reject')[0];
    await user.click(rejectButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Quote Rejected',
        description: 'The quote has been rejected. You can request revisions.',
      });
    });
  });

  it('should validate quote calculations', () => {
    render(<QuotationManager userRole="client" />);
    
    // Check if totals are displayed correctly
    expect(screen.getByText('$450.00')).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
  });

  it('should show different interfaces based on user role', () => {
    // Workshop interface
    const { rerender } = render(<QuotationManager userRole="workshop" />);
    expect(screen.getByText('Quotation Management')).toBeInTheDocument();
    expect(screen.getByText('New Quote')).toBeInTheDocument();
    
    // Client interface
    rerender(<QuotationManager userRole="client" />);
    expect(screen.getByText('My Quotes')).toBeInTheDocument();
    expect(screen.queryByText('New Quote')).not.toBeInTheDocument();
  });
});
