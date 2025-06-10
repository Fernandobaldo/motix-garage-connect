
import React from 'react';
import { screen } from '@testing-library/react';
import QuotationList from '../QuotationList';
import { createComponentTestSuite } from '../../../test/patterns/componentTestPattern';

const mockHandlers = {
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onView: vi.fn(),
};

// Simplified component tests without mock data
createComponentTestSuite(QuotationList, {
  name: 'QuotationList',
  defaultProps: {
    quotations: [], // Start with empty array - use real data
    userRole: 'client' as const,
    ...mockHandlers,
  },
  scenarios: {
    'empty quotations for client': {
      quotations: [],
      userRole: 'client' as const,
    },
    'empty quotations for workshop': {
      quotations: [],
      userRole: 'workshop' as const,
    },
  },
  interactions: {},
  assertions: {
    'empty quotations for client': () => {
      expect(screen.getByText(/no quotations found/i)).toBeInTheDocument();
    },
    'empty quotations for workshop': () => {
      expect(screen.getByText(/create your first quotation/i)).toBeInTheDocument();
    },
  },
});
