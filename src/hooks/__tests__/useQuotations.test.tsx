
import { createHookTestSuite } from '../../test/patterns/hookTestPattern';
import { useQuotations } from '../useQuotations';
import { mockApiResponse } from '../../test/setup/msw';
import { createQuotationScenarios } from '../../test/factories/quotationFactory';
import { testPatterns } from '../../test/utils/testHelpers';

// Mock useAuth
const mockProfile = { tenant_id: 'tenant-123', id: 'user-123' };
vi.mock('../useAuth', () => ({
  useAuth: () => ({ profile: mockProfile }),
}));

const quotationScenarios = createQuotationScenarios();

createHookTestSuite(useQuotations, {
  name: 'useQuotations',
  scenarios: {
    'initial state': {
      expectedResult: {
        quotations: [],
        templates: [],
        loading: true,
      },
    },
  },
  asyncTests: {
    'successful quotation creation': {
      action: async (result) => {
        await result.createQuotation({
          client_id: 'client-123',
          workshop_id: 'workshop-123',
          vehicle_id: 'vehicle-123',
          description: 'Test quotation',
          items: [{
            description: 'Test item',
            quantity: 1,
            unit_price: 100,
            item_type: 'service',
          }],
        });
      },
      assertion: (result) => {
        testPatterns.expectToastMessage('Quote Created');
      },
    },
    'successful status update': {
      action: async (result) => {
        await result.updateQuotationStatus('quote-123', 'approved', new Date().toISOString());
      },
      assertion: (result) => {
        testPatterns.expectToastMessage('Quote Updated');
      },
    },
    'API error handling': {
      action: async (result) => {
        mockApiResponse.quotations.error({ message: 'Network error' });
        await result.refetch();
      },
      assertion: (result) => {
        testPatterns.expectToastMessage('Error', 'Failed to load quotations');
      },
    },
  },
});
