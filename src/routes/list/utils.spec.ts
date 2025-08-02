import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

import {
  fetchList,
  fetchListToEdit,
  fetchListItemToEdit,
  fetchItemsToEdit,
  itemName,
  type IFulfilledEditListData,
} from './utils';
import axios from 'utils/api';
import { EListType } from 'typings';
import type { IListItem } from 'typings';
import {
  createList,
  createListItem,
  createField,
  createListItemConfiguration,
  createApiResponse,
} from 'test-utils/factories';
import { handleFailure } from '../../utils/handleFailure';

const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;

jest.mock('react-toastify');
jest.mock('../../utils/handleFailure', () => ({
  handleFailure: jest.fn(),
}));

const mockNavigate = jest.fn();

// Helper to create mock error with status
const createError = (status: number): AxiosError => new AxiosError('Test error', String(status));

describe('itemName', () => {
  const createMockItem = (fields: { label: string; data: string }[]): IListItem => {
    const mappedFields = fields.map((field, index) => createField(`field-${index}`, field.label, field.data, '1'));
    return createListItem('1', false, mappedFields);
  };

  describe('BOOK_LIST', () => {
    it('returns formatted title and author', () => {
      const item = createMockItem([
        { label: 'title', data: 'The Great Gatsby' },
        { label: 'author', data: 'F. Scott Fitzgerald' },
      ]);
      expect(itemName(item, EListType.BOOK_LIST)).toBe('"The Great Gatsby" F. Scott Fitzgerald');
    });

    it('handles missing title', () => {
      const item = createMockItem([{ label: 'author', data: 'F. Scott Fitzgerald' }]);
      expect(itemName(item, EListType.BOOK_LIST)).toBe('F. Scott Fitzgerald');
    });

    it('handles missing author', () => {
      const item = createMockItem([{ label: 'title', data: 'The Great Gatsby' }]);
      expect(itemName(item, EListType.BOOK_LIST)).toBe('"The Great Gatsby"');
    });

    it('handles empty fields', () => {
      const item = createMockItem([]);
      expect(itemName(item, EListType.BOOK_LIST)).toBe('');
    });
  });

  describe('GROCERY_LIST', () => {
    it('returns formatted quantity and product', () => {
      const item = createMockItem([
        { label: 'quantity', data: '2' },
        { label: 'product', data: 'Apples' },
      ]);
      expect(itemName(item, EListType.GROCERY_LIST)).toBe('2 Apples');
    });

    it('handles missing quantity', () => {
      const item = createMockItem([{ label: 'product', data: 'Apples' }]);
      expect(itemName(item, EListType.GROCERY_LIST)).toBe('Apples');
    });

    it('handles missing product', () => {
      const item = createMockItem([{ label: 'quantity', data: '2' }]);
      expect(itemName(item, EListType.GROCERY_LIST)).toBe('2');
    });

    it('handles empty fields', () => {
      const item = createMockItem([]);
      expect(itemName(item, EListType.GROCERY_LIST)).toBe('');
    });
  });

  describe('MUSIC_LIST', () => {
    it('returns formatted title, artist, and album', () => {
      const item = createMockItem([
        { label: 'title', data: 'Bohemian Rhapsody' },
        { label: 'artist', data: 'Queen' },
        { label: 'album', data: 'A Night at the Opera' },
      ]);
      expect(itemName(item, EListType.MUSIC_LIST)).toBe('"Bohemian Rhapsody" Queen - A Night at the Opera');
    });

    it('handles missing title', () => {
      const item = createMockItem([
        { label: 'artist', data: 'Queen' },
        { label: 'album', data: 'A Night at the Opera' },
      ]);
      expect(itemName(item, EListType.MUSIC_LIST)).toBe('Queen - A Night at the Opera');
    });

    it('handles missing artist', () => {
      const item = createMockItem([
        { label: 'title', data: 'Bohemian Rhapsody' },
        { label: 'album', data: 'A Night at the Opera' },
      ]);
      expect(itemName(item, EListType.MUSIC_LIST)).toBe('"Bohemian Rhapsody" A Night at the Opera');
    });

    it('handles missing album', () => {
      const item = createMockItem([
        { label: 'title', data: 'Bohemian Rhapsody' },
        { label: 'artist', data: 'Queen' },
      ]);
      expect(itemName(item, EListType.MUSIC_LIST)).toBe('"Bohemian Rhapsody" Queen');
    });

    it('handles empty fields', () => {
      const item = createMockItem([]);
      expect(itemName(item, EListType.MUSIC_LIST)).toBe('');
    });
  });

  describe('SIMPLE_LIST', () => {
    it('returns content field value', () => {
      const item = createMockItem([{ label: 'content', data: 'Buy groceries' }]);
      expect(itemName(item, EListType.SIMPLE_LIST)).toBe('Buy groceries');
    });

    it('handles missing content', () => {
      const item = createMockItem([]);
      expect(itemName(item, EListType.SIMPLE_LIST)).toBe('');
    });
  });

  describe('TO_DO_LIST', () => {
    it('returns task with assignee and due date', () => {
      const item = createMockItem([
        { label: 'task', data: 'Complete project' },
        { label: 'assignee_email', data: 'john@example.com' },
        { label: 'due_by', data: '2024-01-15' },
      ]);
      expect(itemName(item, EListType.TO_DO_LIST)).toBe(
        'Complete project\nAssigned To: john@example.com Due By: January 15, 2024',
      );
    });

    it('returns task without assignee or due date when not present', () => {
      const item = createMockItem([{ label: 'task', data: 'Complete project' }]);
      expect(itemName(item, EListType.TO_DO_LIST)).toBe('Complete project');
    });

    it('returns task without assignee when not present', () => {
      const item = createMockItem([
        { label: 'task', data: 'Complete project' },
        { label: 'due_by', data: '2024-01-15' },
      ]);
      expect(itemName(item, EListType.TO_DO_LIST)).toBe('Complete project\nDue By: January 15, 2024');
    });

    it('returns task without due date when due_by is not present', () => {
      const item = createMockItem([
        { label: 'task', data: 'Complete project' },
        { label: 'assignee_email', data: 'john@example.com' },
      ]);
      expect(itemName(item, EListType.TO_DO_LIST)).toBe('Complete project\nAssigned To: john@example.com');
    });

    it('handles missing task', () => {
      const item = createMockItem([]);
      expect(itemName(item, EListType.TO_DO_LIST)).toBe('');
    });
  });

  describe('default case', () => {
    it('returns all field data joined with spaces', () => {
      const item = createMockItem([
        { label: 'field1', data: 'value1' },
        { label: 'field2', data: 'value2' },
        { label: 'field3', data: 'value3' },
      ]);
      expect(itemName(item, 'UNKNOWN_TYPE' as EListType)).toBe('value1 value2 value3');
    });

    it('handles empty fields', () => {
      const item = createMockItem([]);
      expect(itemName(item, 'UNKNOWN_TYPE' as EListType)).toBe('');
    });
  });

  describe('edge cases', () => {
    it('handles null fields', () => {
      const item = {
        ...createListItem('1'),
        fields: null as unknown as IListItem['fields'],
      };
      expect(itemName(item, EListType.SIMPLE_LIST)).toBe('');
    });

    it('handles undefined fields', () => {
      const item = {
        ...createListItem('1'),
        fields: undefined as unknown as IListItem['fields'],
      };
      expect(itemName(item, EListType.SIMPLE_LIST)).toBe('');
    });

    it('handles fields with null data', () => {
      const item = createMockItem([
        { label: 'content', data: null as unknown as string },
        { label: 'task', data: 'Valid task' },
      ]);
      expect(itemName(item, EListType.TO_DO_LIST)).toBe('Valid task');
    });
  });
});

