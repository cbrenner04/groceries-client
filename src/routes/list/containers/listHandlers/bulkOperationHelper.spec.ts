import { showToast } from 'utils/toast';
import { handleFailure } from 'utils/handleFailure';
import { createListItem } from 'test-utils/factories';
import { executeBulkOperations, pluralize, extractCategoriesFromItems } from './bulkOperationHelper';

vi.mock('utils/handleFailure');

const mockShowToast = showToast as Mocked<typeof showToast>;
const mockHandleFailure = handleFailure as MockedFunction<typeof handleFailure>;

describe('pluralize', () => {
  it('returns "Item" for a single item', () => {
    expect(pluralize([createListItem('1', false, [])])).toBe('Item');
  });

  it('returns "Items" for multiple items', () => {
    expect(pluralize([createListItem('1', false, []), createListItem('2', false, [])])).toBe('Items');
  });
});

describe('extractCategoriesFromItems', () => {
  it('returns empty array when no items have categories', () => {
    const items = [createListItem('1', false, []), createListItem('2', false, [])];
    expect(extractCategoriesFromItems(items)).toEqual([]);
  });

  it('returns unique categories from items', () => {
    const items = [
      createListItem('1', false, [], { category: 'Produce' }),
      createListItem('2', false, [], { category: 'Dairy' }),
      createListItem('3', false, [], { category: 'Produce' }),
    ];
    const result = extractCategoriesFromItems(items);
    expect(result).toHaveLength(2);
    expect(result).toContain('Produce');
    expect(result).toContain('Dairy');
  });

  it('ignores items without categories', () => {
    const items = [createListItem('1', false, [], { category: 'Produce' }), createListItem('2', false, [])];
    const result = extractCategoriesFromItems(items);
    expect(result).toEqual(['Produce']);
  });
});

describe('executeBulkOperations', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns successful results and calls successMessage toast', async () => {
    const items = [createListItem('1', false, []), createListItem('2', false, [])];
    const mockOperation = vi.fn().mockResolvedValue(undefined);

    const results = await executeBulkOperations(items, {
      executeOperation: mockOperation,
      successMessage: (items) => `${items.length} items done`,
      failureMessage: () => 'some failed',
      allFailureMessage: 'all failed',
      navigate: mockNavigate,
    });

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
    expect(mockShowToast.info).toHaveBeenCalledWith('2 items done');
  });

  it('calls warning when some operations fail', async () => {
    const items = [createListItem('1', false, []), createListItem('2', false, [])];
    const mockOperation = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Failed'));

    const results = await executeBulkOperations(items, {
      executeOperation: mockOperation,
      successMessage: () => '1 item done',
      failureMessage: (successful, failed) => `${successful.length} ok, ${failed.length} failed`,
      allFailureMessage: 'all failed',
      navigate: mockNavigate,
    });

    expect(results).toHaveLength(2);
    expect(mockShowToast.warning).toHaveBeenCalledWith('1 ok, 1 failed');
  });

  it('calls handleFailure when all operations fail without allFailureToastMessage', async () => {
    const items = [createListItem('1', false, [])];
    const mockOperation = vi.fn().mockRejectedValue(new Error('Failed'));

    await executeBulkOperations(items, {
      executeOperation: mockOperation,
      successMessage: () => 'done',
      failureMessage: () => 'some failed',
      allFailureMessage: 'all failed',
      navigate: mockNavigate,
    });

    expect(mockHandleFailure).toHaveBeenCalled();
    expect(mockShowToast.error).not.toHaveBeenCalled();
  });

  it('calls showToast.error when all operations fail with allFailureToastMessage', async () => {
    const items = [createListItem('1', false, [])];
    const mockOperation = vi.fn().mockRejectedValue(new Error('Failed'));

    await executeBulkOperations(items, {
      executeOperation: mockOperation,
      successMessage: () => 'done',
      failureMessage: () => 'some failed',
      allFailureMessage: 'all failed',
      allFailureToastMessage: 'Failed to delete items. Please try again.',
      navigate: mockNavigate,
    });

    expect(mockShowToast.error).toHaveBeenCalledWith('Failed to delete items. Please try again.');
    expect(mockHandleFailure).not.toHaveBeenCalled();
  });

  it('returns results with success and item references', async () => {
    const item = createListItem('item1', false, []);
    const mockOperation = vi.fn().mockResolvedValue('result-value');

    const results = await executeBulkOperations([item], {
      executeOperation: mockOperation,
      successMessage: () => 'done',
      failureMessage: () => 'failed',
      allFailureMessage: 'all failed',
    });

    expect(results[0].success).toBe(true);
    expect(results[0].item).toBe(item);
    expect(results[0].result).toBe('result-value');
  });

  it('includes error in failed results', async () => {
    const item = createListItem('item1', false, []);
    const error = new Error('Network error');
    const mockOperation = vi.fn().mockRejectedValue(error);

    const results = await executeBulkOperations([item], {
      executeOperation: mockOperation,
      successMessage: () => 'done',
      failureMessage: () => 'failed',
      allFailureMessage: 'all failed',
    });

    expect(results[0].success).toBe(false);
    expect(results[0].error).toBe(error);
  });
});
