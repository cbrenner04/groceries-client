import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';
import type { IListItemField, IV2ListItem } from 'typings';
import {
  handleAddItem,
  handleItemSelect,
  handleItemEdit,
  handleItemComplete,
  handleItemDelete,
  handleItemRefresh,
} from './listHandlers';
import { handleFailure } from '../../../../utils/handleFailure';
import axios from '../../../../utils/api';

jest.mock('react-toastify', () => ({ toast: jest.fn() }));
jest.mock('immutability-helper', () => jest.requireActual('immutability-helper'));
jest.mock('../../../../utils/api', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockToast = toast as jest.MockedFunction<typeof toast>;
const mockAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
});

const mockNavigate = jest.fn();
const mockSet = jest.fn();
const mockSetPending = jest.fn();

// Helper to create a valid IListItemField
function makeField(overrides = {}): IListItemField {
  return {
    id: 'field1',
    list_item_field_configuration_id: 'config1',
    data: 'Fruit',
    archived_at: '',
    user_id: 'u',
    list_item_id: '1',
    created_at: '',
    updated_at: '',
    label: 'category',
    ...overrides,
  };
}

// Helper to create a valid IV2ListItem
function makeItem(overrides = {}): IV2ListItem {
  return {
    id: '1',
    completed: false,
    refreshed: false,
    user_id: 'u',
    list_id: 'l',
    created_at: '',
    updated_at: '',
    fields: [makeField()],
    ...overrides,
  };
}

// Helper to create a valid AxiosError
function makeAxiosError(status: number): AxiosError {
  return {
    config: { headers: {} },
    isAxiosError: true,
    toJSON: () => ({}),
    name: 'AxiosError',
    message: '',
    response: {
      status,
      statusText: '',
      headers: {},
      config: { headers: {} },
      data: {},
    },
  } as AxiosError;
}

const item = makeItem();

axios.put = jest.fn();
axios.delete = jest.fn();

// handleFailure

describe('handleFailure', () => {
  it('handles 401', () => {
    const error = makeAxiosError(401);
    expect(() => handleFailure({ error, notFoundMessage: 'not found', navigate: mockNavigate })).toThrow();
    expect(mockToast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });
  it('handles 403/404', () => {
    const error = makeAxiosError(404);
    expect(() => handleFailure({ error, notFoundMessage: 'not found', navigate: mockNavigate })).toThrow();
    expect(mockToast).toHaveBeenCalledWith('not found', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });
  it('handles other response', () => {
    const error = makeAxiosError(500);
    expect(() => handleFailure({ error, notFoundMessage: 'not found', navigate: mockNavigate })).toThrow();
    expect(mockToast).toHaveBeenCalledWith(expect.stringContaining('Something went wrong'), { type: 'error' });
  });
  it('handles error when error.response is undefined', () => {
    const error = { response: undefined } as AxiosError;
    expect(() => handleFailure({ error, notFoundMessage: 'not found', navigate: mockNavigate })).toThrow();
    // Should still throw an error even when response is undefined
  });
  it('handles error when error has no response property', () => {
    const error = {} as AxiosError;
    expect(() => handleFailure({ error, notFoundMessage: 'not found', navigate: mockNavigate })).toThrow();
    // Should still throw an error even when response property doesn't exist
  });
});

describe('handleAddItem', () => {
  it('adds to completed or notCompleted and new category', () => {
    const setCompleted = jest.fn();
    const setNotCompleted = jest.fn();
    const setCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: setNotCompleted,
      categories: [],
      setCategories,
    });
    expect(setNotCompleted).toHaveBeenCalled();
    handleAddItem({
      newItems: [{ ...item, completed: true }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: setNotCompleted,
      categories: [],
      setCategories,
    });
    expect(setCompleted).toHaveBeenCalled();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'category', data: 'NewCat' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: setNotCompleted,
      categories: [],
      setCategories,
    });
    expect(setCategories).toHaveBeenCalledWith(['NewCat']);
  });
  it('adds new category when item has category not in existing categories', () => {
    const setCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'category', data: 'BrandNewCategory' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: mockSet,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: ['ExistingCategory1', 'ExistingCategory2'],
      setCategories,
    });
    expect(setCategories).toHaveBeenCalledWith(['ExistingCategory1', 'ExistingCategory2', 'BrandNewCategory']);
  });
  it('does not add category when item category already exists in categories', () => {
    const setCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'category', data: 'ExistingCategory' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: mockSet,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: ['ExistingCategory', 'OtherCategory'],
      setCategories,
    });
    expect(setCategories).not.toHaveBeenCalled();
  });
  it('does not add category when item has no category field', () => {
    const setCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'name', data: 'Item Name' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: mockSet,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: ['ExistingCategory'],
      setCategories,
    });
    expect(setCategories).not.toHaveBeenCalled();
  });
  it('does not add category when item has empty category field', () => {
    const setCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'category', data: '' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: mockSet,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: ['ExistingCategory'],
      setCategories,
    });
    expect(setCategories).not.toHaveBeenCalled();
  });
  it('handles error', () => {
    const setCompletedItems = jest.fn(() => {
      throw new Error('fail');
    });
    handleAddItem({
      newItems: [{ ...item, completed: true }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: [],
      setCategories: mockSet,
    });
    expect(mockToast).toHaveBeenCalledWith('Failed to add item', { type: 'error' });
  });
});

