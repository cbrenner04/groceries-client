import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';

import axios from 'utils/api';

import BulkEditListItems from './BulkEditListItems';
import { EListItemFieldType, type IListItem } from 'typings';

describe('BulkEditListItems', () => {
  const renderBulkEditListItems = (): RenderResult =>
    render(
      <MemoryRouter initialEntries={['/lists/123/list_items/bulk-edit']}>
        <Routes>
          <Route path="/lists/:list_id/list_items/bulk-edit" element={<BulkEditListItems />} />
        </Routes>
      </MemoryRouter>,
    );

  it('renders the Loading component when fetch request is pending', async () => {
    axios.get = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container, findByText } = renderBulkEditListItems();
    const status = await findByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = vi.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, findByRole } = renderBulkEditListItems();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('calls the correct API endpoint with search params', async () => {
    axios.get = vi.fn().mockResolvedValue({
      data: {
        current_user_id: 'user1',
        list: { id: '123', name: 'Test List' },
        not_completed_items: [],
        completed_items: [],
        list_users: [],
        permissions: 'write',
        lists_to_update: [],
        list_item_configuration: { id: '1', name: 'Test Config' },
        list_item_field_configurations: [],
        categories: [],
      },
    });

    renderBulkEditListItems();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(axios.get).toHaveBeenCalledWith('/lists/123', expect.any(Object));
  });

  it('renders the form with items when API call is successful', async () => {
    const mockItems: IListItem[] = [
      {
        id: '1',
        archived_at: null,
        refreshed: false,
        completed: false,
        user_id: 'user1',
        list_id: '123',
        created_at: '2021-01-01',
        updated_at: '2021-01-01',
        fields: [
          {
            id: 'field1',
            list_item_field_configuration_id: 'config1',
            label: 'quantity',
            data: '5',
            archived_at: null,
            user_id: 'user1',
            list_item_id: '1',
            created_at: '2021-01-01',
            updated_at: '2021-01-01',
            position: 1,
            data_type: EListItemFieldType.NUMBER,
          },
          {
            id: 'field2',
            list_item_field_configuration_id: 'config2',
            label: 'product',
            data: 'Apples',
            archived_at: null,
            user_id: 'user1',
            list_item_id: '1',
            created_at: '2021-01-01',
            updated_at: '2021-01-01',
            position: 2,
            data_type: EListItemFieldType.FREE_TEXT,
          },
        ],
      },
    ];

    const mockFieldConfigurations = [
      {
        id: 'config1',
        label: 'Quantity',
        data_type: 'number',
        position: 1,
        list_item_configuration_id: '1',
        user_id: 'user1',
        created_at: '2021-01-01',
        updated_at: '2021-01-01',
        archived_at: null,
      },
      {
        id: 'config2',
        label: 'Notes',
        data_type: 'free_text',
        position: 2,
        list_item_configuration_id: '1',
        user_id: 'user1',
        created_at: '2021-01-01',
        updated_at: '2021-01-01',
        archived_at: null,
      },
    ];

    axios.get = vi.fn().mockResolvedValue({
      data: {
        current_user_id: 'user1',
        list: { id: '123', name: 'Test List' },
        not_completed_items: mockItems,
        completed_items: [],
        list_users: [],
        permissions: 'write',
        lists_to_update: [],
        list_item_configuration: { id: '1', name: 'Test Config' },
        list_item_field_configurations: mockFieldConfigurations,
        categories: ['Fruits', 'Vegetables'],
      },
    });

    const { findByText } = renderBulkEditListItems();

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    const heading = await findByText('Edit Items');
    expect(heading).toBeTruthy();

    const form = await findByText('Update attributes for all items.');
    expect(form).toBeTruthy();

    const submitButton = await findByText('Update Items');
    expect(submitButton).toBeTruthy();

    const cancelButton = await findByText('Cancel');
    expect(cancelButton).toBeTruthy();
  });
});
