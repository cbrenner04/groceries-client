import { toast } from 'react-toastify';

import { fetchData } from './utils';
import axios from '../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('utils', () => {
  describe('fetchData', () => {
    const navigate = jest.fn();

    it('returns data on success when user is in accepted and has write permissions', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          accepted: [
            { user: { id: 1, email: 'foo@example.com' }, users_list: { id: 1, permissions: 'read' } },
            { user: { id: 4, email: 'foobaz@example.com' }, users_list: { id: 4, permissions: 'write' } },
          ],
          pending: [{ user: { id: 2, email: 'bar@example.com' }, users_list: { id: 2, permissions: 'write' } }],
          refused: [{ user: { id: 3, email: 'baz@example.com' }, users_list: { id: 3, permissions: 'read' } }],
          current_user_id: 4,
          user_is_owner: true,
          invitable_users: [{ id: 5, email: 'foobar@example.com' }],
          list: {
            name: 'foo',
            id: 1,
          },
        },
      });

      expect(await fetchData({ listId: '1', navigate })).toStrictEqual({
        name: 'foo',
        invitableUsers: [{ id: 5, email: 'foobar@example.com' }],
        listId: 1,
        userIsOwner: true,
        pending: [{ user: { id: 2, email: 'bar@example.com' }, users_list: { id: 2, permissions: 'write' } }],
        accepted: [
          { user: { id: 1, email: 'foo@example.com' }, users_list: { id: 1, permissions: 'read' } },
          { user: { id: 4, email: 'foobaz@example.com' }, users_list: { id: 4, permissions: 'write' } },
        ],
        refused: [{ user: { id: 3, email: 'baz@example.com' }, users_list: { id: 3, permissions: 'read' } }],
        userId: 4,
      });
    });

    it('redirects to lists on success when user is not in accepted', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          accepted: [{ user: { id: 1, email: 'foo@example.com' }, users_list: { id: 1, permissions: 'read' } }],
          pending: [{ user: { id: 2, email: 'bar@example.com' }, users_list: { id: 2, permissions: 'write' } }],
          refused: [{ user: { id: 3, email: 'baz@example.com' }, users_list: { id: 3, permissions: 'read' } }],
          current_user_id: 4,
          user_is_owner: true,
          invitable_users: [{ id: 5, email: 'foobar@example.com' }],
          list: {
            name: 'foo',
            id: 1,
          },
        },
      });

      await fetchData({ listId: '1', navigate });

      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('redirects to lists on success when user does not have write permissions', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          accepted: [
            { user: { id: 1, email: 'foo@example.com' }, users_list: { id: 1, permissions: 'read' } },
            { user: { id: 4, email: 'foobaz@example.com' }, users_list: { id: 4, permissions: 'read' } },
          ],
          pending: [{ user: { id: 2, email: 'bar@example.com' }, users_list: { id: 2, permissions: 'write' } }],
          refused: [{ user: { id: 3, email: 'baz@example.com' }, users_list: { id: 3, permissions: 'read' } }],
          current_user_id: 4,
          user_is_owner: true,
          invitable_users: [{ id: 5, email: 'foobar@example.com' }],
          list: {
            name: 'foo',
            id: 1,
          },
        },
      });

      await fetchData({ listId: '1', navigate });

      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('handles 401', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

      await fetchData({ listId: '1', navigate });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('handles 403', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 403 } });

      await fetchData({ listId: '1', navigate });

      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('handles 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } });

      await fetchData({ listId: '1', navigate });

      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('handles not 401, 403, 404', () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      expect(fetchData({ listId: '1', navigate })).rejects.toThrow();
    });
  });
});
