
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

describe('QuotationManager', () => {
  beforeEach(() => {
    mockToast.mockClear();
  });

  describe('Workshop Role', () => {
    it('should render workshop interface with New Quote button', () => {
      render(<QuotationManager userRole="workshop" />);
      
      expect(screen.getByText('Quotation Management')).toBeInTheDocument();
      expect(screen.getByText('New Quote')).toBeInTheDocument();
    });

    it('should show new quote form when New Quote is clicked', async () => {
      const user = userEvent.setup();
      render(<QuotationManager userRole="workshop" />);
      
      await user.click(screen.getByText('New Quote'));
      
      expect(screen.getByText('Create New Quote')).toBeInTheDocument();
      expect(screen.getByLabelText('Client Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Vehicle')).toBeInTheDocument();
      expect(screen.getByLabelText('Service Type')).toBeInTheDocument();
    });

    it('should validate required fields when adding items', async () => {
      const user = userEvent.setup();
      render(<QuotationManager userRole="workshop" />);
      
      await user.click(screen.getByText('New Quote'));
      
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

    it('should add item when valid data is provided', async () => {
      const user = userEvent.setup();
      render(<QuotationManager userRole="workshop" />);
      
      await user.click(screen.getByText('New Quote'));
      
      const descriptionInput = screen.getByPlaceholderText('Item description');
      const quantityInput = screen.getByPlaceholderText('Qty');
      const priceInput = screen.getByPlaceholderText('Unit Price');
      
      await user.type(descriptionInput, 'Brake Pads');
      await user.clear(quantityInput);
      await user.type(quantityInput, '2');
      await user.type(priceInput, '50.00');
      
      const addButton = screen.getByRole('button', { name: /plus/i });
      await user.click(addButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Item Added',
          description: 'Item has been added to the quote.',
        });
      });
    });

    it('should send quote when Send Quote is clicked', async () => {
      const user = userEvent.setup();
      render(<QuotationManager userRole="workshop" />);
      
      await user.click(screen.getByText('New Quote'));
      await user.click(screen.getByText('Send Quote'));
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Quote Sent',
          description: 'The quote has been sent to the client for approval.',
        });
      });
    });
  });

  describe('Client Role', () => {
    it('should render client interface with My Quotes title', () => {
      render(<QuotationManager userRole="client" />);
      
      expect(screen.getByText('My Quotes')).toBeInTheDocument();
      expect(screen.getByText('Review and manage service quotes from workshops')).toBeInTheDocument();
    });

    it('should not show New Quote button for clients', () => {
      render(<QuotationManager userRole="client" />);
      
      expect(screen.queryByText('New Quote')).not.toBeInTheDocument();
    });

    it('should show approve/reject buttons for pending quotes', () => {
      render(<QuotationManager userRole="client" />);
      
      // Check for pending quote actions
      const approveButtons = screen.getAllByText('Approve');
      const rejectButtons = screen.getAllByText('Reject');
      
      expect(approveButtons.length).toBeGreaterThan(0);
      expect(rejectButtons.length).toBeGreaterThan(0);
    });

    it('should approve quote when Approve is clicked', async () => {
      const user = userEvent.setup();
      render(<QuotationManager userRole="client" />);
      
      const approveButton = screen.getAllByText('Approve')[0];
      await user.click(approveButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Quote Approved',
          description: 'The quote has been approved and the workshop has been notified.',
        });
      });
    });

    it('should reject quote when Reject is clicked', async () => {
      const user = userEvent.setup();
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
  });

  describe('Common Features', () => {
    it('should display quote items in table format', () => {
      render(<QuotationManager userRole="client" />);
      
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Qty')).toBeInTheDocument();
      expect(screen.getByText('Unit Price')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should show download buttons for all quotes', () => {
      render(<QuotationManager userRole="client" />);
      
      const downloadButtons = screen.getAllByText('Download');
      expect(downloadButtons.length).toBeGreaterThan(0);
    });

    it('should display quote status badges', () => {
      render(<QuotationManager userRole="client" />);
      
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('approved')).toBeInTheDocument();
    });
  });
});
