
import { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock toast hook consistently
export const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Custom render function with providers
export const renderWithProviders = (
  ui: ReactNode,
  options?: RenderOptions & { queryClient?: QueryClient }
) => {
  const queryClient = options?.queryClient || new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
};

// Common test patterns
export const testPatterns = {
  expectToastMessage: (title: string, description?: string) => {
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title,
        ...(description && { description }),
      })
    );
  },
  
  expectLoadingState: (getByText: any) => {
    expect(getByText('Loading')).toBeInTheDocument();
  },

  expectErrorState: (getByText: any, message = 'Error') => {
    expect(getByText(message)).toBeInTheDocument();
  },

  clearMocks: () => {
    mockToast.mockClear();
    vi.clearAllMocks();
  },
};

// Data-driven test helper
export const runTestScenarios = <T>(
  scenarios: Record<string, T>,
  testFn: (scenario: T, scenarioName: string) => void | Promise<void>
) => {
  Object.entries(scenarios).forEach(([name, scenario]) => {
    it(`should handle ${name} scenario`, async () => {
      await testFn(scenario, name);
    });
  });
};
