import type { AxiosError } from 'axios';
import { type IListItemField, type IListItem, EListItemFieldType } from 'typings';
import {
  handleAddItem,
  handleItemSelect,
  handleItemEdit,
  handleItemComplete,
  handleItemDelete,
  handleItemRefresh,
  handleToggleRead,
} from './listHandlers';
import { handleFailure } from '../../../utils/handleFailure';
import axios from '../../../utils/api';
import { mockNavigate } from '../../../test-utils';

// Mock immutability-helper
jest.mock('immutability-helper', () => jest.requireActual('immutability-helper'));
jest.mock('../../../utils/api', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
  },
}));
jest.mock('../../../utils/handleFailure');

// Mock the toast utilities

const mockToastUtil = jest.requireMock('../../../utils/toast').showToast;
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;

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
    data_type: overrides.data_type ?? EListItemFieldType.FREE_TEXT,
    ...overrides,
  };
}

// Helper to create a valid IListItem
function makeItem(overrides = {}): IListItem {
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
    expect(nav).toHaveBeenCalledWith('/lists/1/list_items/1/edit');
  });
});

describe('handleItemComplete', () => {
  it('completes item', async () => {
    const testItem = makeItem({ id: 'test-id' });
    const setPending = jest.fn();

    await handleItemComplete({
      item: testItem,
      listId: '1',
      setPending,
    });

    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id', {
      list_item: { completed: true },
    });
    expect(setPending).toHaveBeenCalledWith(true);
    expect(setPending).toHaveBeenCalledWith(false);
  });

  it('preserves original fields when API returns minimal response', async () => {
    const testItem = makeItem({ id: 'test-id' });
    // API returns minimal response without fields
    mockAxios.put.mockResolvedValueOnce({ data: { id: 'test-id', completed: true } });
    const setPending = jest.fn();

    await handleItemComplete({
      item: testItem,
      listId: '1',
      setPending,
    });

    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id', {
      list_item: { completed: true },
    });
    expect(setPending).toHaveBeenCalledWith(true);
    expect(setPending).toHaveBeenCalledWith(false);
  });

  it('handles error', async () => {
    const error = new Error('AHHHH!');
    mockAxios.put.mockRejectedValueOnce(error);
    const setPending = jest.fn();
    await expect(
      handleItemComplete({
        item,
        listId: '1',
        setPending,
        navigate: mockNavigate,
      }),
    ).rejects.toThrow(error);
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
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item successfully deleted.');
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
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item successfully deleted.');
  });

  it('handles error', async () => {
    const error = new Error('AHHHH!');
    mockAxios.delete.mockRejectedValueOnce(error);
    const setPending = jest.fn();
    await expect(
      handleItemDelete({
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
      }),
    ).rejects.toThrow(error);
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
    expect(mockToastUtil.info).not.toHaveBeenCalled();
  });
});

