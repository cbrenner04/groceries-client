import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultTestData, createListItem, createField } from 'test-utils/factories';
import type { IListItemFieldConfiguration } from 'typings';
import BulkEditSheet from './BulkEditSheet';

vi.mock('../containers/BulkEditListItemsForm', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any): React.JSX.Element => (
    <div>
      <div>Update attributes for all items.</div>
      <button onClick={() => props.navigate(`/lists/${props.list.id}`)}>Save to list</button>
      <button onClick={() => props.navigate('/other-path')}>Navigate elsewhere</button>
      <button onClick={props.onCancel}>Cancel</button>
    </div>
  ),
}));

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

  it('calls onSave when navigate is called with the list URL', async () => {
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

    await userEvent.click(getByText('Save to list'));
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('sets window.location.href when navigate is called with a non-list URL', async () => {
    const locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      href: '',
    } as Location);
    let capturedHref = '';
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        set href(url: string) {
          capturedHref = url;
        },
      },
      writable: true,
      configurable: true,
    });

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

    await userEvent.click(getByText('Navigate elsewhere'));
    expect(capturedHref).toBe('/other-path');
    expect(mockOnSave).not.toHaveBeenCalled();

    locationSpy.mockRestore();
  });
});
