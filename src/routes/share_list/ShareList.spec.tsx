import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import ShareList from './ShareList';
import axios from '../../utils/api';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => require('test-utils').mockNavigate,
  useParams: (): { list_id: string } => ({
    list_id: '1',
  }),
}));

describe('ShareList', () => {
  const renderShareList = (): RenderResult =>
    render(
      <MemoryRouter>
        <ShareList />
      </MemoryRouter>,
    );

  it('renders loading when data fetch is not complete', async () => {
    const { container, findByText } = renderShareList();

    expect(await findByText('Loading...')).toBeVisible();
    expect(container).toMatchSnapshot();
  });

  it('renders unknown error component when error occurs', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 400 } });
    const { container, findByRole } = renderShareList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByRole('button')).toHaveTextContent('refresh the page');
    expect(container).toMatchSnapshot();
  });

  it('renders ShareList when data fetch is successful', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        accepted: [
          { user: { id: 'id1', email: 'foo@example.com' }, users_list: { id: 'id1', permissions: 'read' } },
          { user: { id: 'id4', email: 'foobaz@example.com' }, users_list: { id: 'id4', permissions: 'write' } },
        ],
        pending: [{ user: { id: 'id2', email: 'bar@example.com' }, users_list: { id: 'id2', permissions: 'write' } }],
        refused: [{ user: { id: 'id3', email: 'baz@example.com' }, users_list: { id: 'id3', permissions: 'read' } }],
        current_user_id: 'id4',
        user_is_owner: true,
        invitable_users: [{ id: 'id5', email: 'foobar@example.com' }],
        list: {
          name: 'foo',
          id: 'id1',
        },
      },
    });
    const { container, findByTestId, queryByTestId } = renderShareList();
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect(await findByTestId('invite-user-id5')).toHaveTextContent('foobar@example.com');
    expect(await findByTestId('accepted-user-id1')).toHaveTextContent('foo@example.com');
    expect(queryByTestId('accepted-user-id4')).toBeNull();
    expect(await findByTestId('pending-user-id2')).toHaveTextContent('bar@example.com');
    expect(await findByTestId('refused-user-id3')).toHaveTextContent('baz@example.com');
    expect(container).toMatchSnapshot();
  });
});
