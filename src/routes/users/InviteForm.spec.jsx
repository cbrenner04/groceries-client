import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { MemoryRouter } from 'react-router-dom';

import InviteForm from './InviteForm';
import axios from '../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('InviteForm', () => {
  const renderInviteForm = () =>
    render(
      <MemoryRouter>
        <InviteForm />
      </MemoryRouter>,
    );

  it('invites new user', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    const { container, getByLabelText, getAllByRole } = renderInviteForm();

    expect(container).toMatchSnapshot();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo@example.com successfully invited', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('handles 401 from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByLabelText, getAllByRole } = renderInviteForm();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles non-401 from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getByLabelText, getAllByRole } = renderInviteForm();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed to send request from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getByLabelText, getAllByRole } = renderInviteForm();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown error from invite user request', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByLabelText, getAllByRole } = renderInviteForm();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('goes back to lists on Cancel', () => {
    const { getAllByRole } = renderInviteForm();

    fireEvent.click(getAllByRole('button')[1]);

    expect(mockNavigate).toHaveBeenCalledWith(`/lists`);
  });
});
