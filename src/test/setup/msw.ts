
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Minimal MSW setup for development testing only
export const handlers = [
  // Basic health check endpoint
  http.get('*/health', () => HttpResponse.json({ status: 'ok' })),
];

export const server = setupServer(...handlers);

// Simplified mock helpers for development
export const mockApiResponse = {
  reset: () => {
    server.resetHandlers();
  },
};
