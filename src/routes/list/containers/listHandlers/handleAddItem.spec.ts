import { handleAddItem } from './handleAddItem';
import { handleFailure } from '../../../../utils/handleFailure';
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

// Mock the toast utilities
const mockHandleFailure = handleFailure as jest.MockedFunction<typeof handleFailure>;

const mockNavigate = jest.fn();
const mockSet = jest.fn();
const mockSetPending = jest.fn();

const item = createListItem('1', false, [createField('field1', 'category', 'Fruit', '1')], {
  user_id: 'u',
  list_id: 'l',
  updated_at: null,
});

describe('handleAddItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'category', 'NewCat', '1')] }],
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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'category', 'BrandNewCategory', '1')] }],
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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'category', 'ExistingCategory', '1')] }],
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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'name', 'Item Name', '1')] }],
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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'category', '', '1')] }],
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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'category', 'NewCategory', '1')] }],
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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'category', 'NewCategory', '1')] }],
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
      newItems: [{ ...item, completed: false, fields: [createField('field1', 'category', 'NewCategory', '1')] }],
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