describe('handleItemRefresh', () => {
  it('refreshes item', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [makeField({ data: 'Test Product', label: 'product' })],
    });
    const otherItem = makeItem({ id: 'other-id' });

    // Mock the three API calls: mark old item as refreshed, create new item, create fields, fetch complete item
    mockAxios.put.mockResolvedValueOnce({ data: { ...testItem, refreshed: true } });
    mockAxios.post
      .mockResolvedValueOnce({ data: { id: 'new-item-id', completed: false } }) // Create new item
      .mockResolvedValueOnce({ data: {} }); // Create field
    mockAxios.get.mockResolvedValueOnce({
      data: { id: 'new-item-id', completed: false, fields: testItem.fields },
    }); // Fetch complete item

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

    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id', {
      list_item: { refreshed: true },
    });
    expect(mockAxios.post).toHaveBeenCalledWith('/v2/lists/1/list_items', {
      list_item: { completed: false, refreshed: false },
    });
    expect(mockAxios.post).toHaveBeenCalledWith('/v2/lists/1/list_items/new-item-id/list_item_fields', {
      list_item_field: {
        label: 'product',
        data: 'Test Product',
        list_item_field_configuration_id: 'config1',
      },
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/v2/lists/1/list_items/new-item-id');

    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item refreshed successfully.');
  });

  it('handles item with no fields', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [], // No fields to refresh
    });
    const otherItem = makeItem({ id: 'other-id' });

    // Mock the API calls: mark old item as refreshed, create new item, fetch complete item (no field creation needed)
    mockAxios.put.mockResolvedValueOnce({ data: { ...testItem, refreshed: true } });
    mockAxios.post.mockResolvedValueOnce({ data: { id: 'new-item-id', completed: false } }); // Create new item
    mockAxios.get.mockResolvedValueOnce({
      data: { id: 'new-item-id', completed: false, fields: [] },
    }); // Fetch complete item

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

    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id', {
      list_item: { refreshed: true },
    });
    expect(mockAxios.post).toHaveBeenCalledWith('/v2/lists/1/list_items', {
      list_item: { completed: false, refreshed: false },
    });
    // Should not create any fields since item has no fields
    expect(mockAxios.post).toHaveBeenCalledTimes(1); // Only the item creation call
    expect(mockAxios.get).toHaveBeenCalledWith('/v2/lists/1/list_items/new-item-id');

    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item refreshed successfully.');
  });

  it('skips fields with empty data', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [
        makeField({ data: 'Test Product', label: 'product' }),
        makeField({ data: '', label: 'category' }), // Empty field should be skipped
        makeField({ data: '  ', label: 'notes' }), // Whitespace-only field should be skipped
      ],
    });

    // Mock the API calls
    mockAxios.put.mockResolvedValueOnce({ data: { ...testItem, refreshed: true } });
    mockAxios.post.mockResolvedValueOnce({ data: { id: 'new-item-id', completed: false } }); // Create new item
    mockAxios.post.mockResolvedValueOnce({ data: {} }); // Create field (only one call expected)
    mockAxios.get.mockResolvedValueOnce({
      data: { id: 'new-item-id', completed: false, fields: [testItem.fields[0]] },
    }); // Fetch complete item

    const setCompleted = jest.fn();
    const setNotCompleted = jest.fn();
    const setPending = jest.fn();
    await handleItemRefresh({
      item: testItem,
      listId: '1',
      completedItems: [testItem],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: setNotCompleted,
      setPending,
    });

    // Should only create one field (the one with actual data)
    expect(mockAxios.post).toHaveBeenCalledTimes(2); // Item creation + one field creation
    expect(mockAxios.post).toHaveBeenCalledWith('/v2/lists/1/list_items/new-item-id/list_item_fields', {
      list_item_field: {
        label: 'product',
        data: 'Test Product',
        list_item_field_configuration_id: 'config1',
      },
    });

    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item refreshed successfully.');
  });

  it('preserves original fields when server returns incomplete item data', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [
        makeField({ data: 'Test Product', label: 'product' }),
        makeField({ data: 'Test Category', label: 'category' }),
      ],
    });

    // Mock API: create item, create fields, but server returns incomplete item (no fields)
    mockAxios.put.mockResolvedValueOnce({ data: { ...testItem, refreshed: true } });
    mockAxios.post.mockResolvedValueOnce({ data: { id: 'new-item-id', completed: false } }); // Create item
    mockAxios.post.mockResolvedValueOnce({ data: {} }); // Create product field
    mockAxios.post.mockResolvedValueOnce({ data: {} }); // Create category field
    mockAxios.get.mockResolvedValueOnce({
      data: { id: 'new-item-id', completed: false, fields: [] }, // Server returns item without fields
    });

    const setCompleted = jest.fn();
    const setNotCompleted = jest.fn();
    const setPending = jest.fn();
    await handleItemRefresh({
      item: testItem,
      listId: '1',
      completedItems: [testItem],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: setNotCompleted,
      setPending,
    });

    // Should fallback to using original item fields
    expect(setNotCompleted).toHaveBeenCalledWith([
      expect.objectContaining({
        id: 'new-item-id',
        completed: false,
        fields: testItem.fields, // Should use original fields as fallback
      }),
    ]);

    expect(mockToastUtil.info).toHaveBeenCalledWith('Item refreshed successfully.');
  });

  it('handles error', async () => {
    const error = new Error('fail') as AxiosError;
    mockAxios.put.mockRejectedValueOnce(error);
    const setPending = jest.fn();
    await expect(
      handleItemRefresh({
        item,
        listId: '1',
        completedItems: [item],
        setCompletedItems: jest.fn(),
        notCompletedItems: [],
        setNotCompletedItems: jest.fn(),
        setPending,
        navigate: mockNavigate,
      }),
    ).rejects.toThrow('fail');
    expect(mockHandleFailure).toHaveBeenCalledWith({
      error,
      notFoundMessage: 'Failed to refresh item',
      navigate: mockNavigate,
      redirectURI: '/lists',
    });
  });
});

