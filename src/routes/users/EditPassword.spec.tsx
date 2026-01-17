import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { showToast } from '../../utils/toast';

import axios from 'utils/api';
import EditPassword from './EditPassword';

const mockNavigate = jest.fn();
// Mock useLocation for this specific test
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: (): { search: jest.Mock } => ({
    search: jest.fn(() => 'foo'),
  }),
  useNavigate: (): jest.Mock => mockNavigate,
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

    expect(showToast.info).toHaveBeenCalledWith('Password successfully updated');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors on failure', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(showToast.error).toHaveBeenCalledWith('foo bar and foobar foobaz');
  });

  it('shows errors on failed request', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(showToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows errors on unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(showToast.error).toHaveBeenCalledWith('failed to send request');
  });
});
