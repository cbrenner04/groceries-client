/**
 * Test utilities for React Bootstrap components
 *
 * These mocks help avoid act() warnings in tests by removing CSS transitions
 * and animations that cause asynchronous state updates.
 */

import React from 'react';

interface CollapseProps {
  children: React.ReactNode;
  in: boolean;
  [key: string]: unknown;
}

interface ModalProps {
  children: React.ReactNode;
  show: boolean;
  [key: string]: unknown;
}

interface FadeProps {
  children: React.ReactNode;
  in: boolean;
  [key: string]: unknown;
}

/**
 * Mock for React Bootstrap Collapse component
 * Renders children immediately when in=true, hides when in=false
 * This avoids CSS transition timing issues in tests
 */
export const mockCollapse = (props: CollapseProps): React.ReactElement | null => {
  const { children, in: isIn, ...rest } = props;
  return isIn ? React.createElement('div', rest, children) : null;
};

/**
 * Mock for React Bootstrap Modal component
 * Renders children immediately when show=true, hides when show=false
 * This avoids CSS transition timing issues in tests
 */
export const mockModal = (props: ModalProps): React.ReactElement | null => {
  const { children, show, ...rest } = props;
  return show ? React.createElement('div', rest, children) : null;
};

/**
 * Mock for React Bootstrap Fade component
 * Renders children immediately when in=true, hides when in=false
 * This avoids CSS transition timing issues in tests
 */
export const mockFade = (props: FadeProps): React.ReactElement | null => {
  const { children, in: isIn, ...rest } = props;
  return isIn ? React.createElement('div', rest, children) : null;
};

/**
 * Setup function to mock React Bootstrap components globally
 * Call this in your test setup file or individual test files
 */
export const setupReactBootstrapMocks = (): void => {
  jest.mock('react-bootstrap', () => {
    const original = jest.requireActual('react-bootstrap');
    return {
      ...original,
      Collapse: mockCollapse,
      Modal: mockModal,
      Fade: mockFade,
    };
  });
};
