import React from 'react';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { toast } from 'react-toastify';

import axios from 'utils/api';
import PageNotFound from './PageNotFound';

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

const setup = (): RenderResult =>
  render(
    <MemoryRouter>
      <PageNotFound />
    </MemoryRouter>,
  );

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

    (axios.get as jest.Mock).mockClear();
  });

  it('displays UnknownError when an error occurs validating authentication', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });
    const { container, findByRole } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();

    (axios.get as jest.Mock).mockClear();
  });

  it('displays PageNotFound when the user is authenticated', async () => {
    axios.get = jest.fn().mockResolvedValue({});
    const { container, findByText } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(await findByText('Page not found!')).toBeTruthy();
    expect(container).toMatchSnapshot();

    (axios.get as jest.Mock).mockClear();
  });
});
