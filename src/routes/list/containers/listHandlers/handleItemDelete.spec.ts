import { handleItemDelete } from './handleItemDelete';
import { handleFailure } from '../../../../utils/handleFailure';
import axios from '../../../../utils/api';
import { createListItem } from '../../../../test-utils/factories';

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

const item = createListItem('1', false, [], {
  user_id: 'u',
  list_id: 'l',
  updated_at: null,
});

describe('handleItemDelete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes item', async () => {
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
    const testItem = createListItem('test-id', true, [], {
      user_id: 'u',
      list_id: 'l',
      updated_at: null,
    });
    const otherItem = createListItem('other-id', true, [], {
      user_id: 'u',
      list_id: 'l',
      updated_at: null,
    });
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
