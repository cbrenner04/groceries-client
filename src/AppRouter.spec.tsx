import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from 'react-router';

import AppRouter from './AppRouter';
import { AddFormModal } from './components/ui/AddFormModal';
import { useBottomInputBarFormContext } from './components/layout/BottomInputBarFormContext';
import api from './utils/api';

function AddFormModalHarness(): React.JSX.Element {
  const { addFormModalOpen, setAddFormModalOpen } = useBottomInputBarFormContext();
  const close = (): void => setAddFormModalOpen(false);

  return (
    <>
      <button type="button" data-test-id="open-add-form-modal" onClick={() => setAddFormModalOpen(true)}>
        Open add form modal
      </button>
      <AddFormModal
        isOpen={addFormModalOpen}
        onClose={close}
        title="Add list"
        footer={
          <>
            <Link to="/templates" data-test-id="add-form-modal-route-change">
              Templates
            </Link>
            <button type="button" data-test-id="add-form-modal-cancel" onClick={close}>
              Cancel
            </button>
          </>
        }
      >
        <p>Add form body</p>
      </AddFormModal>
    </>
  );
}

vi.mock('./routes/lists/Lists', async () => {
  const actual = await vi.importActual('./routes/lists/Lists');
  const ActualLists = (actual as { default: React.ComponentType }).default;

  return {
    default: function ListsWithAddFormModalHarness(): React.JSX.Element {
      return (
        <>
          <ActualLists />
          <AddFormModalHarness />
        </>
      );
    },
  };
});

const defaultTemplateConfiguration = {
  id: 'config-1',
  name: 'Default Template',
  user_id: 'user-1',
  created_at: '',
  updated_at: '',
  archived_at: null,
};

const defaultListDetailData = {
  current_user_id: 'user-1',
  list: {
    id: 'list-1',
    name: 'Groceries',
    type: 'GroceryList',
    user_id: 'user-1',
    created_at: '',
    updated_at: '',
  },
  not_completed_items: [],
  completed_items: [],
  list_users: [],
  permissions: 'write',
  lists_to_update: [],
  list_item_configuration: {
    id: 'config-1',
    name: 'Default Configuration',
    user_id: 'user-1',
    created_at: '',
    updated_at: '',
    archived_at: null,
  },
  list_item_field_configurations: [],
  categories: [],
};

function mockListDetailApi(): void {
  vi.mocked(api.get).mockImplementation(async (url: string) => {
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
          list_item_configurations: [defaultTemplateConfiguration],
        },
      };
    }

    if (url === '/lists/list-1') {
      return { data: defaultListDetailData };
    }

    if (url.includes('list_item_field_configurations')) {
      return { data: [] };
    }

    if (url === '/list_item_configurations') {
      return { data: [] };
    }

    return { data: {} };
  });
}

function setAuthenticatedSession(): void {
  sessionStorage.setItem(
    'user',
    JSON.stringify({
      'access-token': 'stored-token',
      client: 'stored-client',
      uid: 'stored-uid',
    }),
  );
}

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

  describe('bottom nav visibility when add-form modal is open', () => {
    beforeEach(() => {
      setAuthenticatedSession();
    });

    it('hides bottom nav while the add-form modal is open', async () => {
      const user = userEvent.setup();
      const { findByTestId, queryByTestId } = renderAppRouter('/lists');

      expect(await findByTestId('bottom-nav')).toBeVisible();
      await user.click(await findByTestId('open-add-form-modal'));
      expect(await findByTestId('add-form-modal')).toBeVisible();
      expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();
    });

    it('restores bottom nav after closing the add-form modal', async () => {
      const user = userEvent.setup();
      const { findByTestId } = renderAppRouter('/lists');

      await user.click(await findByTestId('open-add-form-modal'));
      await user.click(await findByTestId('add-form-modal-cancel'));
      expect(await findByTestId('bottom-nav')).toBeVisible();
    });

    it('closes the settings menu when the add-form modal opens', async () => {
      const user = userEvent.setup();
      const { findByTestId, queryByTestId } = renderAppRouter('/lists');

      await user.click(await findByTestId('nav-settings'));
      expect(await findByTestId('settings-menu')).toBeVisible();

      await user.click(await findByTestId('open-add-form-modal'));
      expect(await findByTestId('add-form-modal')).toBeVisible();
      expect(queryByTestId('settings-menu')).not.toBeInTheDocument();
    });

    it('clears add-form modal state and restores bottom nav after route change', async () => {
      const user = userEvent.setup();
      const { findByTestId, queryByTestId } = renderAppRouter('/lists');

      await user.click(await findByTestId('open-add-form-modal'));
      expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();

      await user.click(await findByTestId('add-form-modal-route-change'));
      expect(await findByTestId('bottom-nav')).toBeVisible();
      expect(queryByTestId('add-form-modal')).not.toBeInTheDocument();
    });

    it('hides bottom nav when the list add-item modal is open', async () => {
      mockListDetailApi();
      const user = userEvent.setup();
      const { findByTestId, queryByTestId } = renderAppRouter('/lists/list-1');

      expect(await findByTestId('bottom-nav')).toBeVisible();
      await user.click(await findByTestId('list-add-fab'));
      expect(await findByTestId('add-list-item-modal')).toBeVisible();
      expect(queryByTestId('bottom-nav')).not.toBeInTheDocument();
    });

    it('restores bottom nav after closing the list add-item modal', async () => {
      mockListDetailApi();
      const user = userEvent.setup();
      const { findByTestId } = renderAppRouter('/lists/list-1');

      await user.click(await findByTestId('list-add-fab'));
      expect(await findByTestId('add-list-item-modal')).toBeVisible();
      await user.click(await findByTestId('add-list-item-cancel'));
      expect(await findByTestId('bottom-nav')).toBeVisible();
    });
  });
});
