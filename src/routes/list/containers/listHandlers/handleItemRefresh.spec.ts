import type { AxiosError } from 'axios';
import { handleItemRefresh } from './handleItemRefresh';
import { handleFailure } from '../../../../utils/handleFailure';
import axios from '../../../../utils/api';
import { createField, createListItem } from '../../../../test-utils/factories';

// Mock immutability-helper
jest.mock('immutability-helper', () => jest.requireActual('immutability-helper'));
jest.mock('../../../../utils/api', () => ({
  __esModule: true,
  default: {
    put: jest.fn(),
    delete: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
  },
}));
jest.mock('../../../../utils/handleFailure');

const mockToastUtil = jest.requireMock('../../../../utils/toast').showToast;
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;
const mockNavigate = jest.fn();

const item = createListItem('1', false, [createField('field1', 'category', 'Fruit', '1', { updated_at: null })], {
  user_id: 'u',
  list_id: 'l',
  updated_at: null,
});

describe('handleItemRefresh', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('refreshes item', async () => {
    const testItem = createListItem(
      'test-id',
      false,
      [
        createField('field1', 'product', 'Test Product', 'test-id', {
          list_item_field_configuration_id: 'config1',
          updated_at: null,
        }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );
    const otherItem = createListItem('other-id', false, [], {
      user_id: 'u',
      list_id: 'l',
      updated_at: null,
    });

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

    expect(mockAxios.put).toHaveBeenCalledWith('/lists/1/list_items/test-id', {
      list_item: { refreshed: true },
    });
    expect(mockAxios.post).toHaveBeenCalledWith('/lists/1/list_items', {
      list_item: { completed: false, refreshed: false },
    });
    expect(mockAxios.post).toHaveBeenCalledWith('/lists/1/list_items/new-item-id/list_item_fields', {
      list_item_field: {
        label: 'product',
        data: 'Test Product',
        list_item_field_configuration_id: 'config1',
      },
    });
    expect(mockAxios.get).toHaveBeenCalledWith('/lists/1/list_items/new-item-id');

    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item refreshed successfully.');
  });

  it('handles item with no fields', async () => {
    const testItem = createListItem('test-id', false, [], {
      user_id: 'u',
      list_id: 'l',
      updated_at: null,
    });
    const otherItem = createListItem('other-id', false, [], {
      user_id: 'u',
      list_id: 'l',
      updated_at: null,
    });

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

    expect(mockAxios.put).toHaveBeenCalledWith('/lists/1/list_items/test-id', {
      list_item: { refreshed: true },
    });
    expect(mockAxios.post).toHaveBeenCalledWith('/lists/1/list_items', {
      list_item: { completed: false, refreshed: false },
    });
    // Should not create any fields since item has no fields
    expect(mockAxios.post).toHaveBeenCalledTimes(1); // Only the item creation call
    expect(mockAxios.get).toHaveBeenCalledWith('/lists/1/list_items/new-item-id');

    expect(setCompleted).toHaveBeenCalled();
    expect(setNotCompleted).toHaveBeenCalled();
    expect(mockToastUtil.info).toHaveBeenCalledWith('Item refreshed successfully.');
  });

  it('skips fields with empty data', async () => {
    const testItem = createListItem(
      'test-id',
      false,
      [
        createField('field1', 'product', 'Test Product', 'test-id', {
          list_item_field_configuration_id: 'config1',
          updated_at: null,
        }),
        createField('field2', 'category', '', 'test-id', { updated_at: null }),
        createField('field3', 'notes', '  ', 'test-id', { updated_at: null }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );

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
    expect(mockAxios.post).toHaveBeenCalledWith('/lists/1/list_items/new-item-id/list_item_fields', {
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
    const testItem = createListItem(
      'test-id',
      false,
      [
        createField('field1', 'product', 'Test Product', 'test-id', { updated_at: null }),
        createField('field2', 'category', 'Test Category', 'test-id', { updated_at: null }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );

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
