import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { mockNavigate } from 'test-utils';

import EditPassword from './EditPassword';

// Mock useLocation for this specific test
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: (): { search: jest.Mock } => ({
    search: jest.fn(() => 'foo'),
  }),
  useNavigate: (): jest.Mock => require('test-utils').mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const component = render(
    <MemoryRouter>
      <EditPassword />
    </MemoryRouter>,
  );

  return { ...component, user };
}

describe('EditPassword', () => {
  it('sets password', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Password successfully updated', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors on failure', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors on failed request', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors on unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });
});
