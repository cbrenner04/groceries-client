import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import ConfirmModal from './ConfirmModal';

const defaultProps = {
  action: 'testAction',
  body: 'testBody',
  handleConfirm: jest.fn(),
  handleClear: jest.fn(),
};

describe('ConfirmModal', () => {
  describe('when show is false', () => {
    it('does not render dialog', () => {
      defaultProps.show = false;
      const { queryByRole } = render(<ConfirmModal {...defaultProps} />);

      expect(queryByRole('dialog')).toBeNull();
    });
  });

  describe('when show is true', () => {
    it('renders dialog', () => {
      defaultProps.show = true;
      const { getByRole, getByText } = render(<ConfirmModal {...defaultProps} />);

      expect(getByRole('dialog')).toMatchSnapshot();
      expect(getByText(`Confirm ${defaultProps.action}`)).toBeVisible();
      expect(getByText(defaultProps.body)).toBeVisible();
    });

    it('calls handleClear when the close button is selected', () => {
      defaultProps.show = true;
      const { getByText } = render(<ConfirmModal {...defaultProps} />);
      fireEvent.click(getByText('Close', { selector: 'button' }));

      expect(defaultProps.handleClear).toHaveBeenCalled();
    });

    it('calls handleConfirm when the close button is selected', () => {
      defaultProps.show = true;
      const { getByText } = render(<ConfirmModal {...defaultProps} />);
      fireEvent.click(getByText('Yes, I\'m sure.'));

      expect(defaultProps.handleConfirm).toHaveBeenCalled();
    });
  });
});
