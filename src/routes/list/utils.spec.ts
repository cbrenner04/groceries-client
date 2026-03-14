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

vi.mock('../../utils/handleFailure', () => ({
  handleFailure: vi.fn(),
}));

const mockNavigate = vi.fn();

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

  it('falls back to first non-primary field if no primary', () => {
    const fields = [createField('1', 'quantity', '5', '1'), createField('2', 'product', 'Apples', '1')];
    const item = createListItem('1', false, fields);
    expect(itemName(item)).toBe('5');
  });

  it('handles empty fields array', () => {
    const item = createListItem('1', false, []);
    expect(itemName(item)).toBe('');
  });

  it('handles no fields', () => {
    const fields: IListItem['fields'] = [];
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

  it('uses first primary field when multiple primary fields exist', () => {
    const fields = [
      createField('1', 'product', 'Apples', '1', { primary: true }),
      createField('2', 'name', 'Red Apples', '1', { primary: true }),
      createField('3', 'quantity', '5', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(itemName(item)).toBe('Apples');
  });

  it('falls back to first non-primary field when primary field has no data', () => {
    const fields = [
      createField('1', 'product', '', '1', { primary: true }),
      createField('2', 'quantity', '5', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(itemName(item)).toBe('5');
  });
});

describe('secondaryFieldsDisplay', () => {
  it('returns non-primary fields as array of label/value objects', () => {
    const fields = [
      createField('1', 'product', 'Apples', '1', { primary: true }),
      createField('2', 'quantity', '5 lbs', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toEqual([{ label: 'quantity', value: '5 lbs' }]);
  });

  it('returns multiple secondary fields as array', () => {
    const fields = [
      createField('1', 'title', 'The Great Gatsby', '1', { primary: true }),
      createField('2', 'author', 'F. Scott Fitzgerald', '1', { primary: false }),
      createField('3', 'year', '1925', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toEqual([
      { label: 'author', value: 'F. Scott Fitzgerald' },
      { label: 'year', value: '1925' },
    ]);
  });

  it('includes fields with empty data', () => {
    const fields = [
      createField('1', 'product', 'Apples', '1', { primary: true }),
      createField('2', 'quantity', null, '1', { primary: false }),
      createField('3', 'notes', 'organic', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toEqual([
      { label: 'quantity', value: '' },
      { label: 'notes', value: 'organic' },
    ]);
  });

  it('handles empty fields array', () => {
    const item = createListItem('1', false, []);
    expect(secondaryFieldsDisplay(item)).toEqual([]);
  });

  it('handles null fields', () => {
    const item = {
      ...createListItem('1'),
      fields: null as unknown as IListItem['fields'],
    };
    expect(secondaryFieldsDisplay(item)).toEqual([]);
  });

  it('shows boolean fields with true value', () => {
    const fields = [
      createField('1', 'title', 'Test Book', '1', { primary: true }),
      createField('2', 'read', 'true', '1', { primary: false, data_type: EListItemFieldType.BOOLEAN }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toEqual([{ label: 'read', value: 'true' }]);
  });

  it('formats date_time fields with prettyDueBy', () => {
    const fields = [
      createField('1', 'title', 'Test Task', '1', { primary: true }),
      createField('2', 'due by', '2025-09-15', '1', { primary: false, data_type: EListItemFieldType.DATE_TIME }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toEqual([{ label: 'due by', value: 'September 15, 2025' }]);
  });

  it('returns empty value for date_time fields with no data', () => {
    const fields = [
      createField('1', 'title', 'Test Task', '1', { primary: true }),
      createField('2', 'due by', null, '1', { primary: false, data_type: EListItemFieldType.DATE_TIME }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toEqual([{ label: 'due by', value: '' }]);
  });

  it('includes boolean fields with false value', () => {
    const fields = [
      createField('1', 'title', 'Test Book', '1', { primary: true }),
      createField('2', 'read', 'false', '1', { primary: false, data_type: EListItemFieldType.BOOLEAN }),
      createField('3', 'author', 'Test Author', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    expect(secondaryFieldsDisplay(item)).toEqual([
      { label: 'read', value: 'false' },
      { label: 'author', value: 'Test Author' },
    ]);
  });

  it('excludes fallback primary field (first non-primary) when no primary is set', () => {
    const fields = [createField('1', 'product', 'Apples', '1'), createField('2', 'quantity', '5 lbs', '1')];
    const item = createListItem('1', false, fields);
    // product is used as fallback primary, so it should not appear in secondary fields
    expect(secondaryFieldsDisplay(item)).toEqual([{ label: 'quantity', value: '5 lbs' }]);
  });

  it('excludes all primary fields when multiple primary fields exist', () => {
    const fields = [
      createField('1', 'product', 'Apples', '1', { primary: true }),
      createField('2', 'name', 'Red Apples', '1', { primary: true }),
      createField('3', 'quantity', '5 lbs', '1', { primary: false }),
      createField('4', 'notes', 'organic', '1', { primary: false }),
    ];
    const item = createListItem('1', false, fields);
    // Both primary fields should be excluded from secondary fields
    expect(secondaryFieldsDisplay(item)).toEqual([
      { label: 'quantity', value: '5 lbs' },
      { label: 'notes', value: 'organic' },
    ]);
  });

  it('handles no primary field and excludes fallback from secondary fields', () => {
    const fields = [
      createField('1', 'product', 'Apples', '1'),
      createField('2', 'quantity', '5 lbs', '1'),
      createField('3', 'notes', 'organic', '1'),
    ];
    const item = createListItem('1', false, fields);
    // product is used as fallback primary, so it should not appear in secondary fields
    expect(secondaryFieldsDisplay(item)).toEqual([
      { label: 'quantity', value: '5 lbs' },
      { label: 'notes', value: 'organic' },
    ]);
  });
});

describe('fetchList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data on success', async () => {
    const mockData = createApiResponse();
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles 401 error', async () => {
    const error = createError(401);
    axios.get = vi.fn().mockRejectedValue(error);
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
    axios.get = vi.fn().mockRejectedValue(error);
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
    axios.get = vi.fn().mockRejectedValue(error);
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
    axios.get = vi.fn().mockRejectedValue(error);
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
    axios.get = vi.fn().mockResolvedValue({ data: null });
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
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
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
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
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
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
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

  it('returns categories from API response', async () => {
    const mockData = createApiResponse();
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['foo', 'bar']);
  });
});

describe('fetchListToEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
    const result = await fetchListToEdit({ id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles missing data from server', async () => {
    const error = createError(404);
    axios.get = vi.fn().mockResolvedValue({ data: null });
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
    axios.get = vi.fn().mockResolvedValue({ data: null });
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
    axios.get = vi.fn().mockResolvedValue({ data: undefined });
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
    axios.get = vi.fn().mockRejectedValue(error);
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
    vi.clearAllMocks();
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
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
    const result = await fetchListItemToEdit({ list_id: '1', id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('handles missing data from server', async () => {
    const error = createError(404);
    axios.get = vi.fn().mockResolvedValue({ data: null });
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
    axios.get = vi.fn().mockResolvedValue({ data: null });
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
    axios.get = vi.fn().mockResolvedValue({ data: undefined });
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
    axios.get = vi.fn().mockRejectedValue(error);
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
    vi.clearAllMocks();
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
    axios.get = vi.fn().mockResolvedValue({ data: mockData });
    const result = await fetchItemsToEdit({ list_id: '1', search: '?q=test', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('throws AxiosError when data is null', async () => {
    axios.get = vi.fn().mockResolvedValue({ data: null });
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
    axios.get = vi.fn().mockResolvedValue({ data: undefined });
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
    axios.get = vi.fn().mockRejectedValue(error);
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
