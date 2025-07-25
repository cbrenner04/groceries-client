import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListItem from './ListItem';
import type { IListItem, IListItemField } from 'typings';
import { EUserPermissions, EListType, EListItemFieldType } from 'typings';

const mockHandleItemSelect = jest.fn();
const mockHandleItemRefresh = jest.fn();
const mockHandleItemComplete = jest.fn();
const mockHandleItemEdit = jest.fn();
const mockHandleItemDelete = jest.fn();
const mockToggleItemRead = jest.fn();

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
    data_type: 'free_text' as 'free_text',
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
    data_type: 'number' as 'number',
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
  listType: EListType.GROCERY_LIST,
  handleItemSelect: mockHandleItemSelect,
  handleItemRefresh: mockHandleItemRefresh,
  handleItemComplete: mockHandleItemComplete,
  handleItemEdit: mockHandleItemEdit,
  handleItemDelete: mockHandleItemDelete,
  toggleItemRead: mockToggleItemRead,
};

describe('ListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders item fields correctly', () => {
    render(<ListItem {...defaultProps} />);
    expect(screen.getByText('3 Apples')).toBeInTheDocument();
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

  it('renders bookmark button for book lists when item is not completed', () => {
    const bookItem = {
      ...mockItem,
      fields: [
        ...mockFields,
        {
          id: '3',
          label: 'read',
          data: 'false',
          list_item_field_configuration_id: '3',
          user_id: '1',
          list_item_id: '1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          archived_at: null,
          position: 2,
          data_type: 'boolean' as 'boolean',
        },
      ],
    };
    render(<ListItem {...defaultProps} item={bookItem} listType={EListType.BOOK_LIST} />);
    expect(screen.getByTestId('not-completed-item-read-item-1')).toBeInTheDocument();
  });

  it('renders bookmark button for book lists when item is completed', () => {
    const completedBookItem = {
      ...mockItem,
      completed: true,
      fields: [
        ...mockFields,
        {
          id: '3',
          label: 'read',
          data: 'true',
          list_item_field_configuration_id: '3',
          user_id: '1',
          list_item_id: '1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          archived_at: null,
          position: 2,
          data_type: 'boolean' as 'boolean',
        },
      ],
    };
    render(<ListItem {...defaultProps} item={completedBookItem} listType={EListType.BOOK_LIST} />);
    expect(screen.getByTestId('completed-item-unread-item-1')).toBeInTheDocument();
  });

  it('handles bookmark button click for book lists', () => {
    const bookItem = {
      ...mockItem,
      fields: [
        ...mockFields,
        {
          id: '3',
          label: 'read',
          data: 'false',
          list_item_field_configuration_id: '3',
          user_id: '1',
          list_item_id: '1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          archived_at: null,
          position: 2,
          data_type: EListItemFieldType.BOOLEAN,
        },
      ],
    };
    render(<ListItem {...defaultProps} item={bookItem} listType={EListType.BOOK_LIST} />);
    fireEvent.click(screen.getByTestId('not-completed-item-read-item-1'));
    expect(mockToggleItemRead).toHaveBeenCalledWith(bookItem);
  });

  it('does not render bookmark button for non-book lists', () => {
    render(<ListItem {...defaultProps} />);
    expect(screen.queryByTestId('not-completed-item-read-item-1')).not.toBeInTheDocument();
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

  it('does not render bookmark button for book lists with read permissions', () => {
    const bookItem = {
      ...mockItem,
      fields: [
        ...mockFields,
        {
          id: '3',
          label: 'read',
          data: 'false',
          list_item_field_configuration_id: '3',
          user_id: '1',
          list_item_id: '1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          archived_at: null,
          position: 2,
          data_type: 'boolean' as 'boolean',
        },
      ],
    };
    render(<ListItem {...readOnlyProps} item={bookItem} listType={EListType.BOOK_LIST} />);
    expect(screen.queryByTestId('not-completed-item-read-item-1')).not.toBeInTheDocument();
  });

  it('does not render bookmark button for completed book items with read permissions', () => {
    const completedBookItem = {
      ...mockItem,
      completed: true,
      fields: [
        ...mockFields,
        {
          id: '3',
          label: 'read',
          data: 'true',
          list_item_field_configuration_id: '3',
          user_id: '1',
          list_item_id: '1',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
          archived_at: null,
          position: 2,
          data_type: 'boolean' as 'boolean',
        },
      ],
    };
    render(<ListItem {...readOnlyProps} item={completedBookItem} listType={EListType.BOOK_LIST} />);
    expect(screen.queryByTestId('completed-item-unread-item-1')).not.toBeInTheDocument();
  });

  it('still renders item content for read permissions', () => {
    render(<ListItem {...readOnlyProps} />);
    expect(screen.getByText('3 Apples')).toBeInTheDocument();
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
