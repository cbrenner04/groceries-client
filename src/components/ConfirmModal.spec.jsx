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
    let getByRole;
    let getByText;

    beforeEach(() => {
      defaultProps.show = true;
      ({ getByRole, getByText } = render(<ConfirmModal {...defaultProps} />));
    });

    it('renders dialog', () => {
      expect(getByRole('dialog')).toMatchSnapshot();
      expect(getByText(`Confirm ${defaultProps.action}`)).toBeVisible();
      expect(getByText(defaultProps.body)).toBeVisible();
    });

    it('calls handleClear when the close button is selected', () => {
      fireEvent.click(getByText('Close', { selector: 'button' }));

      expect(defaultProps.handleClear).toHaveBeenCalled();
    });

    it('calls handleConfirm when the close button is selected', () => {
      fireEvent.click(getByText('Yes, I\'m sure.'));

      expect(defaultProps.handleConfirm).toHaveBeenCalled();
    });
  });
});
