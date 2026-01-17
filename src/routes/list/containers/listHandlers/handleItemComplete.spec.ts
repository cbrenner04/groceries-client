import { handleItemComplete } from './handleItemComplete';
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

const mockNavigate = jest.fn();
const mockAxios = axios as jest.Mocked<typeof axios>;
const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;

const item = createListItem('1', false, [], {
  user_id: 'u',
  list_id: 'l',
  updated_at: null,
});

describe('handleItemComplete', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('completes item', async () => {
    const testItem = createListItem('test-id', false, [], {
      user_id: 'u',
      list_id: 'l',
      updated_at: null,
    });
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
    const testItem = createListItem('test-id', false, [], {
      user_id: 'u',
      list_id: 'l',
      updated_at: null,
    });
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
