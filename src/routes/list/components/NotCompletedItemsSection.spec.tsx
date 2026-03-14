import React from 'react';
import { render, screen } from '@testing-library/react';
import { EUserPermissions } from 'typings';
import { createListItem } from 'test-utils/factories';

import NotCompletedItemsSection from './NotCompletedItemsSection';

vi.mock('./ListItem', () => ({
  __esModule: true,
  default: (props: { item: { id: string } }): React.JSX.Element => <div data-test-id="list-item">{props.item.id}</div>,
}));

const baseProps = {
  notCompletedItems: [],
  permissions: EUserPermissions.READ,
  selectedItems: [],
  pending: false,
  filter: '',
  displayedCategories: [],
  incompleteMultiSelect: false,
  setCopy: vi.fn(),
  setMove: vi.fn(),
  setSelectedItems: vi.fn(),
  setIncompleteMultiSelect: vi.fn(),
  handleItemSelect: vi.fn(),
  handleItemComplete: vi.fn().mockResolvedValue(undefined),
  handleItemEdit: vi.fn(),
  handleItemDelete: vi.fn(),
  handleItemRefresh: vi.fn().mockResolvedValue(undefined),
};

describe('NotCompletedItemsSection', () => {
  it('treats whitespace-only category as uncategorized', () => {
    const items = [createListItem('1', false, [], { category: '   ' }), createListItem('2', false, [])];

    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={items} />);

    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('groups categories case-insensitively', () => {
    const items = [
      createListItem('1', false, [], { category: 'Produce' }),
      createListItem('2', false, [], { category: 'produce' }),
    ];

    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={items} />);

    expect(screen.getAllByText('Produce')).toHaveLength(1);
  });
});
