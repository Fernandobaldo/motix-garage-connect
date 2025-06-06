
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
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

describe('QuotationManager E2E Tests', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  it('should handle complete quote lifecycle from creation to approval', async () => {
    const user = userEvent.setup();
    
    // Workshop creates quote
    const { rerender } = render(<QuotationManager userRole="workshop" />);
    
    // Create new quote
    await user.click(screen.getByText('New Quote'));
    
    // Fill quote details
    await user.type(screen.getByLabelText('Client Name'), 'Jane Smith');
    await user.type(screen.getByLabelText('Vehicle'), '2019 Toyota Camry');
    await user.type(screen.getByLabelText('Service Type'), 'Oil Change');
    
    // Add multiple items
    const descriptionInput = screen.getByPlaceholderText('Item description');
    const quantityInput = screen.getByPlaceholderText('Qty');
    const priceInput = screen.getByPlaceholderText('Unit Price');
    
    // Add first item
    await user.type(descriptionInput, 'Synthetic Oil');
    await user.clear(quantityInput);
    await user.type(quantityInput, '1');
    await user.type(priceInput, '35.00');
    await user.click(screen.getByRole('button', { name: /plus/i }));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Item Added',
        description: 'Item has been added to the quote.',
      });
    });
    
    // Clear inputs for second item
    await user.clear(descriptionInput);
    await user.clear(priceInput);
    
    // Add second item
    await user.type(descriptionInput, 'Oil Filter');
    await user.type(priceInput, '12.00');
    await user.click(screen.getByRole('button', { name: /plus/i }));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledTimes(2);
    });
    
    // Add notes
    await user.type(screen.getByLabelText('Notes'), 'Regular maintenance service');
    
    // Send quote
    await user.click(screen.getByText('Send Quote'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Quote Sent',
        description: 'The quote has been sent to the client for approval.',
      });
    });
    
    // Switch to client view
    rerender(<QuotationManager userRole="client" />);
    
    // Client views and approves quote
    expect(screen.getByText('My Quotes')).toBeInTheDocument();
    
    const approveButton = screen.getAllByText('Approve')[0];
    await user.click(approveButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Quote Approved',
        description: 'The quote has been approved and the workshop has been notified.',
      });
    });
  });

  it('should handle quote revision workflow', async () => {
    const user = userEvent.setup();
    
    // Start with client rejecting a quote
    render(<QuotationManager userRole="client" />);
    
    const rejectButton = screen.getAllByText('Reject')[0];
    await user.click(rejectButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Quote Rejected',
        description: 'The quote has been rejected. You can request revisions.',
      });
    });
  });

  it('should validate quote item calculations and totals', () => {
    render(<QuotationManager userRole="client" />);
    
    // Check that quote items are displayed with correct calculations
    expect(screen.getByText('Brake Pads (Front)')).toBeInTheDocument();
    expect(screen.getByText('$120.00')).toBeInTheDocument();
    expect(screen.getByText('$450.00')).toBeInTheDocument();
  });

  it('should handle error states and validation', async () => {
    const user = userEvent.setup();
    render(<QuotationManager userRole="workshop" />);
    
    await user.click(screen.getByText('New Quote'));
    
    // Try to add item without description
    const addButton = screen.getByRole('button', { name: /plus/i });
    await user.click(addButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Please fill in all item details.',
        variant: 'destructive',
      });
    });
  });

  it('should display proper quote status indicators', () => {
    render(<QuotationManager userRole="client" />);
    
    // Check status badges
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('approved')).toBeInTheDocument();
  });

  it('should show download functionality for all users', () => {
    render(<QuotationManager userRole="client" />);
    
    const downloadButtons = screen.getAllByText('Download');
    expect(downloadButtons.length).toBeGreaterThan(0);
  });
});
