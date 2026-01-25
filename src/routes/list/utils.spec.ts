import { AxiosError } from 'axios';

import {
  fetchList,
  fetchListToEdit,
  fetchListItemToEdit,
  fetchItemsToEdit,
  itemName,
  secondaryFieldsDisplay,
  type IFulfilledEditListData,
} from './utils';
import axios from 'utils/api';
import type { IListItem } from 'typings';
import { EListItemFieldType } from 'typings';
import {
  createList,
  createListItem,
  createField,
  createListItemConfiguration,
  createApiResponse,
} from 'test-utils/factories';
import { handleFailure } from '../../utils/handleFailure';

const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;

jest.mock('../../utils/handleFailure', () => ({
  handleFailure: jest.fn(),
}));

const mockNavigate = jest.fn();

// Helper to create mock error with status
const createError = (status: number): AxiosError => new AxiosError('Test error', String(status));

describe('itemName', () => {
  it('returns the primary field value', () => {
    const fields = [
      createField('1', 'quantity', '5', '1', { primary: false }),
      createField('2', 'product', 'Apples', '1', { primary: true }),
      createField('3', 'category', 'produce', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(itemName(item)).toBe('Apples');
  });

  it('falls back to first non-category field if no primary', () => {
    const fields = [
      createField('1', 'quantity', '5', '1'),
      createField('2', 'product', 'Apples', '1'),
      createField('3', 'category', 'produce', '1'),
    ];
    const item = createListItem('1', false, fields);
    expect(itemName(item)).toBe('5');
  });

  it('handles empty fields array', () => {
    const item = createListItem('1', false, []);
    expect(itemName(item)).toBe('');
  });

  it('handles only category fields', () => {
    const fields = [createField('1', 'category', 'Test Category', '1')];
    const item = createListItem('1', false, fields);
    expect(itemName(item)).toBe('');
  });

  it('handles null fields', () => {
    const item = {
      ...createListItem('1'),
      fields: null as unknown as IListItem['fields'],
    };
    expect(itemName(item)).toBe('');
  });

  it('handles undefined fields', () => {
    const item = {
      ...createListItem('1'),
      fields: undefined as unknown as IListItem['fields'],
    };
    expect(itemName(item)).toBe('');
  });

  it('returns empty string if primary field has no data', () => {
    const fields = [createField('1', 'product', '', '1', { primary: true })];
    const item = createListItem('1', false, fields);
    expect(itemName(item)).toBe('');
  });
});

describe('secondaryFieldsDisplay', () => {
  it('returns non-primary, non-category fields as label: value', () => {
    const fields = [
      createField('1', 'product', 'Apples', '1', { primary: true }),
      createField('2', 'quantity', '5 lbs', '1', { primary: false }),
      createField('3', 'category', 'produce', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toBe('quantity: 5 lbs');
  });

  it('joins multiple secondary fields with spaces', () => {
    const fields = [
      createField('1', 'title', 'The Great Gatsby', '1', { primary: true }),
      createField('2', 'author', 'F. Scott Fitzgerald', '1', { primary: false }),
      createField('3', 'year', '1925', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toBe('author: F. Scott Fitzgerald year: 1925');
  });

  it('excludes fields with empty data', () => {
    const fields = [
      createField('1', 'product', 'Apples', '1', { primary: true }),
      createField('2', 'quantity', '', '1', { primary: false }),
      createField('3', 'notes', 'organic', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toBe('notes: organic');
  });

  it('handles empty fields array', () => {
    const item = createListItem('1', false, []);
    expect(secondaryFieldsDisplay(item)).toBe('');
  });

  it('handles null fields', () => {
    const item = {
      ...createListItem('1'),
      fields: null as unknown as IListItem['fields'],
    };
    expect(secondaryFieldsDisplay(item)).toBe('');
  });

  it('shows boolean fields with true value', () => {
    const fields = [
      createField('1', 'title', 'Test Book', '1', { primary: true }),
      createField('2', 'read', 'true', '1', { primary: false, data_type: EListItemFieldType.BOOLEAN }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toBe('read: true');
  });

  it('excludes boolean fields with false value for cleaner display', () => {
    const fields = [
      createField('1', 'title', 'Test Book', '1', { primary: true }),
      createField('2', 'read', 'false', '1', { primary: false, data_type: EListItemFieldType.BOOLEAN }),
      createField('3', 'author', 'Test Author', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toBe('author: Test Author');
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

  it('trims trailing whitespace from categories', async () => {
    const notCompletedItems = [
      createListItem('id1', false, [createField('id1', 'category', 'foo  ', 'id1')]),
      createListItem('id2', false, [createField('id2', 'category', 'bar', 'id2')]),
    ];
    const mockData = createApiResponse(notCompletedItems, []);
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['foo', 'bar']);
  });

  it('deduplicates categories case-insensitively', async () => {
    const notCompletedItems = [
      createListItem('id1', false, [createField('id1', 'category', 'Produce', 'id1')]),
      createListItem('id2', false, [createField('id2', 'category', 'produce', 'id2')]),
    ];
    const mockData = createApiResponse(notCompletedItems, []);
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['Produce']);
  });

  it('ignores categories that are only whitespace', async () => {
    const notCompletedItems = [
      createListItem('id1', false, [createField('id1', 'category', '   ', 'id1')]),
      createListItem('id2', false, [createField('id2', 'category', 'bar', 'id2')]),
    ];
    const mockData = createApiResponse(notCompletedItems, []);
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['bar']);
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
      completed: false,
      refreshed: false,
      list_item_configuration_id: 'config-1',
      archived_at: null,
    };
    axios.get = jest.fn().mockResolvedValue({ data: mockData });
    const result = await fetchListToEdit({ id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
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
