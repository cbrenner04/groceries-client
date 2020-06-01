import { toast } from 'react-toastify';

import { sortLists, fetchLists, fetchCompletedLists } from './utils';
import axios from '../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('utils', () => {
  const history = {
    push: jest.fn(),
  };

  describe('sortLists', () => {
    it('returns sorted lists', () => {
      expect(
        sortLists([
          { created_at: new Date('05/31/2020').toISOString() },
          { created_at: new Date('05/29/2020').toISOString() },
          { created_at: new Date('05/30/2020').toISOString() },
        ]),
      ).toStrictEqual([
        { created_at: new Date('05/31/2020').toISOString() },
        { created_at: new Date('05/30/2020').toISOString() },
        { created_at: new Date('05/29/2020').toISOString() },
      ]);
    });
  });

  describe('fetchLists', () => {
    it('returns lists when successful', async () => {
      axios.get = jest.fn().mockImplementation((route) => {
        if (route === '/lists/') {
          return Promise.resolve({
            data: {
              current_user_id: 1,
              accepted_lists: [
                {
                  id: 1,
                  users_list_id: 1,
                  name: 'foo',
                  user_id: 1,
                  type: 'GroceryList',
                  created_at: new Date('05/31/2020').toISOString(),
                  completed: true,
                  refreshed: false,
                  owner_id: 1,
                },
                {
                  id: 2,
                  users_list_id: 2,
                  name: 'bar',
                  user_id: 1,
                  type: 'BookList',
                  created_at: new Date('05/31/2020').toISOString(),
                  completed: false,
                  refreshed: false,
                  owner_id: 1,
                },
              ],
              pending_lists: [
                {
                  id: 3,
                  users_list_id: 3,
                  name: 'foo',
                  user_id: 1,
                  type: 'GroceryList',
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
                  type: 'GroceryList',
                  created_at: new Date('05/31/2020').toISOString(),
                  completed: false,
                  refreshed: false,
                  owner_id: 2,
                },
              ],
            },
          });
        }
        if (route === '/lists/1/users_lists/1') {
          return Promise.resolve({ data: { list_id: 1, permissions: 'write' } });
        }
        if (route === '/lists/2/users_lists/2') {
          return Promise.resolve({ data: { list_id: 2, permissions: 'write' } });
        }
        if (route === '/lists/3/users_lists/3') {
          return Promise.resolve({ data: { list_id: 3, permissions: 'write' } });
        }
        if (route === '/lists/4/users_lists/4') {
          return Promise.reject({ response: { status: 404 } });
        }
      });

      expect(await fetchLists({ history })).toStrictEqual({
        userId: 1,
        pendingLists: [
          {
            id: 3,
            users_list_id: 3,
            name: 'foo',
            user_id: 1,
            type: 'GroceryList',
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
            type: 'GroceryList',
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
            type: 'GroceryList',
            created_at: new Date('05/31/2020').toISOString(),
            completed: true,
            refreshed: false,
            owner_id: 1,
          },
        ],
        nonCompletedLists: [
          {
            id: 2,
            users_list_id: 2,
            name: 'bar',
            user_id: 1,
            type: 'BookList',
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
      await fetchLists({ history });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(history.push).toHaveBeenCalledWith('/users/sign_in');
    });

    it('throws error when error not 401 is returned', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });

      expect(fetchLists({ history })).rejects.toThrow();
    });
  });

  describe('fetchCompletedLists', () => {
    it('returns lists when successful', async () => {
      axios.get = jest.fn().mockImplementation((route) => {
        if (route === '/completed_lists/') {
          return Promise.resolve({
            data: {
              completed_lists: [
                {
                  id: 1,
                  users_list_id: 1,
                  name: 'foo',
                  user_id: 1,
                  type: 'GroceryList',
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
                  type: 'GroceryList',
                  created_at: new Date('05/31/2020').toISOString(),
                  completed: true,
                  refreshed: false,
                  owner_id: 1,
                },
              ],
            },
          });
        }
        if (route === '/lists/1/users_lists/1') {
          return Promise.resolve({ data: { list_id: 1, permissions: 'write' } });
        }
        if (route === '/lists/2/users_lists/2') {
          return Promise.reject({ response: { status: 404 } });
        }
      });

      expect(await fetchCompletedLists({ history })).toStrictEqual({
        completedLists: [
          {
            id: 1,
            users_list_id: 1,
            name: 'foo',
            user_id: 1,
            type: 'GroceryList',
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
            type: 'GroceryList',
            created_at: new Date('05/31/2020').toISOString(),
            completed: true,
            refreshed: false,
            owner_id: 1,
          },
        ],
        currentUserPermissions: {
          1: 'write',
        },
      });
    });

    it('redirects to login when 401 is returned', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
      await fetchCompletedLists({ history });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(history.push).toHaveBeenCalledWith('/users/sign_in');
    });

    it('throws error when error not 401 is returned', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });

      expect(fetchCompletedLists({ history })).rejects.toThrow();
    });
  });
});