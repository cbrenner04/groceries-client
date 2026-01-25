import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListItem, { memoCompare } from './ListItem';
import type { IListItem, IListItemField } from 'typings';
import { EUserPermissions, EListItemFieldType } from 'typings';

const mockHandleItemSelect = jest.fn();
const mockHandleItemRefresh = jest.fn();
const mockHandleItemComplete = jest.fn();
const mockHandleItemEdit = jest.fn();
const mockHandleItemDelete = jest.fn();

const mockFields: IListItemField[] = [
  {
    id: '1',
    label: 'product',
    data: 'Apples',
    list_item_field_configuration_id: '1',
    user_id: '1',
    list_item_id: '1',
    created_at: new Date().toISOString(),
    updated_at: null,
    archived_at: null,
    position: 0,
    data_type: EListItemFieldType.FREE_TEXT,
    primary: true,
  },
  {
    id: '2',
    label: 'quantity',
    data: '3',
    list_item_field_configuration_id: '2',
    user_id: '1',
    list_item_id: '1',
    created_at: new Date().toISOString(),
    updated_at: null,
    archived_at: null,
    position: 1,
    data_type: EListItemFieldType.NUMBER,
    primary: false,
  },
];

const mockItem: IListItem = {
  id: 'item-1',
  user_id: 'user-1',
  list_id: 'list-1',
  completed: false,
  refreshed: false,
  created_at: new Date().toISOString(),
  updated_at: null,
  archived_at: null,
  fields: mockFields,
};

const defaultProps = {
  item: mockItem,
  permissions: EUserPermissions.WRITE,
  pending: false,
  selectedItems: [],
  handleItemSelect: mockHandleItemSelect,
  handleItemRefresh: mockHandleItemRefresh,
  handleItemComplete: mockHandleItemComplete,
  handleItemEdit: mockHandleItemEdit,
  handleItemDelete: mockHandleItemDelete,
};

