import type { AxiosError } from 'axios';
import { EListItemFieldType } from 'typings';
import { handleToggleRead } from './handleToggleRead';
import { handleFailure } from '../../../../utils/handleFailure';
import axios from '../../../../utils/api';
import { createField, createListItem } from '../../../../test-utils/factories';

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
jest.mock('../../../../utils/fieldConfigCache', () => ({
  getFieldConfigurations: jest.fn(),
}));

const mockToastUtil = jest.requireMock('../../../../utils/toast').showToast;
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;
const mockNavigate = jest.fn();

describe('handleToggleRead', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toggles read status for single item with existing read field', async () => {
    const testItem = createListItem(
      'test-id',
      false,
      [
        createField('read-field-1', 'read', 'false', 'test-id', {
          list_item_field_configuration_id: 'read-config-1',
          updated_at: null,
        }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );
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
    const testItem1 = createListItem(
      'test-id-1',
      false,
      [
        createField('read-field-1', 'read', 'true', 'test-id-1', {
          list_item_field_configuration_id: 'read-config-1',
          updated_at: null,
        }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );
    const testItem2 = createListItem(
      'test-id-2',
      false,
      [
        createField('read-field-2', 'read', 'false', 'test-id-2', {
          list_item_field_configuration_id: 'read-config-2',
          updated_at: null,
        }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );

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
    const testItem = createListItem(
      'test-id',
      false,
      [createField('field1', 'name', 'Test Item', 'test-id', { updated_at: null })],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );

    // Mock the list response
    mockAxios.get.mockResolvedValueOnce({ data: { list_item_configuration_id: 'list-config-1' } });
    // Mock the field configurations response
    const { getFieldConfigurations } = require('../../../../utils/fieldConfigCache');
    getFieldConfigurations.mockResolvedValueOnce([
      { id: 'read-config-1', label: 'read', data_type: EListItemFieldType.BOOLEAN },
    ]);
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
    const completedItem = createListItem(
      'completed-id',
      true,
      [
        createField('read-field-1', 'read', 'false', 'completed-id', {
          list_item_field_configuration_id: 'read-config-1',
          updated_at: null,
        }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );
    const notCompletedItem = createListItem(
      'not-completed-id',
      false,
      [
        createField('read-field-2', 'read', 'true', 'not-completed-id', {
          list_item_field_configuration_id: 'read-config-2',
          updated_at: null,
        }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );

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
    const testItem = createListItem(
      'test-id',
      false,
      [
        createField('read-field-1', 'read', 'false', 'test-id', {
          list_item_field_configuration_id: 'read-config-1',
          updated_at: null,
        }),
      ],
      {
        user_id: 'u',
        list_id: 'l',
        updated_at: null,
      },
    );
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
