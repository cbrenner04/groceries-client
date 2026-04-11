import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultTestData, createListItem, createField } from 'test-utils/factories';
import type { IListItemFieldConfiguration } from 'typings';
import BulkEditSheet from './BulkEditSheet';

describe('BulkEditSheet', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const listId = 'list123';
  const items = [
    createListItem('item1', false, [createField('field1', 'product', 'Item 1', 'config1')]),
    createListItem('item2', false, [createField('field2', 'product', 'Item 2', 'config1')]),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bulk edit sheet with title', () => {
    const { getByText } = render(
      <BulkEditSheet
        listId={listId}
        items={items}
        lists={defaultTestData.listsToUpdate}
        categories={defaultTestData.categories}
        listItemConfiguration={defaultTestData.listItemConfiguration}
        listItemFieldConfigurations={
          (defaultTestData.listItemConfigurations || []) as unknown as IListItemFieldConfiguration[]
        }
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    expect(getByText('Edit Items')).toBeInTheDocument();
  });

  it('calls onClose when bottom sheet is closed', async () => {
    const { getByRole } = render(
      <BulkEditSheet
        listId={listId}
        items={items}
        lists={defaultTestData.listsToUpdate}
        categories={defaultTestData.categories}
        listItemConfiguration={defaultTestData.listItemConfiguration}
        listItemFieldConfigurations={
          (defaultTestData.listItemConfigurations || []) as unknown as IListItemFieldConfiguration[]
        }
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    // Click the overlay to close
    const overlay = getByRole('dialog');
    await userEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders form fields for bulk edit', () => {
    const { getByText } = render(
      <BulkEditSheet
        listId={listId}
        items={items}
        lists={defaultTestData.listsToUpdate}
        categories={defaultTestData.categories}
        listItemConfiguration={defaultTestData.listItemConfiguration}
        listItemFieldConfigurations={
          (defaultTestData.listItemConfigurations || []) as unknown as IListItemFieldConfiguration[]
        }
        onClose={mockOnClose}
        onSave={mockOnSave}
      />,
    );

    expect(getByText('Update attributes for all items.')).toBeInTheDocument();
  });
});
