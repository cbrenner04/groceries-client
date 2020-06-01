import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import PasswordForm from './PasswordForm';

describe('PasswordForm', () => {
  let props;

  beforeEach(() => {
    props = {
      password: '',
      passwordChangeHandler: jest.fn(),
      passwordConfirmation: '',
      passwordConfirmationChangeHandler: jest.fn(),
      submissionHandler: jest.fn(),
    };
  });

  it('renders', () => {
    const { container } = render(<PasswordForm {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('changes values', () => {
    const { getByLabelText } = render(<PasswordForm {...props} />);

    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });

    expect(props.passwordChangeHandler).toHaveBeenCalled();

    fireEvent.change(getByLabelText('Password confirmation'), { target: { value: 'foo' } });

    expect(props.passwordConfirmationChangeHandler).toHaveBeenCalled();
  });

  it('submits', () => {
    const { getByLabelText, getByTestId } = render(<PasswordForm {...props} />);

    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });
    fireEvent.change(getByLabelText('Password confirmation'), { target: { value: 'foo' } });
    fireEvent.submit(getByTestId('password-form'));

    expect(props.submissionHandler).toHaveBeenCalled();
  });
});
