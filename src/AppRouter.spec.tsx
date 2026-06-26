import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppRouter, { BOTTOM_INPUT_BAR_PORTAL_TARGET_ID } from './AppRouter';
import api from './utils/api';

function renderAppRouter(pathname: string): ReturnType<typeof render> {
  window.history.pushState({}, '', pathname);
  return render(<AppRouter />);
}

describe('AppRouter', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.spyOn(api, 'delete').mockResolvedValue({} as never);
    vi.spyOn(api, 'get').mockImplementation(async (url: string) => {
      if (url === '/auth/validate_token') {
        throw new Error('not signed in');
      }

      if (url === '/lists/') {
        return {
          data: {
            current_user_id: 'user-1',
            pending_lists: [],
            accepted_lists: {
              completed_lists: [],
              not_completed_lists: [],
            },
            current_list_permissions: {},
            list_item_configurations: [
              {
                id: 'config-1',
                name: 'Default Template',
                archived_at: null,
              },
            ],
          },
        };
      }

      if (url === '/list_item_configurations') {
        return {
          data: [],
        };
      }

      return {
        data: {},
      };
    });
    vi.spyOn(api, 'post').mockResolvedValue({
      headers: {
        'access-token': 'token',
        client: 'client',
      },
      data: {
        data: {
          uid: 'uid',
        },
      },
    } as never);
    vi.spyOn(api, 'put').mockResolvedValue({} as never);
    vi.clearAllMocks();
  });

  it('redirects root path to lists and hides bottom nav when logged out', async () => {
    const { findByText, queryByTestId } = renderAppRouter('/');

    expect(await findByText('Lists')).toBeVisible();
    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();
  });

  it('loads a stored session and shows bottom nav on authenticated pages', async () => {
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        'access-token': 'stored-token',
        client: 'stored-client',
        uid: 'stored-uid',
      }),
    );

    const { findByTestId, findByText } = renderAppRouter('/lists');

    expect(await findByText('Lists')).toBeVisible();
    expect(await findByTestId('bottom-nav')).toBeVisible();
  });

  it('hides bottom nav on auth pages and shows it after sign in navigates to an app page', async () => {
    const user = userEvent.setup();
    const { findByLabelText, findByRole, findByTestId, queryByTestId } = renderAppRouter('/users/sign_in');

    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();

    await user.type(await findByLabelText('Email'), 'user@example.com');
    await user.type(await findByLabelText('Password'), 'password');
    await user.click(await findByRole('button', { name: 'Log In' }));

    await waitFor(() => expect(sessionStorage.getItem('user')).toContain('"access-token":"token"'));
    expect(await findByTestId('bottom-nav')).toBeVisible();
  });

  it('renders all route elements', async () => {
    expect(await renderAppRouter('/completed_lists').findByText('Completed')).toBeVisible();
    expect(await renderAppRouter('/templates').findByText('Templates')).toBeVisible();
    expect(
      await renderAppRouter('/users/password/new').findByRole('heading', { name: 'Forgot your password?' }),
    ).toBeVisible();
    expect(
      await renderAppRouter('/users/password/edit').findByRole('heading', { name: 'Change your password' }),
    ).toBeVisible();
    expect(
      await renderAppRouter('/users/invitation/new').findByRole('heading', { name: 'Send Invitation' }),
    ).toBeVisible();
  });

  it('opens and closes the settings menu from the bottom nav', async () => {
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        'access-token': 'stored-token',
        client: 'stored-client',
        uid: 'stored-uid',
      }),
    );

    const user = userEvent.setup();
    const { findByTestId, queryByTestId } = renderAppRouter('/lists');

    await user.click(await findByTestId('nav-settings'));
    expect(await findByTestId('settings-menu')).toBeVisible();

    await user.click(await findByTestId('nav-settings'));
    await waitFor(() => {
      expect(queryByTestId('settings-menu')).not.toBeInTheDocument();
    });
  });

  it('closes the settings menu when another bottom-nav item is clicked', async () => {
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        'access-token': 'stored-token',
        client: 'stored-client',
        uid: 'stored-uid',
      }),
    );

    const user = userEvent.setup();
    const { findByRole, findByTestId, queryByTestId } = renderAppRouter('/lists');

    await user.click(await findByTestId('nav-settings'));
    expect(await findByTestId('settings-menu')).toBeVisible();

    await user.click(await findByTestId('nav-templates'));
    expect(await findByRole('heading', { name: 'Templates' })).toBeVisible();
    await waitFor(() => {
      expect(queryByTestId('settings-menu')).not.toBeInTheDocument();
    });
  });

  it('closes the settings menu when the real overlay callback fires', async () => {
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        'access-token': 'stored-token',
        client: 'stored-client',
        uid: 'stored-uid',
      }),
    );

    const user = userEvent.setup();
    const { findByTestId, queryByTestId } = renderAppRouter('/lists');

    await user.click(await findByTestId('nav-settings'));

    const overlay = await findByTestId('settings-menu');
    await user.click(overlay);
    await waitFor(() => {
      expect(queryByTestId('settings-menu')).not.toBeInTheDocument();
    });
  });

  it('logs out through the settings menu and navigates to sign in even if sign out request fails', async () => {
    sessionStorage.setItem(
      'user',
      JSON.stringify({
        'access-token': 'stored-token',
        client: 'stored-client',
        uid: 'stored-uid',
      }),
    );
    vi.mocked(api.delete).mockRejectedValueOnce(new Error('request failed'));

    const user = userEvent.setup();
    const { findByTestId, queryByTestId } = renderAppRouter('/lists');

    await user.click(await findByTestId('nav-settings'));
    await user.click(await findByTestId('log-out-link'));

    expect(sessionStorage.getItem('user')).toBeNull();
    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();
    expect(api.delete).toHaveBeenCalledWith('/auth/sign_out');
  });

  it('mounts the BottomInputBar portal target outside PageTransition', async () => {
    renderAppRouter('/lists');
    const portalTarget = document.getElementById(BOTTOM_INPUT_BAR_PORTAL_TARGET_ID);
    const pageTransition = document.querySelector('[data-test-id="page-transition"]');

    // BottomInputBar creates its own viewport-level portal target on document.body.
    expect(portalTarget).toBeInTheDocument();
    expect(pageTransition).toBeInTheDocument();

    // It must live outside the PageTransition transform ancestor so the bar's
    // position: fixed resolves against the viewport.
    expect(pageTransition).not.toContainElement(portalTarget);

    // It is a direct child of document.body (owned by BottomInputBar, not the router tree).
    expect(portalTarget?.parentElement).toBe(document.body);
  });
});
