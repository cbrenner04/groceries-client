import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

import EditPassword from './EditPassword';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

jest.mock('axios');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    search: jest.fn(() => 'foo'),
  }),
}));

describe('EditPassword', () => {
  const renderEditPassword = (props) => {
    return render(
      <MemoryRouter>
        <EditPassword />
      </MemoryRouter>,
    );
  };

  it('sets password', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getByLabelText, getByTestId } = renderEditPassword();

    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });
    fireEvent.change(getByLabelText('Password confirmation'), { target: { value: 'foo' } });
    fireEvent.submit(getByTestId('password-form'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Password successfully updated', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors on failure', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getByLabelText, getByTestId } = renderEditPassword();

    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });
    fireEvent.change(getByLabelText('Password confirmation'), { target: { value: 'foo' } });
    fireEvent.submit(getByTestId('password-form'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors on failed request', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getByLabelText, getByTestId } = renderEditPassword();

    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });
    fireEvent.change(getByLabelText('Password confirmation'), { target: { value: 'foo' } });
    fireEvent.submit(getByTestId('password-form'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors on unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByLabelText, getByTestId } = renderEditPassword();

    fireEvent.change(getByLabelText('Password'), { target: { value: 'foo' } });
    fireEvent.change(getByLabelText('Password confirmation'), { target: { value: 'foo' } });
    fireEvent.submit(getByTestId('password-form'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });
});
