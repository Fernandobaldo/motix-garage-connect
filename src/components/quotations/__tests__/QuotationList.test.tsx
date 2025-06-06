
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuotationList from '../QuotationList';
import { createComponentTestSuite } from '../../../test/patterns/componentTestPattern';
import { createQuotationScenarios } from '../../../test/factories/quotationFactory';

const mockHandlers = {
  onApprove: vi.fn(),
  onReject: vi.fn(),
  onView: vi.fn(),
};

const quotationScenarios = createQuotationScenarios();

createComponentTestSuite(QuotationList, {
  name: 'QuotationList',
  defaultProps: {
    quotations: Object.values(quotationScenarios),
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
    'workshop view with quotations': {
      userRole: 'workshop' as const,
    },
  },
  interactions: {
    'approve button click': async (user) => {
      const approveButton = screen.getAllByTitle(/approve/i)[0];
      await user.click(approveButton);
      expect(mockHandlers.onApprove).toHaveBeenCalled();
    },
    'reject button click': async (user) => {
      const rejectButton = screen.getAllByTitle(/reject/i)[0];
      await user.click(rejectButton);
      expect(mockHandlers.onReject).toHaveBeenCalled();
    },
    'PDF download': async (user) => {
      const downloadButton = screen.getAllByTitle(/download/i)[0];
      await user.click(downloadButton);
      // PDF export should be called without errors
    },
  },
  assertions: {
    'empty quotations for client': () => {
      expect(screen.getByText(/no quotations found/i)).toBeInTheDocument();
      expect(screen.getByText(/you don't have any quotations yet/i)).toBeInTheDocument();
    },
    'empty quotations for workshop': () => {
      expect(screen.getByText(/create your first quotation/i)).toBeInTheDocument();
    },
  },
});
