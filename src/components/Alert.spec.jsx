import React from 'react';
import Alert from './Alert';
import { render, fireEvent  } from '@testing-library/react'

const handleDismiss = jest.fn();

describe('Alert', () => {
  describe('when error is provided', () => {
    it('renders alert with error class and error message', () => {
      const errorMessage = 'test error message';
      const { getByRole, getByText } = render(<Alert errors={errorMessage} handleDismiss={handleDismiss} />);

      expect(getByRole('alert')).toMatchSnapshot();
      expect(getByRole('alert')).toHaveClass('alert-danger');
      expect(getByText(errorMessage));
    });
  });

  describe('when success is provided', () => {
    it('renders alert with success class and success message', () => {
      const successMessage = 'test success message';
      const { getByRole, getByText } = render(<Alert success={successMessage} handleDismiss={handleDismiss} />);

      expect(getByRole('alert')).toMatchSnapshot();
      expect(getByRole('alert')).toHaveClass('alert-success');
      expect(getByText(successMessage));
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
