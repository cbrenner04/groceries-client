import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';

import axios from 'utils/api';

import BulkEditListItems from './BulkEditListItems';
import { EListItemFieldType, type IListItem } from 'typings';

describe('BulkEditListItems', () => {
  const renderBulkEditListItems = (): RenderResult =>
    render(
      <MemoryRouter initialEntries={['/lists/123/list_items/bulk-edit?item_ids=1,2,3']}>
        <Routes>
          <Route path="/lists/:list_id/list_items/bulk-edit" element={<BulkEditListItems />} />
        </Routes>
      </MemoryRouter>,
    );

  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = renderBulkEditListItems();
    const status = await findByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, findByRole } = renderBulkEditListItems();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('calls the correct API endpoint with search params', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        list: { id: '123', name: 'Test List', type: 'GroceryList' },
        lists: [],
        items: [],
        categories: [],
        list_users: [],
        list_item_configuration: { id: '1', name: 'Test Config' },
        list_item_field_configurations: [],
      },
    });

    renderBulkEditListItems();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));
    expect(axios.get).toHaveBeenCalledWith('/v2/lists/123/list_items/bulk_update?item_ids=1,2,3');
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
      {
        id: '2',
        archived_at: null,
        refreshed: false,
        completed: false,
        user_id: 'user1',
        list_id: '123',
        created_at: '2021-01-01',
        updated_at: '2021-01-01',
        fields: [
          {
            id: 'field3',
            list_item_field_configuration_id: 'config1',
            label: 'quantity',
            data: '3',
            archived_at: null,
            user_id: 'user1',
            list_item_id: '2',
            created_at: '2021-01-01',
            updated_at: '2021-01-01',
            position: 1,
            data_type: EListItemFieldType.NUMBER,
          },
          {
            id: 'field4',
            list_item_field_configuration_id: 'config2',
            label: 'product',
            data: 'Bananas',
            archived_at: null,
            user_id: 'user1',
            list_item_id: '2',
            created_at: '2021-01-01',
            updated_at: '2021-01-01',
            position: 2,
            data_type: EListItemFieldType.FREE_TEXT,
          },
        ],
      },
    ];

    const mockFieldConfigurations = [
      { id: 'config1', label: 'Quantity' },
      { id: 'config2', label: 'Notes' },
    ];

    axios.get = jest.fn().mockResolvedValue({
      data: {
        list: { id: '123', name: 'Test List', type: 'GroceryList' },
        lists: [],
        items: mockItems,
        categories: ['Fruits', 'Vegetables'],
        list_users: [],
        list_item_configuration: { id: '1', name: 'Test Config' },
        list_item_field_configurations: mockFieldConfigurations,
      },
    });

    const { findByText } = renderBulkEditListItems();

    // Wait for the API call to complete and form to render
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    // Check that the heading is rendered with item names
    const heading = await findByText('Edit 5 Apples, 3 Bananas');
    expect(heading).toBeTruthy();

    // Check that the form is rendered
    const form = await findByText('Update attributes for all items.');
    expect(form).toBeTruthy();

    // Check that the submit button is rendered
    const submitButton = await findByText('Update Items');
    expect(submitButton).toBeTruthy();

    // Check that the cancel button is rendered
    const cancelButton = await findByText('Cancel');
    expect(cancelButton).toBeTruthy();
  });
});
