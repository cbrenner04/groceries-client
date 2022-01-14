import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

import NewPassword from './NewPassword';
import axios from '../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('NewPassword', () => {
  const renderNewPassword = () => {
    return render(
      <MemoryRouter>
        <NewPassword />
      </MemoryRouter>,
    );
  };

  it('requests new password', async () => {
    axios.post = jest.fn().mockResolvedValue({});
    const { container, getByLabelText, getByRole } = renderNewPassword();

    expect(container).toMatchSnapshot();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
      { type: 'info' },
    );
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('has same outcome when error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const { getByLabelText, getByRole } = renderNewPassword();

    fireEvent.change(getByLabelText('Email'), { target: { value: 'foo@example.com' } });
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith(
      'If foo@example.com is in our system, you will receive an email shortly with reset instructions.',
      { type: 'info' },
    );
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });
});
