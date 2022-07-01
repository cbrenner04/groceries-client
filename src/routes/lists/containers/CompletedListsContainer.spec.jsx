import React from 'react';
import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import CompletedListsContainer from './CompletedListsContainer';
import axios from '../../../utils/api';

describe('CompletedListsContainer', () => {
  let props;
  const renderCompletedListsContainer = (props) => {
    return render(
      <MemoryRouter>
        <CompletedListsContainer {...props} />
      </MemoryRouter>,
    );
  };

  beforeEach(() => {
    jest.useFakeTimers();
    props = {
      userId: 'id1',
      completedLists: [
        {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 'id1',
          owner_id: 'id1',
          user_id: 'id1',
          refreshed: false,
        },
        {
          id: 'id2',
          name: 'bar',
          type: 'BookList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 'id2',
          owner_id: 'id1',
          user_id: 'id1',
          refreshed: false,
        },
        {
          id: 'id3',
          name: 'baz',
          type: 'BookList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 'id3',
          owner_id: 'id2',
          user_id: 'id1',
          refreshed: false,
        },
      ],
      currentUserPermissions: {
        id1: 'write',
        id2: 'write',
        id3: 'read',
      },
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders', () => {
    const { container } = renderCompletedListsContainer(props);

    expect(container).toMatchSnapshot();
  });

  it('updates via polling when different data is returned', async () => {
    axios.get = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          current_user_id: 'id1',
          completed_lists: [
            {
              id: 'id1',
              users_list_id: 'id1',
              name: 'foo',
              user_id: 'id1',
              type: 'GroceryList',
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
          current_list_permissions: { id1: 'write' },
        },
      })
      .mockResolvedValueOnce({
        data: {
          current_user_id: 'id1',
          completed_lists: [
            {
              id: 'id1',
              users_list_id: 'id1',
              name: 'foo',
              user_id: 'id1',
              type: 'GroceryList',
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 'id1',
            },
            {
              id: 'id2',
              users_list_id: 'id2',
              name: 'bar',
              user_id: 'id1',
              type: 'GroceryList',
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
          current_list_permissions: { id1: 'write' },
        },
      });

    const { getByTestId, queryByTestId } = renderCompletedListsContainer(props);

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(getByTestId('list-id1')).toBeVisible();
    expect(queryByTestId('list-id2')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(getByTestId('list-id1')).toBeVisible();
    expect(getByTestId('list-id2')).toBeVisible();
  });

  it('does not update via polling when different data is not returned', async () => {
    axios.get = jest.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
        completed_lists: [
          {
            id: 'id1',
            users_list_id: 'id1',
            name: 'foo',
            user_id: 'id1',
            type: 'GroceryList',
            created_at: new Date('05/31/2020').toISOString(),
            completed: true,
            refreshed: false,
            owner_id: 'id1',
          },
        ],
        current_list_permissions: { id1: 'write' },
      },
    });

    const { getByTestId } = renderCompletedListsContainer(props);

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(getByTestId('list-id1')).toBeVisible();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(getByTestId('list-id1')).toBeVisible();
  });
});
