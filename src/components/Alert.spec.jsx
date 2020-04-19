import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Alert from './Alert';

const handleDismiss = jest.fn();

describe('Alert', () => {
  describe('when error is provided', () => {
    it('renders alert with error class and error message', () => {
      const errorMessage = 'test error message';
      const { getByRole, getByText } = render(<Alert errors={errorMessage} handleDismiss={handleDismiss} />);
      const alert = getByRole('alert');

      expect(alert).toMatchSnapshot();
      expect(alert).toHaveClass('alert-danger');
      expect(getByText(errorMessage)).toBeVisible();
    });
  });

  describe('when success is provided', () => {
    it('renders alert with success class and success message', () => {
      const successMessage = 'test success message';
      const { getByRole, getByText } = render(<Alert success={successMessage} handleDismiss={handleDismiss} />);
      const alert = getByRole('alert');

      expect(alert).toMatchSnapshot();
      expect(alert).toHaveClass('alert-success');
      expect(getByText(successMessage)).toBeVisible();
    });
  });

  describe('when error or success is not provided', () => {
    it('renders nothing', () => {
      const { container } = render(<Alert handleDismiss={handleDismiss} />);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('when close button is selected', () => {
    it('calls handleDismiss', () => {
      const { getByRole } = render(<Alert errors="test" handleDismiss={handleDismiss} />);
      fireEvent.click(getByRole('button'));

      expect(handleDismiss).toHaveBeenCalled();
    });
  });
});
