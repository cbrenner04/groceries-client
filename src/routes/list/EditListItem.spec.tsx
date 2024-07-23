import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import EditListItem from './EditListItem';
import axios from '../../utils/api';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({
    id: '1',
    list_id: '1',
  }),
}));

describe('EditListItem', () => {
  const renderEditListItem = () => {
    return render(
      <MemoryRouter>
        <EditListItem />
      </MemoryRouter>,
    );
  };

  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = renderEditListItem();

    expect(await findByText('Loading...')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, getByRole } = renderEditListItem();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(getByRole('button')).toHaveTextContent('refresh the page');
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
