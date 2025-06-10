
import { createHookTestSuite } from '../../test/patterns/hookTestPattern';
import { useQuotations } from '../useQuotations';
import { testPatterns } from '../../test/utils/testHelpers';

// Mock useAuth with minimal setup
const mockProfile = { tenant_id: 'test-tenant', id: 'test-user' };
vi.mock('../useAuth', () => ({
  useAuth: () => ({ profile: mockProfile }),
}));

// Simplified test suite - remove hardcoded mock data
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
    'quotation creation': {
      action: async (result) => {
        await result.createQuotation({
          client_id: 'real-client-id',
          workshop_id: 'real-workshop-id',
          vehicle_id: 'real-vehicle-id',
          description: 'Real quotation test',
          items: [{
            description: 'Real item',
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
  },
});
