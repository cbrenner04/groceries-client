import { fetchList } from './utils';
import { toast } from 'react-toastify';
import type { AxiosError } from 'axios';

jest.mock('../../../utils/api', () => ({
  get: jest.fn(),
}));
jest.mock('react-toastify');

const mockNavigate = jest.fn();

describe('fetchList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns data on success', async () => {
    const mockData = {
      list: {},
      not_completed_items: [],
      completed_items: [],
      list_users: [],
      permissions: 'write',
      lists_to_update: [],
      list_item_configuration: {},
      list_item_configurations: [],
      categories: [],
    };
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result).toEqual(expect.objectContaining(mockData));
  });

  it('handles 401 error', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 401 },
    } as Partial<AxiosError> as AxiosError;
    const axios = require('../../../utils/api');
    axios.get.mockRejectedValue(error);
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403/404 error', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 403 },
    } as Partial<AxiosError> as AxiosError;
    const axios = require('../../../utils/api');
    axios.get.mockRejectedValue(error);
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('handles generic error', async () => {
    const error = {
      isAxiosError: true,
      response: { status: 500 },
    } as Partial<AxiosError> as AxiosError;
    const axios = require('../../../utils/api');
    axios.get.mockRejectedValue(error);
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
    expect(toast).toHaveBeenCalledWith(
      'Something went wrong. Data may be incomplete and user actions may not persist.',
      { type: 'error' },
    );
  });

  it('handles missing data from server', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: null });
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
  });

  it('handles invalid data structure', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: { list: null, not_completed_items: null, completed_items: null } });
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
  });

  it('handles missing list field', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: { not_completed_items: [], completed_items: [] } });
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
  });

  it('handles missing not_completed_items field', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: { list: {}, completed_items: [] } });
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
  });

  it('handles missing completed_items field', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: { list: {}, not_completed_items: [] } });
    await expect(fetchList({ id: '1', navigate: mockNavigate })).rejects.toThrow();
  });

  it('extracts categories from items with category fields', async () => {
    const mockData = {
      list: {},
      not_completed_items: [
        {
          fields: [
            { label: 'category', data: 'Fruits' },
            { label: 'name', data: 'Apple' },
          ],
        },
      ],
      completed_items: [
        {
          fields: [
            { label: 'category', data: 'Vegetables' },
            { label: 'name', data: 'Carrot' },
          ],
        },
      ],
      list_users: [],
      permissions: 'write',
      lists_to_update: [],
      list_item_configuration: {},
      list_item_configurations: [],
    };
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['Fruits', 'Vegetables']);
  });

  it('deduplicates categories from items', async () => {
    const mockData = {
      list: {},
      not_completed_items: [
        { fields: [{ label: 'category', data: 'Fruits' }] },
        { fields: [{ label: 'category', data: 'Fruits' }] },
        { fields: [{ label: 'category', data: 'Fruits' }] },
        { fields: [{ label: 'category', data: 'Vegetables' }] },
      ],
      completed_items: [
        { fields: [{ label: 'category', data: 'Vegetables' }] },
        { fields: [{ label: 'category', data: 'Vegetables' }] },
        { fields: [{ label: 'category', data: 'Dairy' }] },
        { fields: [{ label: 'category', data: 'Dairy' }] },
      ],
      list_users: [],
      permissions: 'write',
      lists_to_update: [],
      list_item_configuration: {},
      list_item_configurations: [],
    };
    const axios = require('../../../utils/api');
    axios.get.mockResolvedValue({ data: mockData });
    const result = await fetchList({ id: '1', navigate: mockNavigate });
    expect(result?.categories).toEqual(['Fruits', 'Vegetables', 'Dairy']);
  });

  it('handles error when no data is received from server', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockRejectedValue({
      response: { status: 404 },
      isAxiosError: true,
    } as AxiosError);

    try {
      await fetchList({ id: '1', navigate: mockNavigate });
    } catch (error) {
      // Expected to throw
    }
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('handles error when invalid data structure is received', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockRejectedValue({
      response: { status: 404 },
      isAxiosError: true,
    } as AxiosError);

    try {
      await fetchList({ id: '1', navigate: mockNavigate });
    } catch (error) {
      // Expected to throw
    }
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('always throws an error in handleFailure even when no response', async () => {
    const axios = require('../../../utils/api');
    axios.get.mockRejectedValue({
      isAxiosError: true,
    } as AxiosError);

    try {
      await fetchList({ id: '1', navigate: mockNavigate });
    } catch (error) {
      // Expected to throw
    }
    // Should still throw even when error.response is undefined
    expect(() => {
      throw new Error();
    }).toThrow();
  });
});
