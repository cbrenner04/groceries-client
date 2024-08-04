import React from 'react';
import { render, waitFor, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import axios from 'utils/api';

import EditListItem from './EditListItem';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): jest.Mock => jest.fn(),
  useParams: (): { id: string; list_id: string } => ({
    id: '1',
    list_id: '1',
  }),
}));

describe('EditListItem', () => {
  const renderEditListItem = (): RenderResult =>
    render(
      <MemoryRouter>
        <EditListItem />
      </MemoryRouter>,
    );

  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = renderEditListItem();
    const status = await findByText('Loading...');

    expect(status).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, findByRole } = renderEditListItem();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('displays EditListItem', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        item: {
          user_id: 'id1',
          id: 'id1',
          product: 'foo',
        },
        list: {
          id: 'id1',
          type: 'GroceryList',
          name: 'foo',
          completed: false,
          refreshed: false,
          created_at: 'some date',
          owner_id: 'id1',
        },
        list_users: [{ id: 'id1', email: 'foo@example.com' }],
        categories: [],
      },
    });
    const { container, findByText } = renderEditListItem();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByText('Update Item')).toBeVisible();
    expect(container).toMatchSnapshot();
  });
});
