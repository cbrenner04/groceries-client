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
  handleToggleRead,
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
    post: jest.fn(),
  },
}));
jest.mock('../../../../utils/handleFailure');

const mockToast = toast as jest.MockedFunction<typeof toast>;
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;
const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

const mockSet = jest.fn();
const mockSetPending = jest.fn();

// Helper to create a valid IListItemField
function makeField(overrides: Partial<IListItemField> = {}): IListItemField {
  return {
    id: 'field1',
    list_item_field_configuration_id: 'config1',
    data: 'Fruit',
    archived_at: null,
    user_id: 'u',
    list_item_id: '1',
    created_at: new Date().toISOString(),
    updated_at: null,
    label: 'category',
    position: overrides.position ?? 0,
    data_type: overrides.data_type ?? 'free_text',
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
    created_at: new Date().toISOString(),
    updated_at: null,
    archived_at: null,
    fields: [makeField()],
    ...overrides,
  };
}

const item = makeItem();

axios.put = jest.fn();
axios.delete = jest.fn();

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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
    });
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error: expect.any(Error),
      notFoundMessage: 'Failed to add item',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
  });
  it('updates included categories when setIncludedCategories is provided', () => {
    const setCategories = jest.fn();
    const setIncludedCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'category', data: 'NewCategory' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: mockSet,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: ['ExistingCategory'],
      setCategories,
      setIncludedCategories,
      navigate: mockNavigate,
    });
    expect(setIncludedCategories).toHaveBeenCalledWith(['ExistingCategory', 'NewCategory']);
  });
  it('updates displayed categories when setDisplayedCategories is provided and no filter is active', () => {
    const setCategories = jest.fn();
    const setDisplayedCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'category', data: 'NewCategory' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: mockSet,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: ['ExistingCategory'],
      setCategories,
      setDisplayedCategories,
      navigate: mockNavigate,
    });
    expect(setDisplayedCategories).toHaveBeenCalledWith(['ExistingCategory', 'NewCategory']);
  });
  it('does not update displayed categories when filter is active', () => {
    const setCategories = jest.fn();
    const setDisplayedCategories = jest.fn();
    handleAddItem({
      newItems: [{ ...item, completed: false, fields: [makeField({ label: 'category', data: 'NewCategory' })] }],
      pending: false,
      setPending: mockSetPending,
      completedItems: [],
      setCompletedItems: mockSet,
      notCompletedItems: [],
      setNotCompletedItems: mockSet,
      categories: ['ExistingCategory'],
      setCategories,
      setDisplayedCategories,
      filter: 'SomeFilter',
      navigate: mockNavigate,
    });
    expect(setDisplayedCategories).not.toHaveBeenCalled();
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
    });

    expect(setCompleted).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item marked as completed.', { type: 'info' });
  });

  it('handles error', async () => {
    const error = new Error('fail') as AxiosError;
    mockAxios.put.mockRejectedValueOnce(error);
    const setPending = jest.fn();
    await handleItemComplete({
      item,
      listId: '1',
      notCompletedItems: [item],
      setNotCompletedItems: jest.fn(),
      completedItems: [],
      setCompletedItems: jest.fn(),
      setPending,
      navigate: mockNavigate,
    });
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'Failed to complete item',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
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
      navigate: mockNavigate,
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
      navigate: mockNavigate,
    });
    expect(setCompleted).toHaveBeenCalled();
    expect(setSelected).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item deleted successfully.', { type: 'info' });
  });

  it('handles error', async () => {
    const error = new Error('fail') as AxiosError;
    mockAxios.delete.mockRejectedValueOnce(error);
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
      navigate: mockNavigate,
    });
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'Failed to delete item',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
  });

  it('does not show toast when showToast is false', async () => {
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
      navigate: mockNavigate,
      showToast: false,
    });
    expect(setNotCompleted).toHaveBeenCalled();
    expect(setSelected).toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });
});

describe('handleItemRefresh', () => {
  it('refreshes item', async () => {
    const testItem = makeItem({ id: 'test-id' });
    const otherItem = makeItem({ id: 'other-id' });
    mockAxios.put.mockResolvedValueOnce({ data: { ...testItem, refreshed: true } });
    mockAxios.post.mockResolvedValueOnce({ data: { ...testItem, completed: false } });
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
    mockAxios.post.mockResolvedValueOnce({ data: { id: 'test-id', completed: false } });
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
    });
    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item refreshed successfully.', { type: 'info' });
  });

  it('handles error', async () => {
    const error = new Error('fail') as AxiosError;
    mockAxios.put.mockRejectedValueOnce(error);
    const setPending = jest.fn();
    await handleItemRefresh({
      item,
      listId: '1',
      completedItems: [item],
      setCompletedItems: jest.fn(),
      notCompletedItems: [],
      setNotCompletedItems: jest.fn(),
      setPending,
      navigate: mockNavigate,
    });
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'Failed to refresh item',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
  });
});

