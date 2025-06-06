
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { createMockQuotation, createQuotationScenarios } from '../factories/quotationFactory';

// API response templates
const apiResponses = {
  quotations: {
    list: () => HttpResponse.json({
      data: Object.values(createQuotationScenarios()),
      error: null,
    }),
    create: () => HttpResponse.json({
      data: createMockQuotation(),
      error: null,
    }),
    update: (id: string) => HttpResponse.json({
      data: createMockQuotation({ id }),
      error: null,
    }),
  },
  
  profiles: {
    get: () => HttpResponse.json({
      data: { id: 'user-123', full_name: 'Test User', role: 'client' },
      error: null,
    }),
  },
};

// MSW handlers with configurable responses
export const handlers = [
  http.get('*/rest/v1/quotations*', () => apiResponses.quotations.list()),
  http.post('*/rest/v1/quotations', () => apiResponses.quotations.create()),
  http.patch('*/rest/v1/quotations/:id', ({ params }) => 
    apiResponses.quotations.update(params.id as string)
  ),
  http.get('*/rest/v1/profiles*', () => apiResponses.profiles.get()),
];

export const server = setupServer(...handlers);

// Helper to override responses in tests
export const mockApiResponse = {
  quotations: {
    list: (data: any) => {
      server.use(
        http.get('*/rest/v1/quotations*', () => HttpResponse.json({ data, error: null }))
      );
    },
    error: (error: any) => {
      server.use(
        http.get('*/rest/v1/quotations*', () => HttpResponse.json({ data: null, error }))
      );
    },
  },
};
