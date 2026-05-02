import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppRouter from './AppRouter';

const { mockDelete, mockGet, mockPost, mockPreloadComponent, mockPut, mockShowToastError, mockShowToastInfo } =
  vi.hoisted(() => ({
    mockDelete: vi.fn(),
    mockGet: vi.fn(),
    mockPost: vi.fn(),
    mockPreloadComponent: vi.fn(),
    mockPut: vi.fn(),
    mockShowToastError: vi.fn(),
    mockShowToastInfo: vi.fn(),
  }));

vi.mock('./utils/api', () => ({
  default: {
    delete: mockDelete,
    get: mockGet,
    post: mockPost,
    put: mockPut,
  },
}));

vi.mock('./utils/toast', () => ({
  showToast: {
    error: mockShowToastError,
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

vi.mock('./routes/lists/utils', () => ({
  fetchLists: vi.fn().mockResolvedValue({
    userId: 'user-1',
    pendingLists: [],
    completedLists: [],
    incompleteLists: [],
    currentUserPermissions: 'write',
    listItemConfigurations: [],
  }),
}));

vi.mock('./routes/lists/containers/ListsContainer', () => ({
  default: (props: { initialFilter?: 'all' | 'pending' | 'active' | 'completed' }): React.JSX.Element => (
    <div>Lists Container Route {props.initialFilter ?? 'all'}</div>
  ),
}));

vi.mock('./routes/templates/utils', () => ({
  fetchTemplates: vi.fn().mockResolvedValue({
    templates: [],
  }),
}));

vi.mock('./routes/templates/containers/TemplatesContainer', () => ({
  default: (): React.JSX.Element => <div>Templates Container Route</div>,
}));

vi.mock('./routes/users/EditInvite', () => ({
  default: (): React.JSX.Element => <div>Edit Invite Route</div>,
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
    mockGet.mockReset();
    mockGet.mockRejectedValue(new Error('not signed in'));
    mockPost.mockReset();
    mockPost.mockResolvedValue({
      headers: {
        'access-token': 'token',
        client: 'client',
      },
      data: {
        data: {
          uid: 'uid',
        },
      },
    });
    mockPut.mockReset();
    mockPut.mockResolvedValue({});
    mockShowToastError.mockReset();
    mockShowToastInfo.mockReset();
    mockPreloadComponent.mockReset();
  });

  it('redirects root path to lists and hides bottom nav when logged out', async () => {
    const { findByText, queryByTestId } = renderAppRouter('/');

    expect(await findByText('Lists Container Route all')).toBeVisible();
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

    expect(await findByText('Lists Container Route all')).toBeVisible();
    expect(await findByTestId('bottom-nav')).toBeVisible();
  });

  it('hides bottom nav on auth pages even after sign in and shows it after navigation to an app page', async () => {
    const user = userEvent.setup();
    const { findByLabelText, findByRole, findByTestId, queryByTestId } = renderAppRouter('/users/sign_in');

    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();

    await user.type(await findByLabelText('Email'), 'user@example.com');
    await user.type(await findByLabelText('Password'), 'password');
    await user.click(await findByRole('button', { name: 'Log In' }));

    expect(sessionStorage.getItem('user')).toContain('"access-token":"token"');
    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();

    window.history.pushState({}, '', '/templates');
    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(await findByTestId('bottom-nav')).toBeVisible();
  });

  it('renders all route elements', async () => {
    expect(await renderAppRouter('/completed_lists').findByText('Lists Container Route completed')).toBeVisible();
    expect(await renderAppRouter('/lists/1').findByText('List Route')).toBeVisible();
    expect(await renderAppRouter('/lists/1/edit').findByText('Edit List Route')).toBeVisible();
    expect(await renderAppRouter('/lists/1/list_items/2/edit').findByText('Edit List Item Route')).toBeVisible();
    expect(
      await renderAppRouter('/lists/1/list_items/bulk-edit').findByText('Bulk Edit List Items Route'),
    ).toBeVisible();
    expect(await renderAppRouter('/lists/1/users_lists').findByText('Share List Route')).toBeVisible();
    expect(await renderAppRouter('/templates').findByText('Templates Container Route')).toBeVisible();
    expect(await renderAppRouter('/templates/2/edit').findByText('Edit Template Route')).toBeVisible();
    expect(
      await renderAppRouter('/users/password/new').findByRole('heading', { name: 'Forgot your password?' }),
    ).toBeVisible();
    expect(
      await renderAppRouter('/users/password/edit').findByRole('heading', { name: 'Change your password' }),
    ).toBeVisible();
    expect(
      await renderAppRouter('/users/invitation/new').findByRole('heading', { name: 'Send Invitation' }),
    ).toBeVisible();
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
    expect(await findByText('Templates Container Route')).toBeVisible();
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

    expect(await findByText('Log in')).toBeVisible();
    expect(sessionStorage.getItem('user')).toBeNull();
    expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();
    expect(mockDelete).toHaveBeenCalledWith('/auth/sign_out');
    expect(mockShowToastInfo).toHaveBeenCalledWith('Log out successful');
  });
});
