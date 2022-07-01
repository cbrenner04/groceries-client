import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmModal from './ConfirmModal';

function setup(suppliedProps = {}) {
  const user = userEvent.setup();
  const defaultProps = {
    action: 'testAction',
    body: 'testBody',
    handleConfirm: jest.fn(),
    handleClear: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { findByRole, findByText, queryByRole } = render(<ConfirmModal {...props} />);

  return { findByRole, findByText, props, queryByRole, user };
}

describe('ConfirmModal', () => {
  describe('when show is false', () => {
    it('does not render dialog', () => {
      const { queryByRole } = setup({ show: false });

      expect(queryByRole('dialog')).toBeNull();
    });
  });

  describe('when show is true', () => {
    it('renders dialog', async () => {
      const { findByRole, findByText, props } = setup({ show: true });

      expect(await findByRole('dialog')).toMatchSnapshot();
      expect(await findByText(`Confirm ${props.action}`)).toBeVisible();
      expect(await findByText(props.body)).toBeVisible();
    });

    it('calls handleClear when the close button is selected', async () => {
      const { findByText, props, user } = setup({ show: true });
      await user.click(await findByText('Close', { selector: 'button' }));

      expect(props.handleClear).toHaveBeenCalled();
    });

    it('calls handleConfirm when the close button is selected', async () => {
      const { findByText, props, user } = setup({ show: true });
      await user.click(await findByText("Yes, I'm sure."));

      expect(props.handleConfirm).toHaveBeenCalled();
    });
  });
});