describe('handleToggleRead', () => {
  it('toggles read status for single item', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [makeField({ label: 'read', data: 'false' })],
    });
    mockAxios.put.mockResolvedValueOnce({});

    const setCompletedItems = jest.fn();
    const setNotCompletedItems = jest.fn();
    const setSelectedItems = jest.fn();
    const setIncompleteMultiSelect = jest.fn();
    const setCompleteMultiSelect = jest.fn();

    await handleToggleRead({
      items: [testItem],
      listId: '1',
      completedItems: [testItem],
      setCompletedItems,
      notCompletedItems: [],
      setNotCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
    });

    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id', {
      list_item: {
        fields: [
          {
            label: 'read',
            data: 'true',
          },
        ],
      },
    });
    expect(setCompletedItems).toHaveBeenCalled();
    expect(setSelectedItems).toHaveBeenCalledWith([]);
    expect(setIncompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(setCompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(mockToast).toHaveBeenCalledWith('Item successfully updated.', { type: 'info' });
  });

  it('toggles read status for multiple items', async () => {
    const testItem1 = makeItem({
      id: 'test-id-1',
      fields: [makeField({ label: 'read', data: 'true' })],
    });
    const testItem2 = makeItem({
      id: 'test-id-2',
      fields: [makeField({ label: 'read', data: 'false' })],
    });

    mockAxios.put.mockResolvedValueOnce({});
    mockAxios.put.mockResolvedValueOnce({});

    const setCompletedItems = jest.fn();
    const setNotCompletedItems = jest.fn();
    const setSelectedItems = jest.fn();
    const setIncompleteMultiSelect = jest.fn();
    const setCompleteMultiSelect = jest.fn();

    await handleToggleRead({
      items: [testItem1, testItem2],
      listId: '1',
      completedItems: [testItem1],
      setCompletedItems,
      notCompletedItems: [testItem2],
      setNotCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
    });

    expect(mockAxios.put).toHaveBeenCalledTimes(2);
    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id-1', {
      list_item: {
        fields: [
          {
            label: 'read',
            data: 'false',
          },
        ],
      },
    });
    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id-2', {
      list_item: {
        fields: [
          {
            label: 'read',
            data: 'true',
          },
        ],
      },
    });
    expect(setCompletedItems).toHaveBeenCalled();
    expect(setNotCompletedItems).toHaveBeenCalled();
    expect(setSelectedItems).toHaveBeenCalledWith([]);
    expect(setIncompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(setCompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(mockToast).toHaveBeenCalledWith('Items successfully updated.', { type: 'info' });
  });

  it('adds read field when it does not exist', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [makeField({ label: 'name', data: 'Test Item' })], // No read field
    });
    mockAxios.put.mockResolvedValueOnce({});

    const setCompletedItems = jest.fn();
    const setNotCompletedItems = jest.fn();
    const setSelectedItems = jest.fn();
    const setIncompleteMultiSelect = jest.fn();
    const setCompleteMultiSelect = jest.fn();

    await handleToggleRead({
      items: [testItem],
      listId: '1',
      completedItems: [testItem],
      setCompletedItems,
      notCompletedItems: [],
      setNotCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
    });

    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id', {
      list_item: {
        fields: [
          {
            label: 'read',
            data: 'true',
          },
        ],
      },
    });
    expect(setCompletedItems).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Item successfully updated.', { type: 'info' });
  });

  it('updates both completed and not completed items correctly', async () => {
    const completedItem = makeItem({
      id: 'completed-id',
      completed: true,
      fields: [makeField({ label: 'read', data: 'false' })],
    });
    const notCompletedItem = makeItem({
      id: 'not-completed-id',
      completed: false,
      fields: [makeField({ label: 'read', data: 'true' })],
    });

    mockAxios.put.mockResolvedValueOnce({});
    mockAxios.put.mockResolvedValueOnce({});

    const setCompletedItems = jest.fn();
    const setNotCompletedItems = jest.fn();
    const setSelectedItems = jest.fn();
    const setIncompleteMultiSelect = jest.fn();
    const setCompleteMultiSelect = jest.fn();

    await handleToggleRead({
      items: [completedItem, notCompletedItem],
      listId: '1',
      completedItems: [completedItem],
      setCompletedItems,
      notCompletedItems: [notCompletedItem],
      setNotCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
    });

    expect(setCompletedItems).toHaveBeenCalled();
    expect(setNotCompletedItems).toHaveBeenCalled();
    expect(setSelectedItems).toHaveBeenCalledWith([]);
    expect(setIncompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(setCompleteMultiSelect).toHaveBeenCalledWith(false);
  });

  it('handles error', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [makeField({ label: 'read', data: 'false' })],
    });
    const error = new Error('fail') as AxiosError;
    mockAxios.put.mockRejectedValueOnce(error);

    const setCompletedItems = jest.fn();
    const setNotCompletedItems = jest.fn();
    const setSelectedItems = jest.fn();
    const setIncompleteMultiSelect = jest.fn();
    const setCompleteMultiSelect = jest.fn();

    await handleToggleRead({
      items: [testItem],
      listId: '1',
      completedItems: [testItem],
      setCompletedItems,
      notCompletedItems: [],
      setNotCompletedItems,
      setSelectedItems,
      setIncompleteMultiSelect,
      setCompleteMultiSelect,
      navigate: mockNavigate,
    });

    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'Item not found',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
  });
});
