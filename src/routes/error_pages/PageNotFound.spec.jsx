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

function setup() {
  const component = render(
    <MemoryRouter>
      <PageNotFound />
    </MemoryRouter>,
  );

  return { ...component };
}

describe('PageNotFound', () => {
  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = setup();
    const status = await findByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('redirects to /users/sign_in when the user is not authenticated', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
    setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');

    axios.get.mockClear();
  });

  it('displays UnknownError when an error occurs validating authentication', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const { container, findByRole } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();

    axios.get.mockClear();
  });

  it('displays PageNotFound when the user is authenticated', async () => {
    axios.get = jest.fn().mockResolvedValue({});
    const { container, findByText } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(await findByText('Page not found!')).toBeTruthy();
    expect(container).toMatchSnapshot();

    axios.get.mockClear();
  });
});
