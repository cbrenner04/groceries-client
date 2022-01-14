import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import List from './List';
import axios from '../../utils/api';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({
    id: '1',
  }),
}));

describe('List', () => {
  const renderList = (newProps) => {
    return render(
      <MemoryRouter>
        <List {...newProps} />
      </MemoryRouter>,
    );
  };

  it('renders the Loading component when fetch request is pending', () => {
    const { container, getByText } = renderList();
    const status = getByText('Loading...');

    expect(container).toMatchSnapshot();
    expect(status).toBeTruthy();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByRole } = renderList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(getByRole('button')).toHaveTextContent('refresh the page');
  });

  it('displays List', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
        not_purchased_items: [],
        purchased_items: [],
        list: {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/22/2020').toISOString(),
          completed: false,
          owner_id: 'id1',
          refreshed: false,
        },
        categories: [],
        list_users: [{ id: 'id1', email: 'foo@example.com' }],
        permissions: 'write',
      },
    });
    const { container, getByText } = renderList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(container).toMatchSnapshot();
    expect(getByText('foo')).toBeVisible();
  });
});
