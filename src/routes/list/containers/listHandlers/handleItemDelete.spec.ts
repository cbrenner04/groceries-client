import { handleItemDelete } from './handleItemDelete';
import { handleFailure } from '../../../../utils/handleFailure';
import axios from '../../../../utils/api';
import { createListItem } from '../../../../test-utils/factories';
import { showToast } from '../../../../utils/toast';

vi.mock('../../../../utils/api', () => ({
  __esModule: true,
  default: {
    put: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
    get: vi.fn(),
  },
}));
vi.mock('../../../../utils/handleFailure');

const mockToastUtil = showToast as Mocked<typeof showToast>;
const mockAxios = axios as Mocked<typeof axios>;
const mockHandleFailure = handleFailure as MockedFunction<typeof handleFailure>;
const mockNavigate = vi.fn();

const item = createListItem('1', false, [], {
  user_id: 'u',
  list_id: 'l',
  updated_at: null,
});

describe('handleItemDelete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const setNotCompleted = vi.fn();
    const setSelected = vi.fn();
    const setPending = vi.fn();
    await handleItemDelete({
      item: testItem,
      listId: '1',
      completedItems: [],
      setCompletedItems: vi.fn(),
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
    const setCompleted = vi.fn();
    const setSelected = vi.fn();
    const setPending = vi.fn();
    await handleItemDelete({
      item: testItem,
      listId: '1',
      completedItems: [testItem, otherItem],
      setCompletedItems: setCompleted,
      notCompletedItems: [],
      setNotCompletedItems: vi.fn(),
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
    const setPending = vi.fn();
    await expect(
      handleItemDelete({
        item,
        listId: '1',
        completedItems: [],
        setCompletedItems: vi.fn(),
        notCompletedItems: [item],
        setNotCompletedItems: vi.fn(),
        selectedItems: [item],
        setSelectedItems: vi.fn(),
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
    const setNotCompleted = vi.fn();
    const setSelected = vi.fn();
    const setPending = vi.fn();
    await handleItemDelete({
      item: testItem,
      listId: '1',
      completedItems: [],
      setCompletedItems: vi.fn(),
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
