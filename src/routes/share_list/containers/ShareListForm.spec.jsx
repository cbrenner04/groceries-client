import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { toast } from 'react-toastify';

import ShareListForm from './ShareListForm';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('ShareListForm', () => {
  let props;
  const renderShareListForm = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <ShareListForm {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
      name: 'foo',
      invitableUsers: [
        {
          id: 1,
          email: 'foo@example.com',
        },
      ],

      listId: 1,
      userIsOwner: true,
      pending: [
        {
          user: {
            id: 2,
            email: 'bar@example.com',
          },
          users_list: {
            id: 2,
            permissions: 'read',
          },
        },
      ],
      accepted: [
        {
          user: {
            id: 3,
            email: 'baz@example.com',
          },
          users_list: {
            id: 3,
            permissions: 'write',
          },
        },
      ],
      refused: [
        {
          user: {
            id: 4,
            email: 'foobar@example.com',
          },
          users_list: {
            id: 4,
            permissions: 'read',
          },
        },
      ],
      userId: 5,
    };
  });

  it('renders', () => {
    const { container } = renderShareListForm(props);

    expect(container).toMatchSnapshot();
  });

  it('creates new user on form submit', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: { user: { id: 6, email: 'foobaz@example.com' }, users_list: { id: 6, permissions: 'write' } },
    });

    const { getByLabelText, getByTestId, getByText } = renderShareListForm(props);

    fireEvent.change(getByLabelText('Enter an email to invite someone to share this list:'), {
      target: { value: 'foobaz@example.com' },
    });
    fireEvent.click(getByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(getByTestId('pending-user-6')).toHaveTextContent('foobaz@example.com');
    expect(getByTestId('pending-user-6')).toHaveTextContent('write');
    expect(toast).toHaveBeenCalledWith(`"${props.name}" has been successfully shared with foobaz@example.com.`, {
      type: 'info',
    });
  });

  it('redirects to login on 401 response from form submission', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });

    const { getByLabelText, getByText } = renderShareListForm(props);

    fireEvent.change(getByLabelText('Enter an email to invite someone to share this list:'), {
      target: { value: 'foobaz@example.com' },
    });
    fireEvent.click(getByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('displays error on non-401 response from form submission', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

    const { getByLabelText, getByText } = renderShareListForm(props);

    fireEvent.change(getByLabelText('Enter an email to invite someone to share this list:'), {
      target: { value: 'foobaz@example.com' },
    });
    fireEvent.click(getByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('displays error on failed request from form submit', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });

    const { getByLabelText, getByText } = renderShareListForm(props);

    fireEvent.change(getByLabelText('Enter an email to invite someone to share this list:'), {
      target: { value: 'foobaz@example.com' },
    });
    fireEvent.click(getByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays error on unknown error from form submit', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });

    const { getByLabelText, getByText } = renderShareListForm(props);

    fireEvent.change(getByLabelText('Enter an email to invite someone to share this list:'), {
      target: { value: 'foobaz@example.com' },
    });
    fireEvent.click(getByText('Share List'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('adds user to list when selected', async () => {
    axios.post = jest
      .fn()
      .mockResolvedValue({ data: { user_id: 1, email: 'foo@example.com', id: 6, permissions: 'write' } });
    const { getByTestId } = renderShareListForm(props);

    fireEvent.click(getByTestId('invite-user-1').firstChild);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(getByTestId('pending-user-1')).toHaveTextContent('foo@example.com');
    expect(getByTestId('pending-user-1')).toHaveTextContent('write');
    expect(toast).toHaveBeenCalledWith(`"${props.name}" has been successfully shared with foo@example.com.`, {
      type: 'info',
    });
  });

  it('redirects to login on 401 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });

    const { getByTestId } = renderShareListForm(props);

    fireEvent.click(getByTestId('invite-user-1').firstChild);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('redirects to lists on 403 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });

    const { getByTestId } = renderShareListForm(props);

    fireEvent.click(getByTestId('invite-user-1').firstChild);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/lists');
  });

  it('shows errors on 404 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });

    const { getByTestId } = renderShareListForm(props);

    fireEvent.click(getByTestId('invite-user-1').firstChild);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
  });

  it('shows errors on error outside 401, 403, and 404 response from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { responseText: 'foo' } } });

    const { getByTestId } = renderShareListForm(props);

    fireEvent.click(getByTestId('invite-user-1').firstChild);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo', { type: 'error' });
  });

  it('displays error on failed request from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });

    const { getByTestId } = renderShareListForm(props);

    fireEvent.click(getByTestId('invite-user-1').firstChild);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays error on unknown error from selecting user', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });

    const { getByTestId } = renderShareListForm(props);

    fireEvent.click(getByTestId('invite-user-1').firstChild);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  describe('toggles permissions', () => {
    it('toggles permissions in pending', async () => {
      axios.patch = jest.fn().mockResolvedValue({});

      const { getByTestId, getAllByTestId } = renderShareListForm(props);

      expect(getByTestId('pending-user-2')).toHaveTextContent('read');

      fireEvent.click(getAllByTestId('toggle-permissions')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(getByTestId('pending-user-2')).toHaveTextContent('write');
    });

    it('toggles permissions in accepted', async () => {
      axios.patch = jest.fn().mockResolvedValue({});

      const { getByTestId, getAllByTestId } = renderShareListForm(props);

      expect(getByTestId('accepted-user-3')).toHaveTextContent('write');

      fireEvent.click(getAllByTestId('toggle-permissions')[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(getByTestId('accepted-user-3')).toHaveTextContent('read');
    });

    it('redirects to login on 401 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('toggle-permissions')[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to lists on 403 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('toggle-permissions')[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
      expect(props.history.push).toHaveBeenCalledWith('/lists');
    });

    it('shows errors on 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('toggle-permissions')[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
    });

    it('shows errors on non 401, 403, 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('toggle-permissions')[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
    });

    it('displays error on failed request from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('toggle-permissions')[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });

    it('displays error on unknown error from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('toggle-permissions')[1]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
    });
  });

  describe('refresh share', () => {
    it('refreshes share', async () => {
      axios.patch = jest.fn().mockResolvedValue({ data: { id: 1, permissions: 'write' } });

      const { getByTestId, getAllByTestId, queryByTestId } = renderShareListForm(props);

      expect(getByTestId('refused-user-4')).toHaveTextContent('foobar@example.com');

      fireEvent.click(getAllByTestId('refresh-share')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(queryByTestId('refused-user-4')).toBeNull();
    });

    it('redirects to login on 401 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('refresh-share')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to lists on 403 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('refresh-share')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
      expect(props.history.push).toHaveBeenCalledWith('/lists');
    });

    it('shows errors on 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('refresh-share')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
    });

    it('shows errors on non 401, 403, 404 from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('refresh-share')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
    });

    it('displays error on failed request from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('refresh-share')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });

    it('displays error on unknown error from toggling permissions', async () => {
      axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('refresh-share')[0]);
      await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
    });
  });

  describe('remove share', () => {
    it('removes share', async () => {
      axios.delete = jest.fn().mockResolvedValue({});
      axios.get = jest.fn().mockResolvedValue({
        data: {
          accepted: props.accepted,
          invitable_users: props.invitableUsers,
          pending: [],
          refused: props.refused,
        },
      });

      const { getByTestId, getAllByTestId, queryByTestId } = renderShareListForm(props);

      expect(getByTestId('pending-user-2')).toHaveTextContent('bar@example.com');

      fireEvent.click(getAllByTestId('remove-share')[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(queryByTestId('pending-user-2')).toBeNull();
    });

    it('redirects to login on 401 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('remove-share')[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to lists on 403 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('remove-share')[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('You do not have permission to take that action', { type: 'error' });
      expect(props.history.push).toHaveBeenCalledWith('/lists');
    });

    it('shows errors on 404 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('remove-share')[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('User not found', { type: 'error' });
    });

    it('shows errors on non 401, 403, 404 from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('remove-share')[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
    });

    it('displays error on failed request from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('remove-share')[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
    });

    it('displays error on unknown error from toggling permissions', async () => {
      axios.delete = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      const { getAllByTestId } = renderShareListForm(props);

      fireEvent.click(getAllByTestId('remove-share')[0]);
      await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

      expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
    });
  });
});