describe('handleItemSelect', () => {
  it('selects and deselects', () => {
    const setSelected = jest.fn();
    handleItemSelect({ item, selectedItems: [], setSelectedItems: setSelected });
    expect(setSelected).toHaveBeenCalled();
    handleItemSelect({ item, selectedItems: [item], setSelectedItems: setSelected });
    expect(setSelected).toHaveBeenCalled();
  });
});

describe('handleItemEdit', () => {
  it('navigates to edit', () => {
    const nav = jest.fn();
    handleItemEdit({ item, listId: '1', navigate: nav });
    expect(nav).toHaveBeenCalledWith('/v2/lists/1/list_items/1/edit');
  });
});

describe('handleItemComplete', () => {
  it('completes item', async () => {
    const testItem = makeItem({ id: 'test-id' });
    const otherItem = makeItem({ id: 'other-id' });
    mockAxios.put.mockResolvedValueOnce({ data: { ...testItem, completed: true } });
    const setNotCompleted = jest.fn();
    const setCompleted = jest.fn();
    const setPending = jest.fn();

    await handleItemComplete({
      item: testItem,
      listId: '1',
      notCompletedItems: [testItem, otherItem],
      setNotCompletedItems: setNotCompleted,
      completedItems: [],
      setCompletedItems: setCompleted,
      setPending,
      handleFailure: jest.fn(),
    });

    expect(setNotCompleted).toHaveBeenCalled();
    expect(setCompleted).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item marked as completed.', { type: 'info' });
  });

  it('preserves original fields when API returns minimal response', async () => {
    const testItem = makeItem({ id: 'test-id' });
    const otherItem = makeItem({ id: 'other-id' });
    // API returns minimal response without fields
    mockAxios.put.mockResolvedValueOnce({ data: { id: 'test-id', completed: true } });
    const setNotCompleted = jest.fn();
    const setCompleted = jest.fn();
    const setPending = jest.fn();

    await handleItemComplete({
      item: testItem,
      listId: '1',
      notCompletedItems: [testItem, otherItem],
      setNotCompletedItems: setNotCompleted,
      completedItems: [],
      setCompletedItems: setCompleted,
      setPending,
      handleFailure: jest.fn(),
    });

    expect(setCompleted).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item marked as completed.', { type: 'info' });
  });

  it('handles error', async () => {
    mockAxios.put.mockRejectedValueOnce(new Error('fail'));
    const fail = jest.fn();
    const setPending = jest.fn();
    await handleItemComplete({
      item,
      listId: '1',
      notCompletedItems: [item],
      setNotCompletedItems: jest.fn(),
      completedItems: [],
      setCompletedItems: jest.fn(),
      setPending,
      handleFailure: fail,
    });
    expect(fail).toHaveBeenCalled();
  });
});

