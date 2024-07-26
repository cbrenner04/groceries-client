import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import ConfirmModal, { type IConfirmModalProps } from './ConfirmModal';

interface ISetupReturn extends RenderResult {
  props: IConfirmModalProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IConfirmModalProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    action: 'testAction',
    body: 'testBody',
    handleConfirm: jest.fn(),
    handleClear: jest.fn(),
    show: true,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ConfirmModal {...props} />);

  return { ...component, props, user };
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
      expect(await findByText(props.body as string)).toBeVisible();
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
