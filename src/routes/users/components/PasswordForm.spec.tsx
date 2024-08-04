import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import PasswordForm, { type IPasswordFormProps } from './PasswordForm';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IPasswordFormProps;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    password: '',
    passwordChangeHandler: jest.fn(),
    passwordConfirmation: '',
    passwordConfirmationChangeHandler: jest.fn(),
    submissionHandler: jest.fn((e) => e.preventDefault()),
  };
  const component = render(<PasswordForm {...props} />);

  return { ...component, props, user };
}

describe('PasswordForm', () => {
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('changes values', async () => {
    const { findByLabelText, props, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');

    expect(props.passwordChangeHandler).toHaveBeenCalled();

    await user.type(await findByLabelText('Password confirmation'), 'foo');

    expect(props.passwordConfirmationChangeHandler).toHaveBeenCalled();
  });

  it('submits', async () => {
    const { findByLabelText, findByText, props, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));

    expect(props.submissionHandler).toHaveBeenCalled();
  });
});
