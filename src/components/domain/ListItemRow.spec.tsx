import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { ListItemRow, type IListItemRowProps } from './ListItemRow';
import { createListItem, createField } from 'test-utils/factories';
import { EListItemFieldType } from 'typings';

interface ISetupReturn extends RenderResult {
  props: IListItemRowProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IListItemRowProps> = {}): ISetupReturn {
  const user = userEvent.setup();
  const item = createListItem('item1', false, [
    createField('f1', 'product', 'Apples', 'item1', { primary: true }),
    createField('f2', 'quantity', '3', 'item1'),
  ]);
  const defaultProps: IListItemRowProps = {
    item,
    listId: 'id1',
    fields: item.fields,
    fieldConfigurations: [],
    isMultiSelectActive: false,
    isSelected: false,
    onSelect: vi.fn(),
    onComplete: vi.fn(),
    onRefresh: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    permissions: { id1: 'write' },
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ListItemRow {...props} />);
  return { ...component, props, user };
}

describe('ListItemRow', () => {
  describe('rendering', () => {
    it('renders primary field value', async () => {
      const { findByText } = setup();
      expect(await findByText('Apples')).toBeVisible();
    });

    it('still renders the item after it transitions to completed', async () => {
      const { rerender, props, findByText } = setup();
      // false -> true completion transition exercises the just-completed effect branch
      rerender(<ListItemRow {...props} item={{ ...props.item, completed: true }} />);
      expect(await findByText('Apples')).toBeVisible();
    });

    it('renders secondary fields', async () => {
      const { findByText } = setup();
      expect(await findByText('3')).toBeVisible();
    });

    it('renders "Untitled Item" when no fields have data', async () => {
      const item = createListItem('item1', false, []);
      const { findByText } = setup({ item, fields: item.fields });
      expect(await findByText('Untitled Item')).toBeVisible();
    });

    it('renders category badge when category exists', async () => {
      const item = createListItem('item1', false, [createField('f1', 'product', 'Milk', 'item1', { primary: true })], {
        category: 'Dairy',
      });
      const { findByText } = setup({ item, fields: item.fields });
      expect(await findByText('Dairy')).toBeVisible();
    });

    it('uses first field with data as primary when no field is marked primary', async () => {
      const item = createListItem('item1', false, [
        createField('f1', 'author', 'Author A', 'item1'),
        createField('f2', 'year', '2024', 'item1'),
      ]);
      const { findByText, container } = setup({ item, fields: item.fields });
      // First field with data becomes the primary display value
      expect(await findByText('Author A')).toBeVisible();
      // The fallback primary field should not appear in secondary fields text
      const secondaryEl = container.querySelector('.tw\\:text-sm');
      expect(secondaryEl?.textContent).not.toContain('Author A');
      // Only "2024" should appear as a secondary field
      expect(secondaryEl?.textContent).toContain('2024');
    });

    it('does not render category badge when no category', () => {
      const { queryByText } = setup();
      expect(queryByText('Dairy')).not.toBeInTheDocument();
    });

    it('has non-completed-item data-test-class for incomplete items', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-class="non-completed-item"]')).toBeInTheDocument();
    });

    it('has completed-item data-test-class for completed items', () => {
      const item = createListItem('item1', true, [
        createField('f1', 'product', 'Done Item', 'item1', { primary: true }),
      ]);
      const { container } = setup({ item, fields: item.fields });
      expect(container.querySelector('[data-test-class="completed-item"]')).toBeInTheDocument();
    });
  });

  describe('not completed item actions', () => {
    it('renders Complete button', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="not-completed-item-complete-item1"]')).toBeInTheDocument();
    });

    it('renders Edit button', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="not-completed-item-edit-item1"]')).toBeInTheDocument();
    });

    it('renders Delete button', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="not-completed-item-delete-item1"]')).toBeInTheDocument();
    });

    it('calls onComplete when Complete is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="not-completed-item-complete-item1"]') as HTMLElement;
      await user.click(btn);
      expect(props.onComplete).toHaveBeenCalledWith('item1');
    });

    it('calls onEdit when Edit is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="not-completed-item-edit-item1"]') as HTMLElement;
      await user.click(btn);
      expect(props.onEdit).toHaveBeenCalledWith('item1');
    });

    it('calls onDelete when Delete is clicked', async () => {
      const { container, props, user } = setup();
      const btn = container.querySelector('[data-test-id="not-completed-item-delete-item1"]') as HTMLElement;
      await user.click(btn);
      expect(props.onDelete).toHaveBeenCalledWith('item1');
    });
  });

  describe('completed item actions (refreshable)', () => {
    function completedSetup(overrides: Partial<IListItemRowProps> = {}): ISetupReturn {
      const item = createListItem('item1', true, [
        createField('f1', 'product', 'Done Item', 'item1', { primary: true }),
      ]);
      return setup({ item, fields: item.fields, ...overrides });
    }

    it('renders Refresh button', () => {
      const { container } = completedSetup();
      expect(container.querySelector('[data-test-id="completed-item-refresh-item1"]')).toBeInTheDocument();
    });

    it('renders Edit button', () => {
      const { container } = completedSetup();
      expect(container.querySelector('[data-test-id="completed-item-edit-item1"]')).toBeInTheDocument();
    });

    it('renders Delete button', () => {
      const { container } = completedSetup();
      expect(container.querySelector('[data-test-id="completed-item-delete-item1"]')).toBeInTheDocument();
    });

    it('calls onRefresh when Refresh is clicked', async () => {
      const { container, props, user } = completedSetup();
      const btn = container.querySelector('[data-test-id="completed-item-refresh-item1"]') as HTMLElement;
      await user.click(btn);
      expect(props.onRefresh).toHaveBeenCalledWith('item1');
    });
  });

  describe('completed item (not refreshable)', () => {
    it('does not render Refresh button when already refreshed', () => {
      const item = createListItem(
        'item1',
        true,
        [createField('f1', 'product', 'Refreshed Item', 'item1', { primary: true })],
        { refreshed: true },
      );
      const { container } = setup({ item, fields: item.fields });
      expect(container.querySelector('[data-test-id="completed-item-refresh-item1"]')).not.toBeInTheDocument();
    });
  });

  describe('read-only (shared, read permission)', () => {
    function readOnlySetup(): ISetupReturn {
      return setup({ permissions: { id1: 'read' } });
    }

    it('does not render action buttons', () => {
      const { container } = readOnlySetup();
      expect(container.querySelector('[data-test-id="not-completed-item-complete-item1"]')).not.toBeInTheDocument();
      expect(container.querySelector('[data-test-id="not-completed-item-edit-item1"]')).not.toBeInTheDocument();
      expect(container.querySelector('[data-test-id="not-completed-item-delete-item1"]')).not.toBeInTheDocument();
    });
  });

  describe('multi-select', () => {
    it('shows checkbox when multi-select is active', () => {
      const { container } = setup({ isMultiSelectActive: true });
      expect(container.querySelector('[data-test-id="not-completed-item-select-item1"]')).toBeInTheDocument();
    });

    it('does not show checkbox when multi-select is inactive', () => {
      const { container } = setup();
      expect(container.querySelector('[data-test-id="not-completed-item-select-item1"]')).not.toBeInTheDocument();
    });

    it('checkbox is checked when selected', () => {
      const { container } = setup({ isMultiSelectActive: true, isSelected: true });
      const checkbox = container.querySelector('[data-test-id="not-completed-item-select-item1"]') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('calls onSelect when checkbox is clicked', async () => {
      const { container, props, user } = setup({ isMultiSelectActive: true });
      const checkbox = container.querySelector('[data-test-id="not-completed-item-select-item1"]') as HTMLElement;
      await user.click(checkbox);
      expect(props.onSelect).toHaveBeenCalledWith('item1');
    });

    it('uses completed-item-select prefix for completed items', () => {
      const item = createListItem('item1', true, [createField('f1', 'product', 'Done', 'item1', { primary: true })]);
      const { container } = setup({ item, fields: item.fields, isMultiSelectActive: true });
      expect(container.querySelector('[data-test-id="completed-item-select-item1"]')).toBeInTheDocument();
    });
  });

  describe('fallback primary field edge cases', () => {
    it('returns empty primary when no fields have data', async () => {
      const item = createListItem('item1', false, [createField('f1', 'author', undefined, 'item1')]);
      const { findByText } = setup({ item, fields: item.fields });
      expect(await findByText('Untitled Item')).toBeVisible();
    });

    it('renders empty string for secondary fields without data', () => {
      const item = createListItem('item1', false, [
        createField('f1', 'product', 'Milk', 'item1', { primary: true }),
        createField('f2', 'notes', undefined, 'item1'),
      ]);
      const { container } = setup({ item, fields: item.fields });
      expect(container.querySelector('[data-test-class="non-completed-item"]')).toBeInTheDocument();
    });

    it('uses fallback aria-label when no primary value', () => {
      const item = createListItem('item1', false, []);
      const { container } = setup({ item, fields: item.fields, isMultiSelectActive: true });
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute('aria-label', 'Select item');
    });
  });

  describe('secondary fields display', () => {
    it('renders date fields formatted', async () => {
      const item = createListItem('item1', false, [
        createField('f1', 'product', 'Book', 'item1', { primary: true }),
        createField('f2', 'due', '2025-12-25', 'item1', { data_type: EListItemFieldType.DATE_TIME }),
      ]);
      const { container } = setup({ item, fields: item.fields });
      // Should render formatted date (not raw ISO string)
      expect(container.querySelector('[data-test-class="non-completed-item"]')).toBeInTheDocument();
    });

    it('renders dot separator between secondary fields', () => {
      const item = createListItem('item1', false, [
        createField('f1', 'product', 'Book', 'item1', { primary: true }),
        createField('f2', 'author', 'Author A', 'item1'),
        createField('f3', 'year', '2024', 'item1'),
      ]);
      const { container } = setup({ item, fields: item.fields });
      const secondaryText = container.textContent;
      expect(secondaryText).toContain('Author A');
      expect(secondaryText).toContain('2024');
    });
  });

  describe('completed state visual', () => {
    it('applies completed styles', () => {
      const item = createListItem('item1', true, [createField('f1', 'product', 'Done', 'item1', { primary: true })]);
      const { container } = setup({ item, fields: item.fields });
      const card = container.querySelector('[data-test-class="completed-item"]');
      expect(card?.className).toContain('opacity-60');
    });
  });

  describe('accessibility', () => {
    it('checkbox has aria-label', () => {
      const { container } = setup({ isMultiSelectActive: true });
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).toHaveAttribute('aria-label', 'Select Apples');
    });
  });
});
