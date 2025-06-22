// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { cleanup, configure } from '@testing-library/react';
import { TextEncoder } from 'util';
import type { ReactNode } from 'react';

global.TextEncoder = TextEncoder;
configure({ testIdAttribute: 'data-test-id' });

// Mock the utils/api module (configured axios instance)
jest.mock('utils/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

jest.mock('axios', () => ({
  create: (): {
    interceptors: {
      request: {
        use: jest.Mock;
      };
      response: {
        use: jest.Mock;
      };
    };
    delete: jest.Mock;
  } => ({
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    delete: jest.fn(),
  }),
}));

// make sure when `moment()` is called without a date, the same date is always returned
jest.mock(
  'moment',
  () =>
    (date: Date | string | number | undefined): Date =>
      jest.requireActual('moment')(date ?? '2020-05-24T10:00:00.000Z'),
);

interface ReactBootstrapComponentProps {
  children: ReactNode;
  [key: string]: unknown;
  in?: boolean;
  show?: boolean;
  closeButton?: boolean;
  onHide?: () => void;
}

// Mock React Bootstrap components to avoid transition warnings
jest.mock('react-bootstrap', () => {
  const originalModule = jest.requireActual('react-bootstrap');
  const React = require('react');
  return {
    ...originalModule,
    Collapse: function (props: ReactBootstrapComponentProps): React.ReactElement | null {
      const { children, in: isIn, ...rest } = props;
      // Filter out React Bootstrap specific props to avoid React DOM warnings
      const filteredProps = Object.fromEntries(
        Object.entries(rest).filter(([key]) => !key.startsWith('onEnter') && !key.startsWith('onExit')),
      );
      return isIn ? React.createElement('div', filteredProps, children) : null;
    },
    Modal: Object.assign(
      function (props: ReactBootstrapComponentProps): React.ReactElement | null {
        const { children, show, onHide, ...rest } = props;
        const filteredProps = Object.fromEntries(
          Object.entries(rest).filter(([key]) => !key.startsWith('onEnter') && !key.startsWith('onExit')),
        );
        // Pass onHide to children (Modal.Header)
        const childrenWithOnHide = React.Children.map(children, (child: unknown) => {
          if (
            child &&
            typeof child === 'object' &&
            'type' in child &&
            (child as { type?: { name?: string; displayName?: string } }).type?.name === 'Header'
          ) {
            return React.cloneElement(child as React.ReactElement, { onHide });
          }
          return child;
        });
        return show
          ? React.createElement(
              'div',
              { ...filteredProps, className: 'modal show', role: 'dialog' },
              childrenWithOnHide,
            )
          : null;
      },
      {
        Header: function (props: ReactBootstrapComponentProps): React.ReactElement {
          const { children, closeButton, onHide, ...rest } = props;
          return React.createElement(
            'div',
            { ...rest, className: 'modal-header' },
            closeButton
              ? React.createElement('button', {
                  'aria-label': 'Close',
                  type: 'button',
                  onClick: onHide,
                })
              : null,
            children,
          );
        },
        Body: function (props: ReactBootstrapComponentProps): React.ReactElement {
          const { children, ...rest } = props;
          return React.createElement('div', { ...rest, className: 'modal-body' }, children);
        },
        Footer: function (props: ReactBootstrapComponentProps): React.ReactElement {
          const { children, ...rest } = props;
          return React.createElement('div', { ...rest, className: 'modal-footer' }, children);
        },
        Title: function (props: ReactBootstrapComponentProps): React.ReactElement {
          const { children, ...rest } = props;
          return React.createElement('h5', { ...rest, className: 'modal-title' }, children);
        },
      },
    ),
    Fade: function (props: ReactBootstrapComponentProps): React.ReactElement | null {
      const { children, in: isIn, ...rest } = props;
      const filteredProps = Object.fromEntries(
        Object.entries(rest).filter(([key]) => !key.startsWith('onEnter') && !key.startsWith('onExit')),
      );
      return isIn ? React.createElement('div', filteredProps, children) : null;
    },
  };
});

afterEach(() => {
  cleanup();
});
