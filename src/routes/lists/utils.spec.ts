import { sortLists, fetchLists, fetchCompletedLists, fetchListToEdit } from './utils';
import axios from '../../utils/api';
import { showToast } from '../../utils/toast';

const mockShowToast = showToast as jest.Mocked<typeof showToast>;

describe('utils', () => {
  const navigate = jest.fn();

  describe('sortLists', () => {
    it('returns sorted lists', () => {
      expect(
        sortLists([
          {
            id: 'id1',
            name: 'foo',
            list_item_configuration_id: 'config-1',
            completed: false,
            owner_id: 'id1',
            refreshed: false,
            created_at: new Date('05/31/2020').toISOString(),
          },
          {
            id: 'id1',
            name: 'foo',
            list_item_configuration_id: 'config-1',
            completed: false,
            owner_id: 'id1',
            refreshed: false,
            created_at: new Date('05/29/2020').toISOString(),
          },
          {
            id: 'id1',
            name: 'foo',
            list_item_configuration_id: 'config-1',
            completed: false,
            owner_id: 'id1',
            refreshed: false,
            created_at: new Date('05/30/2020').toISOString(),
          },
        ]),
      ).toStrictEqual([
        {
          id: 'id1',
          name: 'foo',
          list_item_configuration_id: 'config-1',
          completed: false,
          owner_id: 'id1',
          refreshed: false,
          created_at: new Date('05/31/2020').toISOString(),
        },
        {
          id: 'id1',
          name: 'foo',
          list_item_configuration_id: 'config-1',
          completed: false,
          owner_id: 'id1',
          refreshed: false,
          created_at: new Date('05/30/2020').toISOString(),
        },
        {
          id: 'id1',
          name: 'foo',
          list_item_configuration_id: 'config-1',
          completed: false,
          owner_id: 'id1',
          refreshed: false,
          created_at: new Date('05/29/2020').toISOString(),
        },
      ]);
    });
  });

  describe('fetchLists', () => {
    it('returns lists when successful', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          current_user_id: 1,
          accepted_lists: {
            completed_lists: [
              {
                id: 1,
                users_list_id: 1,
                name: 'foo',
                user_id: 1,
                list_item_configuration_id: 'config-1',
                created_at: new Date('05/31/2020').toISOString(),
                completed: true,
                refreshed: false,
                owner_id: 1,
              },
            ],
            not_completed_lists: [
              {
                id: 2,
                users_list_id: 2,
                name: 'bar',
                user_id: 1,
                list_item_configuration_id: 'config-2',
                created_at: new Date('05/31/2020').toISOString(),
                completed: false,
                refreshed: false,
                owner_id: 1,
              },
            ],
          },
          pending_lists: [
            {
              id: 3,
              users_list_id: 3,
              name: 'foo',
              user_id: 1,
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: false,
              refreshed: false,
              owner_id: 2,
            },
            {
              id: 4,
              users_list_id: 4,
              name: 'foo',
              user_id: 1,
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: false,
              refreshed: false,
              owner_id: 2,
            },
          ],
          current_list_permissions: {
            1: 'write',
            2: 'write',
            3: 'write',
          },
          list_item_configurations: [{ id: 'config-1', name: 'grocery list template' }],
        },
      });

      expect(await fetchLists({ navigate })).toStrictEqual({
        userId: 1,
        listItemConfigurations: [{ id: 'config-1', name: 'grocery list template' }],
        pendingLists: [
          {
            id: 3,
            users_list_id: 3,
            name: 'foo',
            user_id: 1,
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            refreshed: false,
            owner_id: 2,
          },
          {
            id: 4,
            users_list_id: 4,
            name: 'foo',
            user_id: 1,
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            refreshed: false,
            owner_id: 2,
          },
        ],
        completedLists: [
          {
            id: 1,
            users_list_id: 1,
            name: 'foo',
            user_id: 1,
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: true,
            refreshed: false,
            owner_id: 1,
          },
        ],
        incompleteLists: [
          {
            id: 2,
            users_list_id: 2,
            name: 'bar',
            user_id: 1,
            list_item_configuration_id: 'config-2',
            created_at: new Date('05/31/2020').toISOString(),
            completed: false,
            refreshed: false,
            owner_id: 1,
          },
        ],
        currentUserPermissions: {
          1: 'write',
          2: 'write',
          3: 'write',
        },
      });
    });

    it('redirects to login when 401 is returned', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
      await fetchLists({ navigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('throws error when error not 401 is returned', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });

      expect(fetchLists({ navigate })).rejects.toThrow();
    });
  });

  describe('fetchCompletedLists', () => {
    it('returns lists when successful', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          current_user_id: 1,
          completed_lists: [
            {
              id: 1,
              users_list_id: 1,
              name: 'foo',
              user_id: 1,
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 1,
            },
            {
              id: 2,
              users_list_id: 2,
              name: 'foo',
              user_id: 1,
              list_item_configuration_id: 'config-1',
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 1,
            },
          ],
          current_list_permissions: {
            1: 'write',
          },
        },
      });

      expect(await fetchCompletedLists({ navigate })).toStrictEqual({
        completedLists: [
          {
            id: 1,
            users_list_id: 1,
            name: 'foo',
            user_id: 1,
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: true,
            refreshed: false,
            owner_id: 1,
          },
          {
            id: 2,
            users_list_id: 2,
            name: 'foo',
            user_id: 1,
            list_item_configuration_id: 'config-1',
            created_at: new Date('05/31/2020').toISOString(),
            completed: true,
            refreshed: false,
            owner_id: 1,
          },
        ],
        userId: 1,
        currentUserPermissions: {
          1: 'write',
        },
      });
    });

    it('redirects to login when 401 is returned', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
      await fetchCompletedLists({ navigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('throws error when error not 401 is returned', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });

      expect(fetchCompletedLists({ navigate })).rejects.toThrow();
    });
  });

  describe('fetchListToEdit', () => {
    const id = '1';
    const navigate = jest.fn();

    it('returns correct body on success', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: { owner_id: 1, id: 1, name: 'foo', completed: false, list_item_configuration_id: 'config-1' },
      });

      expect(await fetchListToEdit({ id, navigate })).toStrictEqual({
        listId: 1,
        name: 'foo',
        completed: false,
        list_item_configuration_id: 'config-1',
      });
    });

    it('redirects to /users/sign_in when 401', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

      await fetchListToEdit({ id, navigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to /lists when 403', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 403 } });

      await fetchListToEdit({ id, navigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('redirects to /lists when 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } });

      await fetchListToEdit({ id, navigate });

      expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('throws when status is not 401, 403, 404', () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      expect(fetchListToEdit({ id, navigate })).rejects.toThrow();
    });

    it('throws when request fails', () => {
      axios.get = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      expect(fetchListToEdit({ id, navigate })).rejects.toThrow();
    });

    it('throws when unknown error occurs', () => {
      axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      expect(fetchListToEdit({ id, navigate })).rejects.toThrow();
    });
  });
});
