import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EUserPermissions } from 'typings';
import { createListItem, createField } from 'test-utils/factories';

import CompletedItemsSection from './CompletedItemsSection';

vi.mock('components/domain/ListItemRow', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListItemRow: (props: any): React.JSX.Element => (
    <div data-test-id="list-item">
      {props.item.id}
      <button data-test-id="item-select" onClick={() => props.onSelect(props.item.id)}>
        select
      </button>
      <button data-test-id="item-complete" onClick={() => props.onComplete(props.item.id)}>
        complete
      </button>
      <button data-test-id="item-refresh" onClick={() => props.onRefresh(props.item.id)}>
        refresh
      </button>
      <button data-test-id="item-edit" onClick={() => props.onEdit(props.item.id)}>
        edit
      </button>
    </div>
  ),
}));

vi.mock('components/ui/Badge', () => ({
  __esModule: true,
  Badge: (props: { children: React.ReactNode }): React.JSX.Element => <span>{props.children}</span>,
}));

const baseProps = {
  completedItems: [],
  permissions: EUserPermissions.READ,
  selectedItems: [],
  pending: false,
  completeMultiSelect: false,
  setCopy: vi.fn(),
  setMove: vi.fn(),
  setSelectedItems: vi.fn(),
  setCompleteMultiSelect: vi.fn(),
  handleItemSelect: vi.fn(),
  handleItemComplete: vi.fn().mockResolvedValue(undefined),
  handleItemEdit: vi.fn(),
  handleItemDelete: vi.fn(),
  handleItemRefresh: vi.fn().mockResolvedValue(undefined),
};

describe('CompletedItemsSection', () => {
  it('renders nothing when completedItems is empty', () => {
    const { container } = render(<CompletedItemsSection {...baseProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the completed header when items exist', () => {
    const items = [createListItem('1', true, [createField('f1', 'product', 'Milk', '1', { primary: true })])];
    render(<CompletedItemsSection {...baseProps} completedItems={items} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('shows item count in badge', () => {
    const items = [createListItem('1', true, []), createListItem('2', true, [])];
    render(<CompletedItemsSection {...baseProps} completedItems={items} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('expands to show items when completedExpanded is true', () => {
    const items = [createListItem('1', true, [])];
    render(<CompletedItemsSection {...baseProps} completedItems={items} completedExpanded={true} />);
    expect(screen.getByTestId('list-item')).toBeInTheDocument();
  });

  it('hides items when completedExpanded is false', () => {
    const items = [createListItem('1', true, [])];
    render(<CompletedItemsSection {...baseProps} completedItems={items} completedExpanded={false} />);
    expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();
  });

  it('uses local state when setCompletedExpanded is not provided', async () => {
    const user = userEvent.setup();
    const items = [createListItem('1', true, [])];
    render(<CompletedItemsSection {...baseProps} completedItems={items} />);

    // Initially collapsed (default when no completedExpanded prop)
    expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();

    // Toggle to expand
    const header = document.querySelector('[data-test-class="completed-header"]') as HTMLElement;
    await user.click(header);
    expect(screen.getByTestId('list-item')).toBeInTheDocument();

    // Toggle to collapse
    await user.click(header);
    expect(screen.queryByTestId('list-item')).not.toBeInTheDocument();
  });

  it('calls setCompletedExpanded when provided and header is clicked', async () => {
    const user = userEvent.setup();
    const mockSetExpanded = vi.fn();
    const items = [createListItem('1', true, [])];
    render(
      <CompletedItemsSection
        {...baseProps}
        completedItems={items}
        completedExpanded={false}
        setCompletedExpanded={mockSetExpanded}
      />,
    );

    const header = document.querySelector('[data-test-class="completed-header"]') as HTMLElement;
    await user.click(header);
    expect(mockSetExpanded).toHaveBeenCalledWith(true);
  });

  it('renders multiple items when expanded', () => {
    const items = [createListItem('1', true, []), createListItem('2', true, []), createListItem('3', true, [])];
    render(<CompletedItemsSection {...baseProps} completedItems={items} completedExpanded={true} />);
    expect(screen.getAllByTestId('list-item')).toHaveLength(3);
  });

  it('calls handleItemSelect when select button is clicked', async () => {
    const user = userEvent.setup();
    const item = createListItem('1', true, [createField('f1', 'product', 'Milk', '1', { primary: true })]);
    render(<CompletedItemsSection {...baseProps} completedItems={[item]} completedExpanded={true} />);

    await user.click(screen.getByTestId('item-select'));
    expect(baseProps.handleItemSelect).toHaveBeenCalledWith(item);
  });

  it('calls handleItemComplete when complete button is clicked', async () => {
    const user = userEvent.setup();
    const item = createListItem('1', true, [createField('f1', 'product', 'Milk', '1', { primary: true })]);
    render(<CompletedItemsSection {...baseProps} completedItems={[item]} completedExpanded={true} />);

    await user.click(screen.getByTestId('item-complete'));
    expect(baseProps.handleItemComplete).toHaveBeenCalledWith(item);
  });

  it('calls handleItemRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const item = createListItem('1', true, [createField('f1', 'product', 'Milk', '1', { primary: true })]);
    render(<CompletedItemsSection {...baseProps} completedItems={[item]} completedExpanded={true} />);

    await user.click(screen.getByTestId('item-refresh'));
    expect(baseProps.handleItemRefresh).toHaveBeenCalledWith(item);
  });

  it('calls handleItemEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    const item = createListItem('1', true, [createField('f1', 'product', 'Milk', '1', { primary: true })]);
    render(<CompletedItemsSection {...baseProps} completedItems={[item]} completedExpanded={true} />);

    await user.click(screen.getByTestId('item-edit'));
    expect(baseProps.handleItemEdit).toHaveBeenCalledWith(item);
  });

  it('has correct aria-expanded attribute on the header button', () => {
    const items = [createListItem('1', true, [])];
    const mockSetExpanded = vi.fn();
    const { rerender } = render(
      <CompletedItemsSection
        {...baseProps}
        completedItems={items}
        completedExpanded={true}
        setCompletedExpanded={mockSetExpanded}
      />,
    );

    const header = document.querySelector('[data-test-class="completed-header"]') as HTMLElement;
    expect(header).toHaveAttribute('aria-expanded', 'true');

    rerender(
      <CompletedItemsSection
        {...baseProps}
        completedItems={items}
        completedExpanded={false}
        setCompletedExpanded={mockSetExpanded}
      />,
    );
    expect(header).toHaveAttribute('aria-expanded', 'false');
  });
});
