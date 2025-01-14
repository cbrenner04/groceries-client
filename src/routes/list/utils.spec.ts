import { toast } from 'react-toastify';

import axios from 'utils/api';
import { EListType } from 'typings';

import {
  itemName,
  mapIncludedCategories,
  categorizeNotPurchasedItems,
  sortItems,
  fetchList,
  fetchItemToEdit,
  fetchItemsToEdit,
} from './utils';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('utils', () => {
  describe('itemName', () => {
    it('returns correct title', () => {
      expect(itemName({ id: 'id1', title: 'foo', author: 'bar' }, EListType.BOOK_LIST)).toBe('"foo" bar');
      expect(itemName({ id: 'id1', title: 'foo' }, EListType.BOOK_LIST)).toBe('"foo"');
      expect(itemName({ id: 'id1', author: 'foo' }, EListType.BOOK_LIST)).toBe('foo');
      expect(itemName({ id: 'id1', quantity: 'foo', product: 'bar' }, EListType.GROCERY_LIST)).toBe('foo bar');
      expect(itemName({ id: 'id1', quantity: 'foo' }, EListType.GROCERY_LIST)).toBe('foo');
      expect(itemName({ id: 'id1', product: 'foo' }, EListType.GROCERY_LIST)).toBe('foo');
      expect(itemName({ id: 'id1', title: 'foo', artist: 'bar', album: 'baz' }, EListType.MUSIC_LIST)).toBe(
        '"foo" bar - baz',
      );
      expect(itemName({ id: 'id1', title: 'foo', artist: 'bar' }, EListType.MUSIC_LIST)).toBe('"foo" bar');
      expect(itemName({ id: 'id1', artist: 'foo', album: 'bar' }, EListType.MUSIC_LIST)).toBe('foo - bar');
      expect(itemName({ id: 'id1', title: 'foo', album: 'bar' }, EListType.MUSIC_LIST)).toBe('"foo" bar');
      expect(itemName({ id: 'id1', title: 'foo' }, EListType.MUSIC_LIST)).toBe('"foo"');
      expect(itemName({ id: 'id1', album: 'foo' }, EListType.MUSIC_LIST)).toBe('foo');
      expect(itemName({ id: 'id1', artist: 'foo' }, EListType.MUSIC_LIST)).toBe('foo');
      expect(itemName({ id: 'id1', content: 'foo' }, EListType.SIMPLE_LIST)).toBe('foo');
      expect(itemName({ id: 'id1', task: 'foo' }, EListType.TO_DO_LIST)).toBe('foo');
    });
  });

  describe('mapIncludedCategories', () => {
    it('returns mapped categories', () => {
      const items = [
        { id: 'id1', category: 'foo', name: 'a' },
        { id: 'id1', category: 'FOO', name: 'b' },
        { id: 'id1', category: 'Foo', name: 'c' },
        { id: 'id1', category: 'BAR', name: 'd' },
        { id: 'id1', category: 'bar', name: 'e' },
        { id: 'id1', category: 'Bar', name: 'f' },
        { id: 'id1', category: '', name: 'g' },
        { id: 'id1', category: undefined, name: 'h' },
      ];
      expect(mapIncludedCategories(items)).toStrictEqual(['', 'foo', 'bar']);
    });
  });

  describe('categorizeNotPurchasedItems', () => {
    it('returns categorized items', () => {
      const items = [
        { id: 'id1', category: 'foo', name: 'a' },
        { id: 'id1', category: 'FOO', name: 'b' },
        { id: 'id1', category: 'Foo', name: 'c' },
        { id: 'id1', category: 'BAR', name: 'd' },
        { id: 'id1', category: 'bar', name: 'e' },
        { id: 'id1', category: 'Bar', name: 'f' },
        { id: 'id1', category: '', name: 'g' },
        { id: 'id1', category: undefined, name: 'h' },
      ];
      const categories = ['', 'foo'];
      expect(categorizeNotPurchasedItems(items, categories)).toStrictEqual({
        foo: [
          { id: 'id1', category: 'foo', name: 'a' },
          { id: 'id1', category: 'FOO', name: 'b' },
          { id: 'id1', category: 'Foo', name: 'c' },
        ],
        bar: [
          { id: 'id1', category: 'BAR', name: 'd' },
          { id: 'id1', category: 'bar', name: 'e' },
          { id: 'id1', category: 'Bar', name: 'f' },
        ],
        '': [
          { id: 'id1', category: '', name: 'g' },
          { id: 'id1', category: undefined, name: 'h' },
        ],
      });
    });
  });

  describe('sortItems', () => {
    it('returns sorted items for BookList', () => {
      const items = [
        { id: 'id1', author: undefined, number_in_series: 1, title: 'foo' },
        { id: 'id1', author: 'foo', number_in_series: 1, title: 'bar' },
        { id: 'id1', author: 'bar', number_in_series: 2, title: 'baz' },
        { id: 'id1', author: 'bar', number_in_series: 1, title: 'foobar' },
        { id: 'id1', author: 'bar', number_in_series: undefined, title: 'foobaz' },
        { id: 'id1', author: 'bar', number_in_series: 1, title: 'bar' },
        { id: 'id1', author: '', number_in_series: undefined, title: 'foo' },
      ];
      expect(sortItems(EListType.BOOK_LIST, items)).toStrictEqual([
        { id: 'id1', author: 'bar', number_in_series: 1, title: 'bar' },
        { id: 'id1', author: 'bar', number_in_series: 1, title: 'foobar' },
        { id: 'id1', author: 'bar', number_in_series: 2, title: 'baz' },
        { id: 'id1', author: 'bar', number_in_series: undefined, title: 'foobaz' },
        { id: 'id1', author: 'foo', number_in_series: 1, title: 'bar' },
        { id: 'id1', author: undefined, number_in_series: 1, title: 'foo' },
        { id: 'id1', author: '', number_in_series: undefined, title: 'foo' },
      ]);
    });

    it('returns sorted items for GroceryList', () => {
      const items = [
        { id: 'id1', product: undefined, quantity: 'foo' },
        { id: 'id1', product: '', quantity: 'bar' },
        { id: 'id1', product: 'foo', quantity: undefined },
        { id: 'id1', product: 'foo', quantity: 'bar' },
        { id: 'id1', product: 'foo', quantity: 'foo' },
        { id: 'id1', product: 'bar', quantity: '' },
        { id: 'id1', product: undefined, quantity: 'baz' },
      ];
      expect(sortItems(EListType.GROCERY_LIST, items)).toStrictEqual([
        { id: 'id1', product: 'bar', quantity: '' },
        { id: 'id1', product: 'foo', quantity: undefined },
        { id: 'id1', product: 'foo', quantity: 'bar' },
        { id: 'id1', product: 'foo', quantity: 'foo' },
        { id: 'id1', product: undefined, quantity: 'foo' },
        { id: 'id1', product: '', quantity: 'bar' },
        { id: 'id1', product: undefined, quantity: 'baz' },
      ]);
    });

    it('returns sorted items for MusicList', () => {
      const items = [
        { id: 'id1', artist: undefined, album: 'bar', title: 'foo' },
        { id: 'id1', artist: 'foo', album: 'bar', title: 'bar' },
        { id: 'id1', artist: 'bar', album: 'foo', title: 'baz' },
        { id: 'id1', artist: 'bar', album: 'bar', title: 'foobar' },
        { id: 'id1', artist: 'bar', album: undefined, title: 'foobaz' },
        { id: 'id1', artist: 'bar', album: 'bar', title: 'bar' },
        { id: 'id1', artist: '', album: undefined, title: 'foo' },
      ];
      expect(sortItems(EListType.MUSIC_LIST, items)).toStrictEqual([
        { id: 'id1', artist: 'bar', album: 'bar', title: 'bar' },
        { id: 'id1', artist: 'bar', album: 'bar', title: 'foobar' },
        { id: 'id1', artist: 'bar', album: 'foo', title: 'baz' },
        { id: 'id1', artist: 'bar', album: undefined, title: 'foobaz' },
        { id: 'id1', artist: 'foo', album: 'bar', title: 'bar' },
        { id: 'id1', artist: undefined, album: 'bar', title: 'foo' },
        { id: 'id1', artist: '', album: undefined, title: 'foo' },
      ]);
    });

    it('returns sorted items for Simple list', () => {
      const items = [
        { id: 'id1', content: undefined },
        { id: 'id1', content: 'baz' },
        { id: 'id1', content: 'foo' },
        { id: 'id1', content: 'bar' },
        { id: 'id1', content: '' },
      ];
      expect(sortItems(EListType.SIMPLE_LIST, items)).toStrictEqual([
        { id: 'id1', content: 'bar' },
        { id: 'id1', content: 'baz' },
        { id: 'id1', content: 'foo' },
        { id: 'id1', content: undefined },
        { id: 'id1', content: '' },
      ]);
    });

    it('returns sorted items for ToDoList', () => {
      const items = [
        { id: 'id1', due_by: undefined, assignee_id: '1', task: 'foo' },
        { id: 'id1', due_by: '05/20/2020', assignee_id: '1', task: 'bar' },
        { id: 'id1', due_by: '05/19/2020', assignee_id: '2', task: 'baz' },
        { id: 'id1', due_by: '05/19/2020', assignee_id: '1', task: 'foobar' },
        { id: 'id1', due_by: '05/19/2020', assignee_id: undefined, task: 'foobaz' },
        { id: 'id1', due_by: '05/19/2020', assignee_id: '1', task: 'bar' },
        { id: 'id1', due_by: '', assignee_id: undefined, task: 'foo' },
      ];
      expect(sortItems(EListType.TO_DO_LIST, items)).toStrictEqual([
        { id: 'id1', due_by: '05/19/2020', assignee_id: '1', task: 'bar' },
        { id: 'id1', due_by: '05/19/2020', assignee_id: '1', task: 'foobar' },
        { id: 'id1', due_by: '05/19/2020', assignee_id: '2', task: 'baz' },
        { id: 'id1', due_by: '05/19/2020', assignee_id: undefined, task: 'foobaz' },
        { id: 'id1', due_by: '05/20/2020', assignee_id: '1', task: 'bar' },
        { id: 'id1', due_by: undefined, assignee_id: '1', task: 'foo' },
        { id: 'id1', due_by: '', assignee_id: undefined, task: 'foo' },
      ]);
    });
  });

  describe('fetchList', () => {
    const id = '1';
    const navigate = jest.fn();

    it('returns correct body on success', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          current_user_id: '1',
          not_purchased_items: [],
          purchased_items: [],
          list: {
            id: '1',
          },
          categories: [],
          list_users: [
            { id: '1', email: 'foo@example.com' },
            { id: '2', email: 'bar@example.com' },
          ],
          permissions: 'read',
          lists_to_update: [],
        },
      });

      expect(await fetchList({ id, navigate })).toStrictEqual({
        currentUserId: '1',
        list: { id: '1' },
        purchasedItems: [],
        categories: [],
        listUsers: [
          { id: '1', email: 'foo@example.com' },
          { id: '2', email: 'bar@example.com' },
        ],
        includedCategories: [''],
        notPurchasedItems: { '': [] },
        permissions: 'read',
        lists: [],
      });
    });

    it('redirects to /users/sign_in when 401', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

      await fetchList({ id, navigate });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to /lists when 403', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 403 } });

      await fetchList({ id, navigate });

      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('redirects to /lists when 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } });

      await fetchList({ id, navigate });

      expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/lists');
    });

    it('displays generic toast when status is not 401, 403, 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      await fetchList({ id, navigate });

      expect(toast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
    });

    it('throws when request fails', () => {
      axios.get = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      expect(fetchList({ id, navigate })).rejects.toThrow();
    });

    it('throws when unknown error occurs', () => {
      axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      expect(fetchList({ id, navigate })).rejects.toThrow();
    });
  });

  describe('fetchItemToEdit', () => {
    const listId = '1';
    const itemId = '1';
    const navigate = jest.fn();

    it('returns correct body on success', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          item: {
            id: '1',
            user_id: '1',
          },
          list: { id: '1', type: EListType.GROCERY_LIST },
          categories: [],
          list_users: [
            { id: '1', email: 'foo@example.com' },
            { id: '2', email: 'bar@example.com' },
          ],
        },
      });

      expect(await fetchItemToEdit({ itemId, listId, navigate })).toStrictEqual({
        listUsers: [
          { id: '1', email: 'foo@example.com' },
          { id: '2', email: 'bar@example.com' },
        ],
        userId: '1',
        list: {
          id: '1',
          type: EListType.GROCERY_LIST,
          categories: [],
        },
        item: {
          id: '1',
          user_id: '1',
        },
      });
    });

    it('redirects to /users/sign_in when 401', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

      await fetchItemToEdit({ itemId, listId, navigate });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to /lists when 403', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 403 } });

      await fetchItemToEdit({ itemId, listId, navigate });

      expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('redirects to /lists when 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } });

      await fetchItemToEdit({ itemId, listId, navigate });

      expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('displays generic toast when status is not 401, 403, 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      await fetchItemToEdit({ itemId, listId, navigate });

      expect(toast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
    });

    it('throws when request fails', () => {
      axios.get = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      expect(fetchItemToEdit({ itemId, listId, navigate })).rejects.toThrow();
    });

    it('throws when unknown error occurs', () => {
      axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      expect(fetchItemToEdit({ itemId, listId, navigate })).rejects.toThrow();
    });
  });

  describe('fetchItemsToEdit', () => {
    const listId = '1';
    const navigate = jest.fn();
    const search = '?item_ids=1,2';

    it('returns correct body on success', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          items: [
            {
              id: 1,
              user_id: 1,
            },
          ],
          list: { id: 1, type: EListType.GROCERY_LIST },
          categories: [],
          list_users: [
            { id: 1, email: 'foo@example.com' },
            { id: 2, email: 'bar@example.com' },
          ],
          lists: [{ id: 1, type: EListType.GROCERY_LIST, name: 'foobar' }],
        },
      });

      expect(await fetchItemsToEdit({ search, listId, navigate })).toStrictEqual({
        list_users: [
          { id: 1, email: 'foo@example.com' },
          { id: 2, email: 'bar@example.com' },
        ],
        list: { id: 1, type: EListType.GROCERY_LIST },
        items: [
          {
            id: 1,
            user_id: 1,
          },
        ],
        categories: [],
        lists: [{ id: 1, type: EListType.GROCERY_LIST, name: 'foobar' }],
      });
    });

    it('redirects to /users/sign_in when 401', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

      await fetchItemsToEdit({ search, listId, navigate });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to /lists when 403', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 403 } });

      await fetchItemsToEdit({ search, listId, navigate });

      expect(toast).toHaveBeenCalledWith('One or more items not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('redirects to /lists when 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } });

      await fetchItemsToEdit({ search, listId, navigate });

      expect(toast).toHaveBeenCalledWith('One or more items not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('throws when status is not 401, 403, 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      await fetchItemsToEdit({ search, listId, navigate });

      expect(toast).toHaveBeenCalledWith(
        'Something went wrong. Data may be incomplete and user actions may not persist.',
        { type: 'error' },
      );
    });

    it('throws when request fails', () => {
      axios.get = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      expect(fetchItemsToEdit({ search, listId, navigate })).rejects.toThrow();
    });

    it('throws when unknown error occurs', () => {
      axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      expect(fetchItemsToEdit({ search, listId, navigate })).rejects.toThrow();
    });
  });
});
