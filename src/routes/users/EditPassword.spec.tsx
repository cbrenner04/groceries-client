import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter, useSearchParams } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { showToast } from '../../utils/toast';

import axios from 'utils/api';
import EditPassword from './EditPassword';

const mockNavigate = vi.fn();
// Mock useLocation for this specific test
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useLocation: (): { search: Mock } => ({
    search: vi.fn(() => 'foo'),
  }),
  useNavigate: (): Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
}

const SearchProbe = (): React.JSX.Element => {
  const [searchParams] = useSearchParams();
  return <div data-test-id="search">{searchParams.toString()}</div>;
};

function setup(initialEntry = '/users/password/edit'): ISetupReturn {
  const user = userEvent.setup();
  const component = render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <EditPassword />
      <SearchProbe />
    </MemoryRouter>,
  );

  return { ...component, user };
}

describe('EditPassword', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });
  it('sets password', async () => {
    axios.put = vi.fn().mockResolvedValue({});
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(showToast.info).toHaveBeenCalledWith('Password successfully updated');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors on failure', async () => {
    axios.put = vi.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(showToast.error).toHaveBeenCalledWith('foo bar and foobar foobaz');
  });

  it('shows errors on failed request', async () => {
    axios.put = vi.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(showToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows errors on unknown error', async () => {
    axios.put = vi.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Password'), 'foo');
    await user.type(await findByLabelText('Password confirmation'), 'foo');
    await user.click(await findByText('Set my password'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(showToast.error).toHaveBeenCalledWith('failed to send request');
  });

  it('stores auth credentials from query params and strips them from the url', async () => {
    const { findByTestId } = setup(
      '/users/password/edit?access-token=foo&client=bar&uid=baz%40example.com&expiry=123&reset_password=true',
    );

    await waitFor(() =>
      expect(sessionStorage.getItem('user')).toEqual(
        JSON.stringify({ 'access-token': 'foo', client: 'bar', uid: 'baz@example.com' }),
      ),
    );
    expect((await findByTestId('search')).textContent).toEqual('');
  });

  it('does not store credentials when query params are missing', async () => {
    const { findByLabelText } = setup();

    await findByLabelText('Password');
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('does not store credentials when query params are incomplete', async () => {
    const { findByLabelText } = setup('/users/password/edit?access-token=foo&client=bar');

    await findByLabelText('Password');
    expect(sessionStorage.getItem('user')).toBeNull();
  });
});
