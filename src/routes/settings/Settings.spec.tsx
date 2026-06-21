import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';
import * as router from 'react-router';

import axios from 'utils/api';
import { ThemeProvider } from 'components/ThemeProvider';
import { UserContext } from 'AppRouter';
import * as toastModule from 'utils/toast';

import Settings from './Settings';

describe('Settings', () => {
  const mockSignOutUser = vi.fn(() => {
    sessionStorage.removeItem('user');
  });
  const mockNavigate = vi.fn();

  const renderSettings = (): RenderResult => {
    vi.spyOn(router, 'useNavigate').mockReturnValue(mockNavigate);
    return render(
      <UserContext.Provider
        value={{
          user: { accessToken: 'token', client: 'client', uid: 'uid' },
          signOutUser: mockSignOutUser,
        }}
      >
        <MemoryRouter>
          <ThemeProvider>
            <Settings />
          </ThemeProvider>
        </MemoryRouter>
      </UserContext.Provider>,
    );
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('renders page titled "Settings"', async () => {
    const { findByText } = renderSettings();
    expect(await findByText('Settings')).toBeVisible();
  });

  it('renders theme selector with Light, Dark, and System options', async () => {
    const { findByTestId } = renderSettings();

    expect(await findByTestId('theme-light')).toBeInTheDocument();
    expect(await findByTestId('theme-dark')).toBeInTheDocument();
    expect(await findByTestId('theme-system')).toBeInTheDocument();
  });

  it('renders theme selector as accessible radiogroup labelled "Theme"', async () => {
    const { findByRole } = renderSettings();
    const radiogroup = await findByRole('radiogroup', { name: 'Theme' });
    expect(radiogroup).toBeInTheDocument();
  });

  it('indicates the currently active theme via aria-checked', async () => {
    localStorage.setItem('theme', 'dark');
    const { findByTestId } = renderSettings();

    const darkOption = await findByTestId('theme-dark');
    await waitFor(() => {
      expect(darkOption).toHaveAttribute('aria-checked', 'true');
    });

    const lightOption = await findByTestId('theme-light');
    expect(lightOption).toHaveAttribute('aria-checked', 'false');
  });

  it('updates theme and persists to localStorage when selecting a theme option', async () => {
    const user = userEvent.setup();
    const { findByTestId } = renderSettings();

    const darkOption = await findByTestId('theme-dark');
    await user.click(darkOption);

    await waitFor(() => {
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    expect(darkOption).toHaveAttribute('aria-checked', 'true');
  });

  it('renders sign-out control in destructive section', async () => {
    const { findByTestId } = renderSettings();
    const logoutButton = await findByTestId('log-out-link');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveClass('tw:bg-[var(--color-danger)]');
  });

  it('clears session and navigates to sign in when log out is clicked', async () => {
    const user = userEvent.setup();
    sessionStorage.setItem('user', JSON.stringify({ 'access-token': 'token', client: 'client', uid: 'uid' }));
    axios.delete = vi.fn().mockResolvedValue({});
    vi.spyOn(toastModule.showToast, 'info');

    const { findByTestId } = renderSettings();
    const logoutButton = await findByTestId('log-out-link');

    await user.click(logoutButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith('/auth/sign_out');
      expect(sessionStorage.getItem('user')).toBeNull();
      expect(toastModule.showToast.info).toHaveBeenCalledWith('Log out successful');
      expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
    });
  });
});
