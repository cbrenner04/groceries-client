import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';

import axios from '../../utils/api';
import PageNotFound from './PageNotFound';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('PageNotFound', () => {
  const renderPageNotFound = () => {
    return render(
      <MemoryRouter>
        <PageNotFound />
      </MemoryRouter>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderPageNotFound();
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('redirects to /users/sign_in when the user is not authenticated', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
    renderPageNotFound();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');

    axios.get.mockClear();
  });

  it('displays UnknownError when an error occurs validating authentication', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const { container, getByRole } = renderPageNotFound();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(container).toMatchSnapshot();
    expect(getByRole('button')).toHaveTextContent('refresh the page');

    axios.get.mockClear();
  });

  it('displays PageNotFound when the user is authenticated', async () => {
    axios.get = jest.fn().mockResolvedValue({});
    const { container, getByText } = renderPageNotFound();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(container).toMatchSnapshot();
    expect(getByText('Page not found!')).toBeTruthy();

    axios.get.mockClear();
  });
});
