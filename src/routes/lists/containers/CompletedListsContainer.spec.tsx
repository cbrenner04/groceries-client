import React from 'react';
import { act, render, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { toast } from 'react-toastify';

import axios from 'utils/api';
import type { TUserPermissions } from 'typings';
import { EListType } from 'typings';

import CompletedListsContainer from './CompletedListsContainer';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

function setup(): RenderResult {
  const props = {
    userId: 'id1',
    completedLists: [
      {
        id: 'id1',
        name: 'foo',
        type: EListType.GROCERY_LIST,
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
        type: EListType.BOOK_LIST,
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
        type: EListType.BOOK_LIST,
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
    } as TUserPermissions,
  };
  const component = render(
    <MemoryRouter>
      <CompletedListsContainer {...props} />
    </MemoryRouter>,
  );

  return component;
}

describe('CompletedListsContainer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders', () => {
    const { container } = setup();

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
              type: EListType.GROCERY_LIST,
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
              type: EListType.GROCERY_LIST,
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
              type: EListType.GROCERY_LIST,
              created_at: new Date('05/31/2020').toISOString(),
              completed: true,
              refreshed: false,
              owner_id: 'id1',
            },
          ],
          current_list_permissions: { id1: 'write' },
        },
      });

    const { findByTestId, queryByTestId } = setup();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith('/v2/completed_lists/');
    expect(await findByTestId('list-id1')).toBeVisible();
    expect(queryByTestId('list-id2')).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(await findByTestId('list-id1')).toBeVisible();
    expect(await findByTestId('list-id2')).toBeVisible();
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
            type: EListType.GROCERY_LIST,
            created_at: new Date('05/31/2020').toISOString(),
            completed: true,
            refreshed: false,
            owner_id: 'id1',
          },
        ],
        current_list_permissions: { id1: 'write' },
      },
    });

    const { findByTestId } = setup();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(await findByTestId('list-id1')).toBeVisible();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(await findByTestId('list-id1')).toBeVisible();
  });

  it('fires generic toast when unknown error occurs in usePolling', async () => {
    axios.get = jest.fn().mockRejectedValue({ response: { status: 500 } });
    setup();

    await act(async () => {
      jest.advanceTimersByTime(10000);
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(
      'Something went wrong. Data may be incomplete and user actions may not persist.',
      {
        type: 'error',
      },
    );
  });
});