describe('ListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders primary field as title and secondary fields below', () => {
    render(<ListItem {...defaultProps} />);
    expect(screen.getByText('Apples')).toBeInTheDocument();
    expect(screen.getByText('quantity: 3')).toBeInTheDocument();
  });

  it('renders action buttons for write permissions', () => {
    render(<ListItem {...defaultProps} />);
    expect(screen.getByTestId('not-completed-item-complete-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('not-completed-item-edit-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('not-completed-item-delete-item-1')).toBeInTheDocument();
  });

  it('handles complete button click', () => {
    render(<ListItem {...defaultProps} />);
    fireEvent.click(screen.getByTestId('not-completed-item-complete-item-1'));
    expect(mockHandleItemComplete).toHaveBeenCalledWith(mockItem);
  });

  it('handles edit button click', () => {
    render(<ListItem {...defaultProps} />);
    fireEvent.click(screen.getByTestId('not-completed-item-edit-item-1'));
    expect(mockHandleItemEdit).toHaveBeenCalledWith(mockItem);
  });

  it('handles delete button click', () => {
    render(<ListItem {...defaultProps} />);
    fireEvent.click(screen.getByTestId('not-completed-item-delete-item-1'));
    expect(mockHandleItemDelete).toHaveBeenCalledWith(mockItem);
  });

  it('renders refresh button for completed items', () => {
    const completedItem = { ...mockItem, completed: true };
    render(<ListItem {...defaultProps} item={completedItem} />);
    expect(screen.getByTestId('completed-item-refresh-item-1')).toBeInTheDocument();
  });

  it('handles refresh button click for completed items', () => {
    const completedItem = { ...mockItem, completed: true };
    render(<ListItem {...defaultProps} item={completedItem} />);
    fireEvent.click(screen.getByTestId('completed-item-refresh-item-1'));
    expect(mockHandleItemRefresh).toHaveBeenCalledWith(completedItem);
  });

  it('shows multi-select checkbox when multiSelect is true', () => {
    render(<ListItem {...defaultProps} multiSelect={true} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles multi-select checkbox click', () => {
    render(<ListItem {...defaultProps} multiSelect={true} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockHandleItemSelect).toHaveBeenCalledWith(mockItem);
  });

  it('shows "Untitled Item" when no fields are present', () => {
    const itemWithoutFields = { ...mockItem, fields: [] };
    render(<ListItem {...defaultProps} item={itemWithoutFields} />);
    expect(screen.getByText('Untitled Item')).toBeInTheDocument();
  });

  it('disables buttons when pending is true', () => {
    render(<ListItem {...defaultProps} pending={true} />);
    const completeButton = screen.getByTestId('not-completed-item-complete-item-1');
    expect(completeButton).toBeDisabled();
  });

  describe('memoization comparator', () => {
    it('does not re-render when non-compared props change', () => {
      const prev = { ...defaultProps };
      const next = {
        ...prev,
        handleItemEdit: jest.fn(),
        item: {
          ...prev.item,
          fields: [...prev.item.fields, { ...prev.item.fields[0], id: '99', label: 'extra', data: 'foo' }],
          updated_at: prev.item.updated_at,
        },
        selectedItems: [...prev.selectedItems],
      };

      expect(memoCompare(prev, next)).toBe(true);
    });

    it('re-renders when compared props change (pending, updated_at)', () => {
      const base = { ...defaultProps };
      expect(memoCompare(base, { ...base, pending: true })).toBe(false);
      expect(memoCompare(base, { ...base, selectedItems: [mockItem] })).toBe(false);
      expect(memoCompare(base, { ...base, item: { ...base.item, updated_at: new Date().toISOString() } })).toBe(false);
    });

    it('re-renders when multiSelect changes', () => {
      const base = { ...defaultProps };
      expect(memoCompare(base, { ...base, multiSelect: true })).toBe(false);
      expect(memoCompare({ ...base, multiSelect: true }, { ...base, multiSelect: false })).toBe(false);
    });

    it('re-renders when permissions change', () => {
      const base = { ...defaultProps };
      expect(memoCompare(base, { ...base, permissions: EUserPermissions.READ })).toBe(false);
      expect(
        memoCompare({ ...base, permissions: EUserPermissions.READ }, { ...base, permissions: EUserPermissions.WRITE }),
      ).toBe(false);
    });

    it('re-renders when item.id changes', () => {
      const base = { ...defaultProps };
      expect(memoCompare(base, { ...base, item: { ...base.item, id: 'different-id' } })).toBe(false);
    });

    it('re-renders when item.completed changes', () => {
      const base = { ...defaultProps };
      expect(memoCompare(base, { ...base, item: { ...base.item, completed: true } })).toBe(false);
      expect(
        memoCompare(
          { ...base, item: { ...base.item, completed: true } },
          { ...base, item: { ...base.item, completed: false } },
        ),
      ).toBe(false);
    });
  });
});

describe('ListItem with read permissions', () => {
  const readOnlyProps = {
    ...defaultProps,
    permissions: EUserPermissions.READ,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render action buttons for read permissions', () => {
    render(<ListItem {...readOnlyProps} />);
    expect(screen.queryByTestId('not-completed-item-complete-item-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('not-completed-item-edit-item-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('not-completed-item-delete-item-1')).not.toBeInTheDocument();
  });

  it('does not render refresh button for completed items with read permissions', () => {
    const completedItem = { ...mockItem, completed: true };
    render(<ListItem {...readOnlyProps} item={completedItem} />);
    expect(screen.queryByTestId('completed-item-refresh-item-1')).not.toBeInTheDocument();
  });

  it('still renders item content for read permissions', () => {
    render(<ListItem {...readOnlyProps} />);
    expect(screen.getByText('Apples')).toBeInTheDocument();
    expect(screen.getByText('quantity: 3')).toBeInTheDocument();
  });

  it('still shows multi-select checkbox when multiSelect is true for read permissions', () => {
    render(<ListItem {...readOnlyProps} multiSelect={true} />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles multi-select checkbox click for read permissions', () => {
    render(<ListItem {...readOnlyProps} multiSelect={true} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockHandleItemSelect).toHaveBeenCalledWith(mockItem);
  });
});
