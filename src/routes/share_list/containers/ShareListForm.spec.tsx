import React from 'react';
import { act, render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';

import ShareListForm, { type IShareListFormProps } from './ShareListForm';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IShareListFormProps;
}

function setup(suppliedProps?: Partial<IShareListFormProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    name: 'foo',
    invitableUsers: [
      {
        id: 'id1',
        email: 'foo@example.com',
      },
    ],
    listId: 'id1',
    userIsOwner: true,
    pending: [
      {
        user: {
          id: 'id2',
          email: 'bar@example.com',
        },
        users_list: {
          id: 'id2',
          permissions: 'read',
        },
      },
    ],
    accepted: [
      {
        user: {
          id: 'id3',
          email: 'baz@example.com',
        },
        users_list: {
          id: 'id3',
          permissions: 'write',
        },
      },
    ],
    refused: [
      {
        user: {
          id: 'id4',
          email: 'foobar@example.com',
        },
        users_list: {
          id: 'id4',
          permissions: 'read',
        },
      },
    ],
    userId: 'id5',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <ShareListForm {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('ShareListForm', () => {
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('updates via polling when different data is returned', async () => {
    jest.useFakeTimers();
    axios.get = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          accepted: [
            { user: { id: 'id1', email: 'foo@example.com' }, users_list: { id: 'id1', permissions: 'read' } },
            { user: { id: 'id4', email: 'foobaz@example.com' }, users_list: { id: 'id4', permissions: 'write' } },
          ],
          pending: [{ user: { id: 'id2', email: 'bar@example.com' }, users_list: { id: 'id2', permissions: 'write' } }],
          refused: [{ user: { id: 'id3', email: 'baz@example.com' }, users_list: { id: 'id3', permissions: 'read' } }],
          current_user_id: 'id4',
          user_is_owner: true,
          invitable_users: [{ id: 'id5', email: 'foobar@example.com' }],
          list: {
            name: 'foo',
            id: 'id1',
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          accepted: [
            { user: { id: 'id1', email: 'foo@example.com' }, users_list: { id: 'id1', permissions: 'read' } },
            { user: { id: 'id4', email: 'foobaz@example.com' }, users_list: { id: 'id4', permissions: 'write' } },
          ],
          pending: [],
          refused: [
            { user: { id: 'id3', email: 'baz@example.com' }, users_list: { id: 'id3', permissions: 'read' } },
            { user: { id: 'id2', email: 'bar@example.com' }, users_list: { id: 'id2', permissions: 'write' } },
          ],
          current_user_id: 'id4',
          user_is_owner: true,
          invitable_users: [{ id: 'id5', email: 'foobar@example.com' }],
          list: {
            name: 'foo',
            id: 'id1',
          },
        },
      });
    const { findByTestId, queryByTestId } = setup();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('pending-user-id2')).toHaveTextContent('bar@example.com');

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await findByTestId('refused-user-id2')).toHaveTextContent('bar@example.com');
    expect(queryByTestId('pending-user-id2')).toBeNull();
    jest.useRealTimers();
  });

  it('does not update via polling when different data is not returned', async () => {
    jest.useFakeTimers();
    axios.get = jest.fn().mockResolvedValue({
      data: {
        accepted: [
          { user: { id: 'id1', email: 'foo@example.com' }, users_list: { id: 'id1', permissions: 'read' } },
          { user: { id: 'id4', email: 'foobaz@example.com' }, users_list: { id: 'id4', permissions: 'write' } },
        ],
        pending: [{ user: { id: 'id2', email: 'bar@example.com' }, users_list: { id: 'id2', permissions: 'write' } }],
        refused: [{ user: { id: 'id3', email: 'baz@example.com' }, users_list: { id: 'id3', permissions: 'read' } }],
        current_user_id: 'id4',
        user_is_owner: true,
        invitable_users: [{ id: 'id5', email: 'foobar@example.com' }],
        list: {
          name: 'foo',
          id: 'id1',
        },
      },
    });
    const { findByTestId } = setup();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('pending-user-id2')).toHaveTextContent('bar@example.com');

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect(await findByTestId('pending-user-id2')).toHaveTextContent('bar@example.com');
    jest.useRealTimers();
  });

  it('creates new user on form submit', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: { user: { id: 'id6', email: 'foobaz@example.com' }, users_list: { id: 'id6', permissions: 'write' } },
    });

    const { findByLabelText, findByTestId, findByText, props, user } = setup();

    await user.type(
      await findByLabelText('Enter an email to invite someone to share this list:'),
      'foobaz@example.com',
    );
    await user.click(await findByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(await findByTestId('pending-user-id6')).toHaveTextContent('foobaz@example.com');
    expect(await findByTestId('pending-user-id6')).toHaveTextContent('write');
    expect(toast).toHaveBeenCalledWith(`"${props.name}" has been successfully shared with foobaz@example.com.`, {
      type: 'info',
    });
  });

  it('redirects to login on 401 response from form submission', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });

    const { findByLabelText, findByText, user } = setup();

    await user.type(
      await findByLabelText('Enter an email to invite someone to share this list:'),
      'foobaz@example.com',
    );
    await user.click(await findByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('displays error on non-401 response from form submission', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

    const { findByLabelText, findByText, user } = setup();

    await user.type(
      await findByLabelText('Enter an email to invite someone to share this list:'),
      'foobaz@example.com',
    );
    await user.click(await findByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('displays error on failed request from form submit', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });

    const { findByLabelText, findByText, user } = setup();

    await user.type(
      await findByLabelText('Enter an email to invite someone to share this list:'),
      'foobaz@example.com',
    );
    await user.click(await findByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays error on unknown error from form submit', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });

    const { findByLabelText, findByText, user } = setup();

    await user.type(
      await findByLabelText('Enter an email to invite someone to share this list:'),
      'foobaz@example.com',
    );
    await user.click(await findByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('adds user to list when selected', async () => {
    axios.post = jest
      .fn()
      .mockResolvedValue({ data: { user_id: 'id1', email: 'foo@example.com', id: 'id6', permissions: 'write' } });
    const { findByTestId, props, user } = setup();

    await user.click((await findByTestId('invite-user-id1')).children[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(await findByTestId('pending-user-id1')).toHaveTextContent('foo@example.com');
    expect(await findByTestId('pending-user-id1')).toHaveTextContent('write');
    expect(toast).toHaveBeenCalledWith(`"${props.name}" has been successfully shared with foo@example.com.`, {
      type: 'info',
    });
  });

  it('redirects to login on 401 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });

    const { findByTestId, user } = setup();

    await user.click((await findByTestId('invite-user-id1')).children[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('redirects to lists on 403 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });

    const { findByTestId, user } = setup();

    await user.click((await findByTestId('invite-user-id1')).children[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('shows errors on 404 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });

    const { findByTestId, user } = setup();

    await user.click((await findByTestId('invite-user-id1')).children[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
  });

  it('shows errors on error outside 401, 403, and 404 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { responseText: 'foo' } } });

    const { findByTestId, user } = setup();

    await user.click((await findByTestId('invite-user-id1')).children[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo', { type: 'error' });
  });

  it('displays error on failed request from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });

    const { findByTestId, user } = setup();

    await user.click((await findByTestId('invite-user-id1')).children[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays error on unknown error from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });

    const { findByTestId, user } = setup();

    await user.click((await findByTestId('invite-user-id1')).children[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  describe('toggles permissions', () => {
    it('toggles permissions in pending', async () => {
      axios.patch = jest.fn().mockResolvedValue({});

      const { findByTestId, findAllByTestId, user } = setup();

      expect(await findByTestId('pending-user-id2')).toHaveTextContent('read');

      await user.click((await findAllByTestId('toggle-permissions'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(await findByTestId('pending-user-id2')).toHaveTextContent('write');
    });

    it('toggles permissions in accepted', async () => {
      axios.patch = jest.fn().mockResolvedValue({});

      const { findByTestId, findAllByTestId, user } = setup();

      expect(await findByTestId('accepted-user-id3')).toHaveTextContent('write');

      await user.click((await findAllByTestId('toggle-permissions'))[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(await findByTestId('accepted-user-id3')).toHaveTextContent('read');
    });

    it('redirects to login on 401 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('toggle-permissions'))[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to lists on 403 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('toggle-permissions'))[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });

    it('shows errors on 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('toggle-permissions'))[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
    });

    it('shows errors on non 401, 403, 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('toggle-permissions'))[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
    });

    it('displays error on failed request from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('toggle-permissions'))[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });

    it('displays error on unknown error from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('toggle-permissions'))[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
    });
  });

  describe('refresh share', () => {
    it('refreshes share', async () => {
      axios.patch = jest.fn().mockResolvedValue({ data: { id: 'id1', permissions: 'write' } });

      const { findByTestId, findAllByTestId, queryByTestId, user } = setup();

      expect(await findByTestId('refused-user-id4')).toHaveTextContent('foobar@example.com');

      await user.click((await findAllByTestId('refresh-share'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(queryByTestId('refused-user-id4')).toBeNull();
    });

    it('redirects to login on 401 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('refresh-share'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to lists on 403 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('refresh-share'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });

    it('shows errors on 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('refresh-share'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
    });

    it('shows errors on non 401, 403, 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('refresh-share'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
    });

    it('displays error on failed request from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('refresh-share'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });

    it('displays error on unknown error from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('refresh-share'))[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
    });
  });

  describe('remove share', () => {
    it('removes share', async () => {
      axios.delete = jest.fn().mockResolvedValue({});
      axios.get = jest.fn().mockResolvedValueOnce({
        data: {
          accepted: [
            {
              user: {
                id: 'id3',
                email: 'baz@example.com',
              },
              users_list: {
                id: 'id3',
                permissions: 'write',
              },
            },
          ],
          invitable_users: [
            {
              id: 'id1',
              email: 'foo@example.com',
            },
          ],
          pending: [],
          refused: [
            {
              user: {
                id: 'id4',
                email: 'foobar@example.com',
              },
              users_list: {
                id: 'id4',
                permissions: 'read',
              },
            },
          ],
        },
      });

      const { findByTestId, findAllByTestId, queryByTestId, user } = setup();

      expect(await findByTestId('pending-user-id2')).toHaveTextContent('bar@example.com');

      await user.click((await findAllByTestId('remove-share'))[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(queryByTestId('pending-user-id2')).toBeNull());
    });

    it('redirects to login on 401 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('remove-share'))[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to lists on 403 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('remove-share'))[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
      expect(mockNavigate).toHaveBeenCalledWith('/lists');
    });

    it('shows errors on 404 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('remove-share'))[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
    });

    it('shows errors on non 401, 403, 404 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('remove-share'))[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
    });

    it('displays error on failed request from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('remove-share'))[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });

    it('displays error on unknown error from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      const { findAllByTestId, user } = setup();

      await user.click((await findAllByTestId('remove-share'))[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
    });
  });
});
