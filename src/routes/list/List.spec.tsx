import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import List from './List';
import axios from '../../utils/api';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: (): jest.Mock => jest.fn(),
  useParams: (): { id: string } => ({
    id: '1',
  }),
}));

describe('List', () => {
  const renderList = (): RenderResult => {
    return render(
      <MemoryRouter>
        <List />
      </MemoryRouter>,
    );
  };

  it('renders the Loading component when fetch request is pending', async () => {
    const { container, findByText } = renderList();

    expect(await findByText('Loading...')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  it('displays UnknownError when an error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { container, findByRole } = renderList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
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
    const { container, findByText } = renderList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByText('foo')).toBeVisible();
    expect(container).toMatchSnapshot();
  });
});
