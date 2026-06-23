import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { ListCard, type IListCardProps } from './ListCard';
import { createList } from 'test-utils/factories';

interface ISetupReturn extends RenderResult {
  props: IListCardProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IListCardProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps: IListCardProps = {
    list: createList('list1', 'Test List'),
    userId: 'id1',
    currentUserPermissions: { list1: 'write' },
    isMultiSelectActive: false,
    isSelected: false,
    onSelect: vi.fn(),
    onComplete: vi.fn(),
    onShare: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onRefresh: vi.fn(),
    onAccept: vi.fn(),
    onReject: vi.fn(),
    onClick: vi.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ListCard {...props} />);
  return { ...component, props, user };
}

describe('ListCard', () => {
  describe('rendering', () => {
    it('renders list name', async () => {
      const { findByText } = setup();
      expect(await findByText('Test List')).toBeVisible();
    });

    it('renders with data-test-id list-{id}', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="list-list1"]')).toBeInTheDocument();
    });

    it('renders list-name data-test-id', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="list-name"]')).toBeInTheDocument();
    });

    it('shows refreshed indicator when list is refreshed', () => {
      const { container } = setup({ list: createList('list1', 'Test List', 'config1', { refreshed: true }) });
      const listName = container.querySelector('[data-test-id="list-name"]');
      expect(listName?.textContent).toContain('*');
    });

    it('does not show refreshed indicator when list is not refreshed', () => {
      const { container } = setup();
      const listName = container.querySelector('[data-test-id="list-name"]');
      expect(listName?.textContent).not.toContain('*');
    });
  });

  describe('incomplete list (owned)', () => {
    it('has incomplete-list data-test-class', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-class="incomplete-list"]')).toBeInTheDocument();
    });

    it('renders Complete button', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="incomplete-list-complete"]')).toBeInTheDocument();
    });

    it('renders Share button', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="incomplete-list-share"]')).toBeInTheDocument();
    });

    it('renders Edit button', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="incomplete-list-edit"]')).toBeInTheDocument();
    });

    it('renders Delete button', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="incomplete-list-trash"]')).toBeInTheDocument();
    });

    it('calls onComplete when Complete is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="incomplete-list-complete"]') as HTMLElement;
      await user.click(btn);
      expect(props.onComplete).toHaveBeenCalledWith('list1');
    });

    it('calls onShare when Share is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="incomplete-list-share"]') as HTMLElement;
      await user.click(btn);
      expect(props.onShare).toHaveBeenCalledWith('list1');
    });

    it('calls onEdit when Edit is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="incomplete-list-edit"]') as HTMLElement;
      await user.click(btn);
      expect(props.onEdit).toHaveBeenCalledWith('list1');
    });

    it('calls onDelete when Delete is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="incomplete-list-trash"]') as HTMLElement;
      await user.click(btn);
      expect(props.onDelete).toHaveBeenCalledWith('list1');
    });

    it('does not call onClick when Delete is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="incomplete-list-trash"]') as HTMLElement;
      await user.click(btn);
      expect(props.onClick).not.toHaveBeenCalled();
    });
  });

  describe('incomplete list (shared, write)', () => {
    function sharedWriteSetup(overrides: Partial<IListCardProps> = {}): ISetupReturn {
      return setup({
        list: createList('list1', 'Shared List', 'config1', { owner_id: 'other-user' }),
        currentUserPermissions: { list1: 'write' },
        ...overrides,
      });
    }

    it('renders Share button for shared write user', () => {
      const { container } = sharedWriteSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-share"]')).toBeInTheDocument();
    });

    it('renders Delete button', () => {
      const { container } = sharedWriteSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-trash"]')).toBeInTheDocument();
    });

    it('does not render Complete button (not owner)', () => {
      const { container } = sharedWriteSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-complete"]')).not.toBeInTheDocument();
    });

    it('does not render Edit button (not owner)', () => {
      const { container } = sharedWriteSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-edit"]')).not.toBeInTheDocument();
    });
  });

  describe('incomplete list (shared, read)', () => {
    function sharedReadSetup(overrides: Partial<IListCardProps> = {}): ISetupReturn {
      return setup({
        list: createList('list1', 'Read Only List', 'config1', { owner_id: 'other-user' }),
        currentUserPermissions: { list1: 'read' },
        ...overrides,
      });
    }

    it('renders Delete button', () => {
      const { container } = sharedReadSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-trash"]')).toBeInTheDocument();
    });

    it('does not render Complete button', () => {
      const { container } = sharedReadSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-complete"]')).not.toBeInTheDocument();
    });

    it('does not render Share button', () => {
      const { container } = sharedReadSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-share"]')).not.toBeInTheDocument();
    });

    it('does not render Edit button', () => {
      const { container } = sharedReadSetup();
      expect(container.querySelector('[data-test-id="incomplete-list-edit"]')).not.toBeInTheDocument();
    });
  });

  describe('completed list (owned)', () => {
    function completedSetup(overrides: Partial<IListCardProps> = {}): ISetupReturn {
      return setup({
        list: createList('list1', 'Done List', 'config1', { completed: true }),
        currentUserPermissions: { list1: 'write' },
        ...overrides,
      });
    }

    it('has completed-list data-test-class', () => {
      const { container } = completedSetup();
      expect(container.querySelector('[data-test-class="completed-list"]')).toBeInTheDocument();
    });

    it('renders Refresh button', () => {
      const { container } = completedSetup();
      expect(container.querySelector('[data-test-id="complete-list-refresh"]')).toBeInTheDocument();
    });

    it('renders Delete button', () => {
      const { container } = completedSetup();
      expect(container.querySelector('[data-test-id="complete-list-trash"]')).toBeInTheDocument();
    });

    it('calls onRefresh when Refresh is clicked', async () => {
      const { container, props, user } = completedSetup();
      const btn = container.querySelector('[data-test-id="complete-list-refresh"]') as HTMLElement;
      await user.click(btn);
      expect(props.onRefresh).toHaveBeenCalledWith('list1');
    });

    it('calls onDelete when Delete is clicked', async () => {
      const { container, props, user } = completedSetup();
      const btn = container.querySelector('[data-test-id="complete-list-trash"]') as HTMLElement;
      await user.click(btn);
      expect(props.onDelete).toHaveBeenCalledWith('list1');
    });
  });

  describe('completed list (shared)', () => {
    function completedSharedSetup(): ISetupReturn {
      return setup({
        list: createList('list1', 'Shared Done', 'config1', { completed: true, owner_id: 'other-user' }),
        currentUserPermissions: { list1: 'read' },
      });
    }

    it('renders Delete button', () => {
      const { container } = completedSharedSetup();
      expect(container.querySelector('[data-test-id="complete-list-trash"]')).toBeInTheDocument();
    });
  });

  describe('pending list', () => {
    function pendingSetup(overrides: Partial<IListCardProps> = {}): ISetupReturn {
      return setup({
        list: createList('list1', 'Pending List', 'config-1', { has_accepted: null }),
        currentUserPermissions: {},
        ...overrides,
      });
    }

    it('has pending-list data-test-class', () => {
      const { container } = pendingSetup();
      expect(container.querySelector('[data-test-class="pending-list"]')).toBeInTheDocument();
    });

    it('renders Accept button', () => {
      const { container } = pendingSetup();
      expect(container.querySelector('[data-test-id="pending-list-accept"]')).toBeInTheDocument();
    });

    it('renders Reject button', () => {
      const { container } = pendingSetup();
      expect(container.querySelector('[data-test-id="pending-list-trash"]')).toBeInTheDocument();
    });

    it('calls onAccept when Accept is clicked', async () => {
      const { container, props, user } = pendingSetup();
      const btn = container.querySelector('[data-test-id="pending-list-accept"]') as HTMLElement;
      await user.click(btn);
      expect(props.onAccept).toHaveBeenCalledWith('list1');
    });

    it('calls onReject when Reject is clicked', async () => {
      const { container, props, user } = pendingSetup();
      const btn = container.querySelector('[data-test-id="pending-list-trash"]') as HTMLElement;
      await user.click(btn);
      expect(props.onReject).toHaveBeenCalledWith('list1');
    });
  });

  describe('multi-select', () => {
    it('shows checkbox when multi-select is active', () => {
      const { container } = setup({ isMultiSelectActive: true });
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });

    it('does not show checkbox when multi-select is inactive', () => {
      const { container } = setup({ isMultiSelectActive: false });
      expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    it('checkbox is checked when selected', () => {
      const { container } = setup({ isMultiSelectActive: true, isSelected: true });
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('checkbox is unchecked when not selected', () => {
      const { container } = setup({ isMultiSelectActive: true, isSelected: false });
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('calls onSelect when checkbox is clicked', async () => {
      const { container, props, user } = setup({ isMultiSelectActive: true });
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLElement;
      await user.click(checkbox);
      expect(props.onSelect).toHaveBeenCalledWith('list1');
    });

    it('calls onSelect when card is clicked in multi-select mode', async () => {
      const { container, props, user } = setup({ isMultiSelectActive: true });
      const card = container.querySelector('[data-test-id="list-list1"]') as HTMLElement;
      await user.click(card);
      expect(props.onSelect).toHaveBeenCalled();
    });

    it('hides action buttons for incomplete lists in multi-select mode', () => {
      const { container } = setup({ isMultiSelectActive: true });
      expect(container.querySelector('[data-test-id="incomplete-list-complete"]')).not.toBeInTheDocument();
      expect(container.querySelector('[data-test-id="incomplete-list-share"]')).not.toBeInTheDocument();
      expect(container.querySelector('[data-test-id="incomplete-list-edit"]')).not.toBeInTheDocument();
      expect(container.querySelector('[data-test-id="incomplete-list-trash"]')).not.toBeInTheDocument();
    });

    it('shows action buttons for pending lists in multi-select mode', () => {
      const { container } = setup({
        isMultiSelectActive: true,
        list: createList('list1', 'Test List', 'config1', { has_accepted: null }),
      });
      expect(container.querySelector('[data-test-id="pending-list-accept"]')).toBeInTheDocument();
      expect(container.querySelector('[data-test-id="pending-list-trash"]')).toBeInTheDocument();
      expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    it('shows action buttons for completed lists in multi-select mode', () => {
      const { container } = setup({
        isMultiSelectActive: true,
        list: createList('list1', 'Test List', 'config1', { completed: true }),
      });
      expect(container.querySelector('[data-test-id="complete-list-refresh"]')).toBeInTheDocument();
      expect(container.querySelector('[data-test-id="complete-list-trash"]')).toBeInTheDocument();
      expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    it('applies selected visual state when isSelected is true', () => {
      const { container } = setup({ isMultiSelectActive: true, isSelected: true });
      const card = container.querySelector('[data-test-id="list-list1"]');
      expect(card?.className).toContain('border-[var(--color-primary)]');
    });
  });

  describe('navigation', () => {
    it('calls onClick when card is clicked (not in multi-select)', async () => {
      const { container, props, user } = setup();
      const card = container.querySelector('[data-test-id="list-list1"]') as HTMLElement;
      await user.click(card);
      expect(props.onClick).toHaveBeenCalledWith('list1');
    });

    it('has role="button" and tabIndex for keyboard access', () => {
      const { container } = setup();
      const card = container.querySelector('[data-test-id="list-list1"]');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('calls onClick when Enter key is pressed', async () => {
      const { container, props, user } = setup();
      const card = container.querySelector('[data-test-id="list-list1"]') as HTMLElement;
      card.focus();
      await user.keyboard('{Enter}');
      expect(props.onClick).toHaveBeenCalledWith('list1');
    });

    it('calls onClick when Space key is pressed', async () => {
      const { container, props, user } = setup();
      const card = container.querySelector('[data-test-id="list-list1"]') as HTMLElement;
      card.focus();
      await user.keyboard(' ');
      expect(props.onClick).toHaveBeenCalledWith('list1');
    });

    it('calls onSelect on Enter key in multi-select mode', async () => {
      const { container, props, user } = setup({ isMultiSelectActive: true });
      const card = container.querySelector('[data-test-id="list-list1"]') as HTMLElement;
      card.focus();
      await user.keyboard('{Enter}');
      expect(props.onSelect).toHaveBeenCalledWith('list1');
    });
  });
});