describe('fetchList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data on success', async () => {
    const mockData = createApiResponse();
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(toast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles 401 error', async () => {
    const error = createError(401);
    axios.get = jest.fn().mockRejectedValue(error);
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('handles 403 error', async () => {
    const error = createError(403);
    axios.get = jest.fn().mockRejectedValue(error);
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('handles 404 error', async () => {
    const error = createError(404);
    axios.get = jest.fn().mockRejectedValue(error);
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('handles generic error', async () => {
    const error = createError(500);
    axios.get = jest.fn().mockRejectedValue(error);
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('handles missing data from server', async () => {
    const error = createError(404);
    axios.get = jest.fn().mockResolvedValue({ data: null });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('handles invalid data structure - missing list', async () => {
    const error = createError(500);
    const { list, ...mockData } = createApiResponse();
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('handles invalid data structure - missing not_completed_items', async () => {
    const error = createError(500);
    const { not_completed_items: notCompletedItems, ...mockData } = createApiResponse();
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('handles invalid data structure - missing completed_items', async () => {
    const error = createError(500);
    const { completed_items: completedItems, ...mockData } = createApiResponse();
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      rethrow: true,
    });
  });

  it('extracts categories from items with category fields', async () => {
    const mockData = createApiResponse();
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['foo', 'bar']);
  });

  it('deduplicates categories from items', async () => {
    const mockData = createApiResponse();
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['foo', 'bar']);
  });
});

describe('fetchListToEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data on success', async () => {
    const mockData: IFulfilledEditListData = {
      id: '1',
      name: 'Test List',
      type: EListType.GROCERY_LIST,
      completed: false,
      refreshed: false,
      list_item_configuration_id: null,
      archived_at: null,
    };
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchListToEdit({ id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(toast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles missing data from server', async () => {
    const error = createError(404);
    axios.get = jest.fn().mockResolvedValue({ data: null });
    const result = await fetchListToEdit({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      // rethrow: true,
    });
  });

  it('throws AxiosError when data is null', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: null });
    const result = await fetchListToEdit({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: expect.any(AxiosError),
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
    const callArgs = mockHandleFailure.mock.calls[0][0];
    expect(callArgs.error).toBeInstanceOf(AxiosError);
  });

  it('throws AxiosError when data is undefined', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: undefined });
    const result = await fetchListToEdit({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: expect.any(AxiosError),
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
    const callArgs = mockHandleFailure.mock.calls[0][0];
    expect(callArgs.error).toBeInstanceOf(AxiosError);
  });

  it('handles error from server', async () => {
    const error = createError(500);
    axios.get = jest.fn().mockRejectedValue(error);
    const result = await fetchListToEdit({ id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
      // rethrow: true,
    });
  });
});

describe('fetchListItemToEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data on success', async () => {
    const mockData = {
      id: '1',
      item: createListItem('1'),
      list: createList(),
      list_users: [],
      list_item_configuration: createListItemConfiguration(),
      list_item_field_configurations: [],
    };
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchListItemToEdit({ list_id: '1', id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(toast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles missing data from server', async () => {
    const error = createError(404);
    axios.get = jest.fn().mockResolvedValue({ data: null });
    const result = await fetchListItemToEdit({ list_id: '1', id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List item not found',
      navigate: mockNavigate,
      redirectURI: '/lists/1/',
      // rethrow: true,
    });
  });

  it('throws AxiosError when data is null', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: null });
    const result = await fetchListItemToEdit({ list_id: '1', id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: expect.any(AxiosError),
      notFoundMessage: 'List item not found',
      navigate: mockNavigate,
      redirectURI: '/lists/1/',
    });
    const callArgs = mockHandleFailure.mock.calls[0][0];
    expect(callArgs.error).toBeInstanceOf(AxiosError);
  });

  it('throws AxiosError when data is undefined', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: undefined });
    const result = await fetchListItemToEdit({ list_id: '1', id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: expect.any(AxiosError),
      notFoundMessage: 'List item not found',
      navigate: mockNavigate,
      redirectURI: '/lists/1/',
    });
    const callArgs = mockHandleFailure.mock.calls[0][0];
    expect(callArgs.error).toBeInstanceOf(AxiosError);
  });

  it('handles error from server', async () => {
    const error = createError(500);
    axios.get = jest.fn().mockRejectedValue(error);
    const result = await fetchListItemToEdit({ list_id: '1', id: '1', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'List item not found',
      navigate: mockNavigate,
      redirectURI: '/lists/1/',
      // rethrow: true,
    });
  });
});

describe('fetchItemsToEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data on success', async () => {
    const mockData = {
      list: createList(),
      lists: [createList()],
      items: [createListItem('1')],
      categories: ['category1'],
      list_users: [],
      list_item_configuration: createListItemConfiguration(),
      list_item_field_configurations: [],
    };
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchItemsToEdit({ list_id: '1', search: '?q=test', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(toast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('throws AxiosError when data is null', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: null });
    const result = await fetchItemsToEdit({ list_id: '1', search: '?q=test', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: expect.any(AxiosError),
      notFoundMessage: 'One or more items not found',
      navigate: mockNavigate,
      redirectURI: '/lists/1/',
    });
    const callArgs = mockHandleFailure.mock.calls[0][0];
    expect(callArgs.error).toBeInstanceOf(AxiosError);
  });

  it('throws AxiosError when data is undefined', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: undefined });
    const result = await fetchItemsToEdit({ list_id: '1', search: '?q=test', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: expect.any(AxiosError),
      notFoundMessage: 'One or more items not found',
      navigate: mockNavigate,
      redirectURI: '/lists/1/',
    });
    const callArgs = mockHandleFailure.mock.calls[0][0];
    expect(callArgs.error).toBeInstanceOf(AxiosError);
  });

  it('handles error from server', async () => {
    const error = createError(500);
    axios.get = jest.fn().mockRejectedValue(error);
    const result = await fetchItemsToEdit({ list_id: '1', search: '?q=test', navigate: mockNavigate });
    expect(result).toBeUndefined();
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'One or more items not found',
      navigate: mockNavigate,
      redirectURI: '/lists/1/',
    });
  });
});
