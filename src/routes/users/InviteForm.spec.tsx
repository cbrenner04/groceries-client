import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { mockNavigate } from 'test-utils';

import InviteForm from './InviteForm';

interface ISetupReturn extends RenderResult {
  user: UserEvent;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const component = render(
    <MemoryRouter>
      <InviteForm />
    </MemoryRouter>,
  );

  return { ...component, user };
}

describe('InviteForm', () => {
  it('invites new user', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    const { container, findByLabelText, findAllByRole, user } = setup();

    expect(container).toMatchSnapshot();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo@example.com successfully invited', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('handles 401 from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByLabelText, findAllByRole, user } = setup();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles non-401 from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByLabelText, findAllByRole, user } = setup();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed to send request from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByLabelText, findAllByRole, user } = setup();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown error from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByLabelText, findAllByRole, user } = setup();

    await user.type(await findByLabelText('Email'), 'foo@example.com');
    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('goes back to lists on Cancel', async () => {
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });
});
