import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppRouter from './AppRouter';

const { mockDelete, mockPreloadComponent, mockShowToastInfo } = vi.hoisted(() => ({
  mockDelete: vi.fn(),
  mockPreloadComponent: vi.fn(),
  mockShowToastInfo: vi.fn(),
}));

vi.mock('./utils/api', () => ({
  default: {
    delete: mockDelete,
  },
}));

vi.mock('./utils/toast', () => ({
  showToast: {
    info: mockShowToastInfo,
  },
}));

vi.mock('./utils/lazyComponents', () => ({
  createLazyComponent: (loader: () => Promise<unknown>) => {
    const path = loader.toString();

    if (path.includes('share_list/ShareList')) {
      return (): React.JSX.Element => <div>Share List Route</div>;
    }

    if (path.includes('list/EditList')) {
      return (): React.JSX.Element => <div>Edit List Route</div>;
    }

    if (path.includes('BulkEditListItems')) {
      return (): React.JSX.Element => <div>Bulk Edit List Items Route</div>;
    }

    if (path.includes('templates/EditTemplate')) {
      return (): React.JSX.Element => <div>Edit Template Route</div>;
    }

    return (): React.JSX.Element => <div>Lazy Route</div>;
  },
  preloadComponent: mockPreloadComponent,
}));

vi.mock('./routes/lists/CompletedLists', () => ({
  default: (): React.JSX.Element => <div>Completed Lists Route</div>,
}));

vi.mock('./routes/users/EditInvite', () => ({
  default: (): React.JSX.Element => <div>Edit Invite Route</div>,
}));

vi.mock('./routes/users/EditPassword', () => ({
  default: (): React.JSX.Element => <div>Edit Password Route</div>,
}));

vi.mock('./routes/users/InviteForm', () => ({
  default: (): React.JSX.Element => <div>Invite Form Route</div>,
}));

vi.mock('./routes/lists/Lists', () => ({
  default: (): React.JSX.Element => <div>Lists Route</div>,
}));

vi.mock('./routes/templates/Templates', () => ({
  default: (): React.JSX.Element => <div>Templates Route</div>,
}));

vi.mock('./routes/users/NewPassword', () => ({
  default: (): React.JSX.Element => <div>New Password Route</div>,
}));

vi.mock('./routes/users/NewSession', () => ({
  default: (props: { signInUser: (accessToken: string, client: string, uid: string) => void }): React.JSX.Element => (
    <div>
      <div>New Session Route</div>
      <button type="button" data-test-id="sign-in-user" onClick={() => props.signInUser('token', 'client', 'uid')}>
        Sign In
      </button>
    </div>
  ),
}));

vi.mock('./routes/error_pages/PageNotFound', () => ({
  default: (): React.JSX.Element => <div>Page Not Found Route</div>,
}));

vi.mock('./routes/list/List', () => ({
  default: (): React.JSX.Element => <div>List Route</div>,
}));

vi.mock('./routes/list/EditListItem', () => ({
  default: (): React.JSX.Element => <div>Edit List Item Route</div>,
}));

function renderAppRouter(pathname: string): ReturnType<typeof render> {
  window.history.pushState({}, '', pathname);
  return render(<AppRouter />);
}

describe('AppRouter', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockDelete.mockReset();
    mockDelete.mockResolvedValue({});
    mockShowToastInfo.mockReset();
    mockPreloadComponent.mockReset();
  });

  it('redirects root path to lists and hides bottom nav when logged out', async () => {
    const { findByText, queryByTestId } = renderAppRouter('/');

    expect(await findByText('Lists Route')).toBeVisible();
    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();
    expect(mockPreloadComponent).toHaveBeenCalledTimes(4);
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

    expect(await findByText('Lists Route')).toBeVisible();
    expect(await findByTestId('bottom-nav')).toBeVisible();
  });

  it('hides bottom nav on auth pages even after sign in and shows it after navigation to an app page', async () => {
    const user = userEvent.setup();
    const { findByTestId, queryByTestId } = renderAppRouter('/users/sign_in');

    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();

    await user.click(await findByTestId('sign-in-user'));

    expect(sessionStorage.getItem('user')).toContain('"access-token":"token"');
    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();

    window.history.pushState({}, '', '/templates');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(await findByTestId('bottom-nav')).toBeVisible();
  });

  it('renders all route elements', async () => {
    expect(await renderAppRouter('/completed_lists').findByText('Completed Lists Route')).toBeVisible();
    expect(await renderAppRouter('/lists/1').findByText('List Route')).toBeVisible();
    expect(await renderAppRouter('/lists/1/edit').findByText('Edit List Route')).toBeVisible();
    expect(await renderAppRouter('/lists/1/list_items/2/edit').findByText('Edit List Item Route')).toBeVisible();
    expect(
      await renderAppRouter('/lists/1/list_items/bulk-edit').findByText('Bulk Edit List Items Route'),
    ).toBeVisible();
    expect(await renderAppRouter('/lists/1/users_lists').findByText('Share List Route')).toBeVisible();
    expect(await renderAppRouter('/templates').findByText('Templates Route')).toBeVisible();
    expect(await renderAppRouter('/templates/2/edit').findByText('Edit Template Route')).toBeVisible();
    expect(await renderAppRouter('/users/password/new').findByText('New Password Route')).toBeVisible();
    expect(await renderAppRouter('/users/password/edit').findByText('Edit Password Route')).toBeVisible();
    expect(await renderAppRouter('/users/invitation/new').findByText('Invite Form Route')).toBeVisible();
    expect(await renderAppRouter('/users/invitation/accept').findByText('Edit Invite Route')).toBeVisible();
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
    const { findByTestId, findByText, queryByTestId } = renderAppRouter('/lists');

    await user.click(await findByTestId('nav-settings'));
    expect(await findByTestId('settings-menu')).toBeVisible();

    await user.click(await findByTestId('nav-templates'));
    expect(await findByText('Templates Route')).toBeVisible();
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
    const settingsMenu = await findByTestId('settings-menu');
    const overlay = settingsMenu.parentElement?.parentElement as HTMLElement;

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
    mockDelete.mockRejectedValueOnce(new Error('request failed'));

    const user = userEvent.setup();
    const { findByTestId, findByText, queryByTestId } = renderAppRouter('/lists');

    await user.click(await findByTestId('nav-settings'));
    await user.click(await findByTestId('log-out-link'));

    expect(await findByText('New Session Route')).toBeVisible();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();
    expect(mockDelete).toHaveBeenCalledWith('/auth/sign_out');
    expect(mockShowToastInfo).toHaveBeenCalledWith('Log out successful');
  });
});
