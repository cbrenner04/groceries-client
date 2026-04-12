import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EUserPermissions } from 'typings';
import { createListItem } from 'test-utils/factories';

import NotCompletedItemsSection from './NotCompletedItemsSection';

vi.mock('components/domain/ListItemRow', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListItemRow: (props: any): React.JSX.Element => (
    <div data-test-id="list-item">
      {props.item.id}
      <button data-test-id="item-refresh" onClick={() => props.onRefresh(props.item.id)}>
        refresh
      </button>
    </div>
  ),
}));

vi.mock('components/domain/CategoryGroup', () => ({
  __esModule: true,
  CategoryGroup: (props: { children: React.ReactNode; category: string }): React.JSX.Element => (
    <div>{props.children}</div>
  ),
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
  it('renders nothing when there are no items', () => {
    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={[]} />);
    expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();
  });

  it('renders items without categories in uncategorized group', () => {
    const items = [createListItem('1', false, []), createListItem('2', false, [])];
    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={items} />);
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

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

    // Should render 2 items even though categories differ only in case
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('shows only filtered category when filter is set', () => {
    const items = [
      createListItem('1', false, [], { category: 'Produce' }),
      createListItem('2', false, [], { category: 'Dairy' }),
      createListItem('3', false, [], { category: 'Produce' }),
    ];

    render(
      <NotCompletedItemsSection
        {...baseProps}
        notCompletedItems={items}
        filter="Produce"
        displayedCategories={['Produce']}
      />,
    );

    // Only 'Produce' items should be shown
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('shows only uncategorized items when filter is "uncategorized"', () => {
    const items = [
      createListItem('1', false, [], { category: 'Produce' }),
      createListItem('2', false, []),
      createListItem('3', false, []),
    ];

    render(
      <NotCompletedItemsSection
        {...baseProps}
        notCompletedItems={items}
        filter="uncategorized"
        displayedCategories={['uncategorized']}
      />,
    );

    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('renders items with categories in addition to uncategorized', () => {
    const items = [createListItem('1', false, [], { category: 'Produce' }), createListItem('2', false, [])];

    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={items} />);

    // Both the categorized and uncategorized item should render
    expect(screen.getAllByTestId('list-item')).toHaveLength(2);
  });

  it('calls handleItemRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const item = createListItem('1', false, [], { category: 'foo' });
    render(<NotCompletedItemsSection {...baseProps} notCompletedItems={[item]} displayedCategories={['foo']} />);

    await user.click(screen.getByTestId('item-refresh'));
    expect(baseProps.handleItemRefresh).toHaveBeenCalledWith(item);
  });

  it('does not render category group when no items match', () => {
    const items = [createListItem('1', false, [], { category: 'Produce' })];

    render(
      <NotCompletedItemsSection
        {...baseProps}
        notCompletedItems={items}
        filter="Dairy"
        displayedCategories={['Dairy']}
      />,
    );

    expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();
  });
});
