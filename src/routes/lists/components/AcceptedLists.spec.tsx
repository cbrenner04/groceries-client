import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import userEvent from '@testing-library/user-event';

import AcceptedLists from './AcceptedLists';
import axios from '../../../utils/api';
import type { TUserPermissions } from '../../../typings';
import { EListType } from '../../../typings';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function setup(suppliedProps = {}) {
  const user = userEvent.setup();
  // not sure what the problem is trying to set `currentUserPermissions` in the `defaultProps` object with this object
  const perms: TUserPermissions = {
    id2: 'write',
    id3: 'write',
    id4: 'read',
    id5: 'read',
  };
  const defaultProps = {
    completed: false,
    userId: 'id1',
    title: <div>Foo</div>,
    fullList: false,
    completedLists: [
      {
        id: 'id2',
        name: 'bar',
        type: EListType.BOOK_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id2',
        owner_id: 'id1',
        refreshed: false,
      },
      {
        id: 'id4',
        name: 'bar',
        type: EListType.BOOK_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id4',
        owner_id: 'id2',
        refreshed: false,
      },
    ],
    setCompletedLists: jest.fn(),
    incompleteLists: [
      {
        id: 'id3',
        name: 'baz',
        type: EListType.MUSIC_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id3',
        owner_id: 'id1',
        refreshed: false,
      },
      {
        id: 'id5',
        name: 'foobar',
        type: EListType.TO_DO_LIST,
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id5',
        owner_id: 'id2',
        refreshed: false,
      },
    ],
    setIncompleteLists: jest.fn(),
    currentUserPermissions: perms,
    setCurrentUserPermissions: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <AcceptedLists {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('AcceptedLists', () => {
  it('does not delete list when confirm modal is cleared', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByTestId, queryByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('clear-delete')).toBeVisible());

    await user.click(await findByTestId('clear-delete'));
    await waitFor(() => expect(queryByTestId('clear-delete')).toBeNull());

    expect(toast).not.toHaveBeenCalled();
    expect(axios.delete).not.toHaveBeenCalled();
  });

  it('deletes incomplete list', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByTestId, queryByTestId, props, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(toast).toHaveBeenCalledWith('List successfully deleted.', { type: 'info' });
    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(props.setIncompleteLists).toHaveBeenCalledWith([props.incompleteLists[1]]);
  });

  it('deletes complete list', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByTestId, queryByTestId, props, user } = setup({ completed: true });

    await user.click((await findAllByTestId('complete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(toast).toHaveBeenCalledWith('List successfully deleted.', { type: 'info' });
    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(props.setCompletedLists).toHaveBeenCalledWith([props.completedLists[1]]);
  });

  it('deletes multiple lists', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    axios.patch = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByTestId, findAllByRole, findByText, props, user } = setup();

    await user.click(await findByText('Select'));

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Lists successfully deleted.', { type: 'info' });
    expect(props.setIncompleteLists).toHaveBeenCalledWith([]);
  });

  it('redirects to login when delete fails with 401', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when delete fails with 403', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when delete fails with 404', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when delete fails with error other than 401, 403, 404', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when delete fails to send request', async () => {
    axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when delete unknown error occurs', async () => {
    axios.delete = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-delete')).toBeVisible());

    await user.click(await findByTestId('confirm-delete'));
    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('completes list', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findAllByTestId, props, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully completed.', { type: 'info' });
    expect(props.setCompletedLists).toHaveBeenCalledWith([
      props.completedLists[0],
      props.completedLists[1],
      props.incompleteLists[0],
    ]);
  });

  it('completes multiple lists', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findAllByRole, findByText, props, user } = setup();

    await user.click(await findByText('Select'));

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1)); // 1 list user doesn't own

    expect(toast).toHaveBeenCalledWith('List successfully completed.', { type: 'info' });
    expect(props.setCompletedLists).toHaveBeenCalledWith([
      props.completedLists[0],
      props.completedLists[1],
      props.incompleteLists[0],
    ]);
  });

  it('redirects on 401 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows error on 403 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors on 404 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when error not 401, 403, 404 from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when request fails from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when known failure from list completion', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('incomplete-list-complete'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('refreshes list on lists page', async () => {
    const newList = {
      id: 'id7',
      name: 'new list',
      type: EListType.BOOK_LIST,
      created_at: new Date('05/31/2020').toISOString(),
      owner_id: 'id1',
      completed: false,
      refreshed: false,
      users_list_id: 'id8',
    };
    axios.post = jest.fn().mockResolvedValue({ data: newList });
    const { findAllByTestId, props, user } = setup({ completed: true, fullList: false });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully refreshed.', { type: 'info' });
    expect(props.setIncompleteLists).toHaveBeenCalledWith([
      props.incompleteLists[0],
      props.incompleteLists[1],
      newList,
    ]);
  });

  it('refreshes lists on completed lists page', async () => {
    const newList = {
      id: 'id6',
      name: 'new list',
      type: EListType.BOOK_LIST,
      created_at: new Date('05/31/2020').toISOString(),
      owner_id: 'id1',
      completed: false,
      refreshed: false,
      users_list_id: 'id8',
    };
    axios.post = jest.fn().mockResolvedValue({ data: newList });
    const { findAllByTestId, props, user } = setup({ completed: true, incompleteLists: [], fullList: true });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully refreshed.', { type: 'info' });
    expect(props.setIncompleteLists).not.toHaveBeenCalled();
  });

  it('refreshes multiple lists', async () => {
    const newList = {
      id: 'id6',
      name: 'new list',
      type: EListType.BOOK_LIST,
      created_at: new Date('05/31/2020').toISOString(),
      owner_id: 'id1',
      completed: false,
      refreshed: false,
      users_list_id: 'id8',
    };
    axios.post = jest.fn().mockResolvedValueOnce({ data: newList });
    const { findAllByTestId, findAllByRole, findByText, props, user } = setup({ completed: true });

    await user.click(await findByText('Select'));

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('complete-list-refresh'))[0]);

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1)); // only owns 1 list

    expect(toast).toHaveBeenCalledWith('List successfully refreshed.', { type: 'info' });
    expect(props.setIncompleteLists).toHaveBeenCalledWith([
      props.incompleteLists[0],
      props.incompleteLists[1],
      newList,
    ]);
  });

  it('redirects on 401 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByTestId, user } = setup({ completed: true });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows error on 403 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByTestId, user } = setup({ completed: true });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors on 404 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByTestId, user } = setup({ completed: true });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when error not 401, 403, 404 from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findAllByTestId, user } = setup({ completed: true });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when request fails from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findAllByTestId, user } = setup({ completed: true });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when known failure from list refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findAllByTestId, user } = setup({ completed: true });

    await user.click((await findAllByTestId('complete-list-refresh'))[0]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('shows merge button when multi select and more than 1 list is selected', async () => {
    const { container, findByText, findAllByTestId, findAllByRole, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    expect(container).toMatchSnapshot();
    expect(await findAllByTestId('incomplete-list-merge')).toHaveLength(2);
  });

  it('shows modal to set the new list name for merging and clears', async () => {
    const { container, findAllByRole, findByTestId, findAllByTestId, queryByTestId, findByText, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);

    expect(container).toMatchSnapshot();
    expect(await findByTestId('clear-merge')).toBeVisible();
    expect(await findByTestId('confirm-merge')).toBeVisible();

    await user.click(await findByTestId('clear-merge'));

    await waitFor(() => expect(queryByTestId('clear-merge')).toBeNull());

    expect(queryByTestId('confirm-merge')).toBeNull();
  });

  it('only merges lists of the same type', async () => {
    const newList = {
      archived_at: null,
      completed: false,
      created_at: '2020-08-03T08:42:13.331-05:00',
      has_accepted: true,
      id: 'id17',
      name: 'a',
      owner_id: 'id1',
      refreshed: false,
      type: EListType.MUSIC_LIST,
      updated_at: '2020-08-03T08:42:13.331-05:00',
      user_id: 'id1',
      users_list_id: 'id29',
    };
    axios.post = jest.fn().mockResolvedValue({ data: newList });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, props, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(axios.post).toHaveBeenCalledWith('/lists/merge_lists', {
      merge_lists: { list_ids: 'id3', new_list_name: 'a' },
    });
    expect(props.setIncompleteLists).toHaveBeenCalledWith([
      newList,
      props.incompleteLists[0],
      props.incompleteLists[1],
    ]);
  });

  it('redirects to login when remove fails with 401', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('merges on completed lists page', async () => {
    const newList = {
      archived_at: null,
      completed: false,
      created_at: '2020-08-03T08:42:13.331-05:00',
      has_accepted: true,
      id: 'id17',
      name: 'a',
      owner_id: 'id1',
      refreshed: false,
      type: EListType.BOOK_LIST,
      updated_at: '2020-08-03T08:42:13.331-05:00',
      user_id: 'id1',
      users_list_id: 'id29',
    };
    axios.post = jest.fn().mockResolvedValue({ data: newList });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, props, user } = setup({
      completed: true,
      incompleteLists: [],
      fullList: true,
    });

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('complete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(axios.post).toHaveBeenCalledWith('/lists/merge_lists', {
      merge_lists: { list_ids: 'id2,id4', new_list_name: 'a' },
    });
    expect(props.setIncompleteLists).not.toHaveBeenCalled();
  });

  it('shows errors when merge fails with 403', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when merge fails with 404', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
  });

  it('shows errors when merge fails with error other than 401, 403, 404', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('shows errors when merge fails to send request', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('shows errors when merge unknown error occurs', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByLabelText, findAllByRole, findByTestId, findAllByTestId, findByText, user } = setup();

    await user.click(await findByText('Select'));
    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click((await findAllByTestId('incomplete-list-merge'))[0]);
    await user.type(await findByLabelText('Name for the merged list'), 'a');

    expect(await findByLabelText('Name for the merged list')).toHaveValue('a');

    await waitFor(async () => expect(await findByTestId('confirm-merge')).not.toBeDisabled());

    await user.click(await findByTestId('confirm-merge'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });
});
