
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, testPatterns } from '../utils/testHelpers';

// Reusable component test pattern
export const createComponentTestSuite = <TProps>(
  Component: React.ComponentType<TProps>,
  testConfig: {
    name: string;
    defaultProps: TProps;
    scenarios?: Record<string, Partial<TProps>>;
    interactions?: {
      [key: string]: (user: ReturnType<typeof userEvent.setup>) => Promise<void>;
    };
    assertions?: {
      [key: string]: () => void;
    };
  }
) => {
  const { name, defaultProps, scenarios = {}, interactions = {}, assertions = {} } = testConfig;

  describe(name, () => {
    beforeEach(() => {
      testPatterns.clearMocks();
    });

    it('should render without crashing', () => {
      renderWithProviders(React.createElement(Component, defaultProps));
      expect(screen.getByRole('main') || document.body).toBeInTheDocument();
    });

    // Test different prop scenarios
    if (Object.keys(scenarios).length > 0) {
      Object.entries(scenarios).forEach(([scenarioName, scenarioProps]) => {
        it(`should handle ${scenarioName} scenario`, () => {
          renderWithProviders(React.createElement(Component, { ...defaultProps, ...scenarioProps }));
          
          if (assertions[scenarioName]) {
            assertions[scenarioName]();
          }
        });
      });
    }

    // Test user interactions
    Object.entries(interactions).forEach(([interactionName, interactionFn]) => {
      it(`should handle ${interactionName}`, async () => {
        const user = userEvent.setup();
        renderWithProviders(React.createElement(Component, defaultProps));
        
        await interactionFn(user);
      });
    });
  });
};
