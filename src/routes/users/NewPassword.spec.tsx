import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { toast } from 'react-toastify';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';

import NewPassword from './NewPassword';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const component = render(
    <MemoryRouter>
      <NewPassword />
    </MemoryRouter>,
  );

  return { ...component, user };
}

describe('NewPassword', () => {
  it('requests new password', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    const { container, findByLabelText, findByRole, user } = setup();

    expect(container).toMatchSnapshot();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click(await findByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
      { type: 'info' },
    );
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('has same outcome when error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const { findByLabelText, findByRole, user } = setup();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click(await findByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
      { type: 'info' },
    );
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });
});
