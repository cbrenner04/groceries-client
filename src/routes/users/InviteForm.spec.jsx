import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

import InviteForm from './InviteForm';
import axios from '../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('InviteForm', () => {
  let props;
  const renderInviteForm = (someProps) => {
    return render(<InviteForm {...someProps} />);
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
    };
  });

  it('invites new user', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    const { container, getByLabelText, getAllByRole } = renderInviteForm(props);

    expect(container).toMatchSnapshot();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo@example.com successfully invited', { type: 'info' });
    expect(props.history.push).toHaveBeenCalledWith('/lists');
  });

  it('handles 401 from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByLabelText, getAllByRole } = renderInviteForm(props);

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles non-401 from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getByLabelText, getAllByRole } = renderInviteForm(props);

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed to send request from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getByLabelText, getAllByRole } = renderInviteForm(props);

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown error from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByLabelText, getAllByRole } = renderInviteForm(props);

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('goes back to lists on Cancel', () => {
    const { getAllByRole } = renderInviteForm(props);

    fireEvent.click(getAllByRole('button')[1]);

    expect(props.history.push).toHaveBeenCalledWith(`/lists`);
  });
});