describe('handleToggleRead', () => {
  it('toggles read status for single item with existing read field', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [
        makeField({
          id: 'read-field-1',
          label: 'read',
          data: 'false',
          list_item_field_configuration_id: 'read-config-1',
        }),
      ],
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

    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id/list_item_fields/read-field-1', {
      list_item_field: {
        data: 'true',
        list_item_field_configuration_id: 'read-config-1',
      },
    });
    expect(setCompletedItems).toHaveBeenCalled();
    expect(setSelectedItems).toHaveBeenCalledWith([]);
    expect(setIncompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(setCompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item successfully updated.');
  });

  it('toggles read status for multiple items with existing read fields', async () => {
    const testItem1 = makeItem({
      id: 'test-id-1',
      fields: [
        makeField({
          id: 'read-field-1',
          label: 'read',
          data: 'true',
          list_item_field_configuration_id: 'read-config-1',
        }),
      ],
    });
    const testItem2 = makeItem({
      id: 'test-id-2',
      fields: [
        makeField({
          id: 'read-field-2',
          label: 'read',
          data: 'false',
          list_item_field_configuration_id: 'read-config-2',
        }),
      ],
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
    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id-1/list_item_fields/read-field-1', {
      list_item_field: {
        data: 'false',
        list_item_field_configuration_id: 'read-config-1',
      },
    });
    expect(mockAxios.put).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id-2/list_item_fields/read-field-2', {
      list_item_field: {
        data: 'true',
        list_item_field_configuration_id: 'read-config-2',
      },
    });
    expect(setCompletedItems).toHaveBeenCalled();
    expect(setNotCompletedItems).toHaveBeenCalled();
    expect(setSelectedItems).toHaveBeenCalledWith([]);
    expect(setIncompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(setCompleteMultiSelect).toHaveBeenCalledWith(false);
    expect(mockToastUtil.info).toHaveBeenCalledWith('Items successfully updated.');
  });

  it('creates read field when it does not exist', async () => {
    const testItem = makeItem({
      id: 'test-id',
      fields: [makeField({ label: 'name', data: 'Test Item' })], // No read field
    });

    // Mock the list response
    mockAxios.get.mockResolvedValueOnce({ data: { list_item_configuration_id: 'list-config-1' } });
    // Mock the field configurations response
    mockAxios.get.mockResolvedValueOnce({
      data: [{ id: 'read-config-1', label: 'read', data_type: EListItemFieldType.BOOLEAN }],
    });
    mockAxios.post.mockResolvedValueOnce({});

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

    expect(mockAxios.get).toHaveBeenCalledWith('/v2/lists/1');
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/list_item_configurations/list-config-1/list_item_field_configurations',
      { signal: undefined },
    );
    expect(mockAxios.post).toHaveBeenCalledWith('/v2/lists/1/list_items/test-id/list_item_fields', {
      list_item_field: {
        data: 'true',
        list_item_field_configuration_id: 'read-config-1',
      },
    });
    expect(setCompletedItems).toHaveBeenCalled();
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item successfully updated.');
  });

  it('updates both completed and not completed items correctly', async () => {
    const completedItem = makeItem({
      id: 'completed-id',
      completed: true,
      fields: [
        makeField({
          id: 'read-field-1',
          label: 'read',
          data: 'false',
          list_item_field_configuration_id: 'read-config-1',
        }),
      ],
    });
    const notCompletedItem = makeItem({
      id: 'not-completed-id',
      completed: false,
      fields: [
        makeField({
          id: 'read-field-2',
          label: 'read',
          data: 'true',
          list_item_field_configuration_id: 'read-config-2',
        }),
      ],
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
      fields: [
        makeField({
          id: 'read-field-1',
          label: 'read',
          data: 'false',
          list_item_field_configuration_id: 'read-config-1',
        }),
      ],
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