describe('handleItemDelete', () => {
  it('deletes item', async () => {
    const testItem = makeItem({ id: 'test-id' });
    const otherItem = makeItem({ id: 'other-id' });
    mockAxios.delete.mockResolvedValueOnce({});
    const setNotCompleted = jest.fn();
    const setSelected = jest.fn();
    const setPending = jest.fn();
    await handleItemDelete({
      item: testItem,
      listId: '1',
      completedItems: [],
      setCompletedItems: jest.fn(),
      notCompletedItems: [testItem, otherItem],
      setNotCompletedItems: setNotCompleted,
      selectedItems: [testItem, otherItem],
      setSelectedItems: setSelected,
      setPending,
      handleFailure: jest.fn(),
    });
    expect(setNotCompleted).toHaveBeenCalled();
    expect(setSelected).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item deleted successfully.', { type: 'info' });
  });

  it('deletes completed item', async () => {
    const testItem = makeItem({ id: 'test-id', completed: true });
    const otherItem = makeItem({ id: 'other-id', completed: true });
    mockAxios.delete.mockResolvedValueOnce({});
    const setCompleted = jest.fn();
    const setSelected = jest.fn();
    const setPending = jest.fn();
    await handleItemDelete({
      item: testItem,
      listId: '1',
      completedItems: [testItem, otherItem],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: jest.fn(),
      selectedItems: [testItem, otherItem],
      setSelectedItems: setSelected,
      setPending,
      handleFailure: jest.fn(),
    });
    expect(setCompleted).toHaveBeenCalled();
    expect(setSelected).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item deleted successfully.', { type: 'info' });
  });

  it('handles error', async () => {
    mockAxios.delete.mockRejectedValueOnce(new Error('fail'));
    const fail = jest.fn();
    const setPending = jest.fn();
    await handleItemDelete({
      item,
      listId: '1',
      completedItems: [],
      setCompletedItems: jest.fn(),
      notCompletedItems: [item],
      setNotCompletedItems: jest.fn(),
      selectedItems: [item],
      setSelectedItems: jest.fn(),
      setPending,
      handleFailure: fail,
    });
    expect(fail).toHaveBeenCalled();
  });
});

describe('handleItemRefresh', () => {
  it('refreshes item', async () => {
    const testItem = makeItem({ id: 'test-id' });
    const otherItem = makeItem({ id: 'other-id' });
    mockAxios.put.mockResolvedValueOnce({ data: { ...testItem, refreshed: true } });
    const setCompleted = jest.fn();
    const setNotCompleted = jest.fn();
    const setPending = jest.fn();
    await handleItemRefresh({
      item: testItem,
      listId: '1',
      completedItems: [testItem, otherItem],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: setNotCompleted,
      setPending,
      handleFailure: jest.fn(),
    });
    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item refreshed successfully.', { type: 'info' });
  });

  it('preserves original fields when API returns minimal response', async () => {
    const testItem = makeItem({ id: 'test-id' });
    const otherItem = makeItem({ id: 'other-id' });
    // API returns minimal response without fields
    mockAxios.put.mockResolvedValueOnce({ data: { id: 'test-id', refreshed: true, completed: false } });
    const setCompleted = jest.fn();
    const setNotCompleted = jest.fn();
    const setPending = jest.fn();
    await handleItemRefresh({
      item: testItem,
      listId: '1',
      completedItems: [testItem, otherItem],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: setNotCompleted,
      setPending,
      handleFailure: jest.fn(),
    });
    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item refreshed successfully.', { type: 'info' });
  });

  it('handles error', async () => {
    mockAxios.put.mockRejectedValueOnce(new Error('fail'));
    const fail = jest.fn();
    const setPending = jest.fn();
    await handleItemRefresh({
      item,
      listId: '1',
      completedItems: [item],
      setCompletedItems: jest.fn(),
      notCompletedItems: [],
      setNotCompletedItems: jest.fn(),
      setPending,
      handleFailure: fail,
    });
    expect(fail).toHaveBeenCalled();
  });
});
