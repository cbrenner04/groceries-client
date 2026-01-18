import React from 'react';
import { render, screen } from '@testing-library/react';
import { EListType, EUserPermissions } from 'typings';
import { createField, createListItem } from 'test-utils/factories';

import NotCompletedItemsSection from './NotCompletedItemsSection';

jest.mock('./ListItem', () => ({
  __esModule: true,
  default: (props: { item: { id: string } }): React.JSX.Element => <div data-test-id="list-item">{props.item.id}</div>,
}));

const baseProps = {
  notCompletedItems: [],
  permissions: EUserPermissions.READ,
  selectedItems: [],
  pending: false,
  listType: EListType.GROCERY_LIST,
  filter: '',
  displayedCategories: [],
  incompleteMultiSelect: false,
  setCopy: jest.fn(),
  setMove: jest.fn(),
  setSelectedItems: jest.fn(),
  setIncompleteMultiSelect: jest.fn(),
  handleItemSelect: jest.fn(),
  handleItemComplete: jest.fn().mockResolvedValue(undefined),
  handleItemEdit: jest.fn(),
  handleItemDelete: jest.fn(),
  handleItemRefresh: jest.fn().mockResolvedValue(undefined),
};

describe('NotCompletedItemsSection', () => {
  it('treats whitespace-only category as uncategorized', () => {
    const items = [
      createListItem('1', false, [createField('f1', 'category', '   ', '1')]),
      createListItem('2', false, []),
    ];

    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={items} />);

    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('groups categories case-insensitively', () => {
    const items = [
      createListItem('1', false, [createField('f1', 'category', 'Produce', '1')]),
      createListItem('2', false, [createField('f2', 'category', 'produce', '2')]),
    ];

    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={items} />);

    expect(screen.getAllByText('Produce')).toHaveLength(1);
  });
});
