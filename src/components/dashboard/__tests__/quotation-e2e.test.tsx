
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
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

  it('should render workshop interface correctly', async () => {
    render(<QuotationManager userRole="workshop" />);
    
    expect(screen.getByText('Quotation Management')).toBeInTheDocument();
  });

  it('should render client interface correctly', async () => {
    render(<QuotationManager userRole="client" />);
    
    expect(screen.getByText('My Quotes')).toBeInTheDocument();
  });

  // Removed all hardcoded test data - use real data from actual database
});
