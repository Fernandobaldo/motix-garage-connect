
import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { testPatterns } from '../utils/testHelpers';

// Reusable hook test pattern
export const createHookTestSuite = <TResult, TProps = undefined>(
  useHook: (props?: TProps) => TResult,
  testConfig: {
    name: string;
    scenarios?: Record<string, { props?: TProps; expectedResult?: Partial<TResult> }>;
    asyncTests?: Record<string, {
      props?: TProps;
      action: (result: TResult) => void | Promise<void>;
      assertion: (result: TResult) => void;
    }>;
  }
) => {
  const { name, scenarios = {}, asyncTests = {} } = testConfig;

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    
    return ({ children }: { children: ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );
  };

  describe(name, () => {
    beforeEach(() => {
      testPatterns.clearMocks();
    });

    it('should initialize without errors', () => {
      const { result } = renderHook(() => useHook(), { wrapper: createWrapper() });
      expect(result.current).toBeDefined();
    });

    // Test different scenarios
    Object.entries(scenarios).forEach(([scenarioName, { props, expectedResult }]) => {
      it(`should handle ${scenarioName} scenario`, () => {
        const { result } = renderHook(() => useHook(props), { wrapper: createWrapper() });
        
        if (expectedResult) {
          Object.entries(expectedResult).forEach(([key, value]) => {
            expect((result.current as any)[key]).toEqual(value);
          });
        }
      });
    });

    // Test async operations
    Object.entries(asyncTests).forEach(([testName, { props, action, assertion }]) => {
      it(`should handle ${testName}`, async () => {
        const { result } = renderHook(() => useHook(props), { wrapper: createWrapper() });
        
        await action(result.current);
        
        await waitFor(() => {
          assertion(result.current);
        });
      });
    });
  });
};
