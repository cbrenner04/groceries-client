import React from 'react';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { showToast } from '../../utils/toast';

import axios from 'utils/api';
import PageNotFound from './PageNotFound';

const mockShowToast = showToast as Mocked<typeof showToast>;
const mockNavigate = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: (): Mock => mockNavigate,
}));

const setup = (): RenderResult =>
  render(
    <MemoryRouter>
      <PageNotFound />
    </MemoryRouter>,
  );

describe('PageNotFound', () => {
  it('renders the Loading component when fetch request is pending', async () => {
    axios.get = vi.fn().mockImplementation(() => new Promise(() => {}));
    const { container, findByText } = setup();
    const status = await findByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeVisible();

    (axios.get as Mock).mockClear();
  });

  it('redirects to /users/sign_in when the user is not authenticated', async () => {
    axios.get = vi.fn().mockRejectedValue({ response: { status: 401 } });
    setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');

    (axios.get as Mock).mockClear();
  });

  it('displays UnknownError when an error occurs validating authentication', async () => {
    axios.get = vi.fn().mockRejectedValue({ response: { status: 500 } });
    const { container, findByRole } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();

    (axios.get as Mock).mockClear();
  });

  it('displays PageNotFound when the user is authenticated', async () => {
    axios.get = vi.fn().mockResolvedValue({});
    const { container, findByText } = setup();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(axios.get).toHaveBeenCalledWith('/auth/validate_token');
    expect(await findByText('Page not found!')).toBeTruthy();
    expect(container).toMatchSnapshot();

    (axios.get as Mock).mockClear();
  });
});
