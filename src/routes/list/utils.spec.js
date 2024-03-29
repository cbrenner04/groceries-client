import { toast } from 'react-toastify';

import {
  itemName,
  mapIncludedCategories,
  categorizeNotPurchasedItems,
  sortItems,
  fetchList,
  fetchItemToEdit,
  fetchItemsToEdit,
} from './utils';
import axios from '../../utils/api';
import { formatDueBy } from '../../utils/format';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('utils', () => {
  describe('itemName', () => {
    it('returns correct title', () => {
      expect(itemName({ title: 'foo', author: 'bar' }, 'BookList')).toBe('"foo" bar');
      expect(itemName({ title: 'foo' }, 'BookList')).toBe('"foo"');
      expect(itemName({ author: 'foo' }, 'BookList')).toBe('foo');
      expect(itemName({ quantity: 'foo', product: 'bar' }, 'GroceryList')).toBe('foo bar');
      expect(itemName({ quantity: 'foo' }, 'GroceryList')).toBe('foo');
      expect(itemName({ product: 'foo' }, 'GroceryList')).toBe('foo');
      expect(itemName({ title: 'foo', artist: 'bar', album: 'baz' }, 'MusicList')).toBe('"foo" bar - baz');
      expect(itemName({ title: 'foo', artist: 'bar' }, 'MusicList')).toBe('"foo" bar');
      expect(itemName({ artist: 'foo', album: 'bar' }, 'MusicList')).toBe('foo - bar');
      expect(itemName({ title: 'foo', album: 'bar' }, 'MusicList')).toBe('"foo" bar');
      expect(itemName({ title: 'foo' }, 'MusicList')).toBe('"foo"');
      expect(itemName({ album: 'foo' }, 'MusicList')).toBe('foo');
      expect(itemName({ artist: 'foo' }, 'MusicList')).toBe('foo');
      expect(itemName({ content: 'foo' }, 'SimpleList')).toBe('foo');
      expect(itemName({ task: 'foo' }, 'ToDoList')).toBe('foo');
    });
  });

  describe('mapIncludedCategories', () => {
    it('returns mapped categories', () => {
      const items = [
        { category: 'foo', name: 'a' },
        { category: 'FOO', name: 'b' },
        { category: 'Foo', name: 'c' },
        { category: 'BAR', name: 'd' },
        { category: 'bar', name: 'e' },
        { category: 'Bar', name: 'f' },
        { category: '', name: 'g' },
        { category: undefined, name: 'h' },
        { category: null, name: 'i' },
      ];
      expect(mapIncludedCategories(items)).toStrictEqual(['', 'foo', 'bar']);
    });
  });

  describe('categorizeNotPurchasedItems', () => {
    it('returns categorized items', () => {
      const items = [
        { category: 'foo', name: 'a' },
        { category: 'FOO', name: 'b' },
        { category: 'Foo', name: 'c' },
        { category: 'BAR', name: 'd' },
        { category: 'bar', name: 'e' },
        { category: 'Bar', name: 'f' },
        { category: '', name: 'g' },
        { category: undefined, name: 'h' },
        { category: null, name: 'i' },
      ];
      const categories = ['', 'foo'];
      expect(categorizeNotPurchasedItems(items, categories)).toStrictEqual({
        foo: [
          { category: 'foo', name: 'a' },
          { category: 'FOO', name: 'b' },
          { category: 'Foo', name: 'c' },
        ],
        bar: [
          { category: 'BAR', name: 'd' },
          { category: 'bar', name: 'e' },
          { category: 'Bar', name: 'f' },
        ],
        '': [
          { category: '', name: 'g' },
          { category: undefined, name: 'h' },
          { category: null, name: 'i' },
        ],
      });
    });
  });

  describe('sortItems', () => {
    it('returns sorted items for BookList', () => {
      const items = [
        { author: null, number_in_series: 1, title: 'foo' },
        { author: 'foo', number_in_series: 1, title: 'bar' },
        { author: 'bar', number_in_series: 2, title: 'baz' },
        { author: 'bar', number_in_series: 1, title: 'foobar' },
        { author: 'bar', number_in_series: null, title: 'foobaz' },
        { author: 'bar', number_in_series: 1, title: 'bar' },
        { author: '', number_in_series: null, title: 'foo' },
      ];
      expect(sortItems('BookList', items)).toStrictEqual([
        { author: '', number_in_series: null, title: 'foo' },
        { author: 'bar', number_in_series: 1, title: 'bar' },
        { author: 'bar', number_in_series: 1, title: 'foobar' },
        { author: 'bar', number_in_series: 2, title: 'baz' },
        { author: 'bar', number_in_series: null, title: 'foobaz' },
        { author: 'foo', number_in_series: 1, title: 'bar' },
        { author: null, number_in_series: 1, title: 'foo' },
      ]);
    });

    it('returns sorted items for GroceryList', () => {
      const items = [
        { product: null, quantity: 'foo' },
        { product: '', quantity: 'bar' },
        { product: 'foo', quantity: null },
        { product: 'foo', quantity: 'bar' },
        { product: 'foo', quantity: 'foo' },
        { product: 'bar', quantity: '' },
        { product: null, quantity: 'baz' },
      ];
      expect(sortItems('GroceryList', items)).toStrictEqual([
        { product: '', quantity: 'bar' },
        { product: 'bar', quantity: '' },
        { product: 'foo', quantity: null },
        { product: 'foo', quantity: 'bar' },
        { product: 'foo', quantity: 'foo' },
        { product: null, quantity: 'foo' },
        { product: null, quantity: 'baz' },
      ]);
    });

    it('returns sorted items for MusicList', () => {
      const items = [
        { artist: null, album: 'bar', title: 'foo' },
        { artist: 'foo', album: 'bar', title: 'bar' },
        { artist: 'bar', album: 'foo', title: 'baz' },
        { artist: 'bar', album: 'bar', title: 'foobar' },
        { artist: 'bar', album: null, title: 'foobaz' },
        { artist: 'bar', album: 'bar', title: 'bar' },
        { artist: '', album: null, title: 'foo' },
      ];
      expect(sortItems('MusicList', items)).toStrictEqual([
        { artist: '', album: null, title: 'foo' },
        { artist: 'bar', album: 'bar', title: 'bar' },
        { artist: 'bar', album: 'bar', title: 'foobar' },
        { artist: 'bar', album: 'foo', title: 'baz' },
        { artist: 'bar', album: null, title: 'foobaz' },
        { artist: 'foo', album: 'bar', title: 'bar' },
        { artist: null, album: 'bar', title: 'foo' },
      ]);
    });

    it('returns sorted items for ToDoList', () => {
      const items = [
        { due_by: null, assignee_id: 1, task: 'foo' },
        { due_by: new Date('05/20/2020'), assignee_id: 1, task: 'bar' },
        { due_by: new Date('05/19/2020'), assignee_id: 2, task: 'baz' },
        { due_by: new Date('05/19/2020'), assignee_id: 1, task: 'foobar' },
        { due_by: new Date('05/19/2020'), assignee_id: null, task: 'foobaz' },
        { due_by: new Date('05/19/2020'), assignee_id: 1, task: 'bar' },
        { due_by: '', assignee_id: null, task: 'foo' },
      ];
      expect(sortItems('ToDoList', items)).toStrictEqual([
        { due_by: '', assignee_id: null, task: 'foo' },
        { due_by: new Date('05/19/2020'), assignee_id: 1, task: 'bar' },
        { due_by: new Date('05/19/2020'), assignee_id: 1, task: 'foobar' },
        { due_by: new Date('05/19/2020'), assignee_id: 2, task: 'baz' },
        { due_by: new Date('05/19/2020'), assignee_id: null, task: 'foobaz' },
        { due_by: new Date('05/20/2020'), assignee_id: 1, task: 'bar' },
        { due_by: null, assignee_id: 1, task: 'foo' },
      ]);
    });
  });

  describe('fetchList', () => {
    const id = 1;
    const navigate = jest.fn();

    it('returns correct body on success', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          current_user_id: 1,
          not_purchased_items: [],
          purchased_items: [],
          list: {
            id: 1,
          },
          categories: [],
          list_users: [
            { id: 1, email: 'foo@example.com' },
            { id: 2, email: 'bar@example.com' },
          ],
          permissions: 'read',
        },
      });

      expect(await fetchList({ id, navigate })).toStrictEqual({
        currentUserId: 1,
        list: { id: 1 },
        purchasedItems: [],
        categories: [],
        listUsers: [
          { id: 1, email: 'foo@example.com' },
          { id: 2, email: 'bar@example.com' },
        ],
        includedCategories: [''],
        notPurchasedItems: { '': [] },
        permissions: 'read',
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

    it('throws when status is not 401, 403, 404', () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      expect(fetchList({ id, navigate })).rejects.toThrow();
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
    const listId = 1;
    const itemId = 1;
    const itemType = 'grocery_list_items';
    const navigate = jest.fn();

    it('returns correct body on success', async () => {
      axios.get = jest.fn().mockResolvedValue({
        data: {
          item: {
            id: 1,
            user_id: 1,
          },
          list: { id: 1, type: 'GroceryList' },
          categories: [],
          list_users: [
            { id: 1, email: 'foo@example.com' },
            { id: 2, email: 'bar@example.com' },
          ],
        },
      });

      expect(await fetchItemToEdit({ itemId, listId, itemType, navigate })).toStrictEqual({
        listUsers: [
          { id: 1, email: 'foo@example.com' },
          { id: 2, email: 'bar@example.com' },
        ],
        userId: 1,
        list: {
          id: 1,
          type: 'GroceryList',
          categories: [],
        },
        item: {
          id: 1,
          product: '',
          task: '',
          content: '',
          purchased: false,
          quantity: '',
          completed: false,
          author: '',
          title: '',
          read: false,
          artist: '',
          dueBy: formatDueBy(),
          assigneeId: '',
          album: '',
          numberInSeries: 0,
          category: '',
        },
      });
    });

    it('redirects to /users/sign_in when 401', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

      await fetchItemToEdit({ itemId, listId, itemType, navigate });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to /lists when 403', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 403 } });

      await fetchItemToEdit({ itemId, listId, itemType, navigate });

      expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('redirects to /lists when 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } });

      await fetchItemToEdit({ itemId, listId, itemType, navigate });

      expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('throws when status is not 401, 403, 404', () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      expect(fetchItemToEdit({ itemId, listId, itemType, navigate })).rejects.toThrow();
    });

    it('throws when request fails', () => {
      axios.get = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      expect(fetchItemToEdit({ itemId, listId, itemType, navigate })).rejects.toThrow();
    });

    it('throws when unknown error occurs', () => {
      axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      expect(fetchItemToEdit({ itemId, listId, itemType, navigate })).rejects.toThrow();
    });
  });

  describe('fetchItemsToEdit', () => {
    const listId = 1;
    const itemType = 'grocery_list_items';
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
          list: { id: 1, type: 'GroceryList' },
          categories: [],
          list_users: [
            { id: 1, email: 'foo@example.com' },
            { id: 2, email: 'bar@example.com' },
          ],
          lists: [{ id: 1, type: 'GroceryList', name: 'foobar' }],
        },
      });

      expect(await fetchItemsToEdit({ search, listId, itemType, navigate })).toStrictEqual({
        list_users: [
          { id: 1, email: 'foo@example.com' },
          { id: 2, email: 'bar@example.com' },
        ],
        list: { id: 1, type: 'GroceryList' },
        items: [
          {
            id: 1,
            user_id: 1,
          },
        ],
        categories: [],
        lists: [{ id: 1, type: 'GroceryList', name: 'foobar' }],
      });
    });

    it('redirects to /users/sign_in when 401', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 401 } });

      await fetchItemsToEdit({ search, listId, itemType, navigate });

      expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith('/users/sign_in');
    });

    it('redirects to /lists when 403', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 403 } });

      await fetchItemsToEdit({ search, listId, itemType, navigate });

      expect(toast).toHaveBeenCalledWith('One or more items not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('redirects to /lists when 404', async () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 404 } });

      await fetchItemsToEdit({ search, listId, itemType, navigate });

      expect(toast).toHaveBeenCalledWith('One or more items not found', { type: 'error' });
      expect(navigate).toHaveBeenCalledWith(`/lists/${listId}`);
    });

    it('throws when status is not 401, 403, 404', () => {
      axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });

      expect(fetchItemsToEdit({ search, listId, itemType, navigate })).rejects.toThrow();
    });

    it('throws when request fails', () => {
      axios.get = jest.fn().mockRejectedValue({ request: 'failed to send request' });

      expect(fetchItemsToEdit({ search, listId, itemType, navigate })).rejects.toThrow();
    });

    it('throws when unknown error occurs', () => {
      axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });

      expect(fetchItemsToEdit({ search, listId, itemType, navigate })).rejects.toThrow();
    });
  });
});
