import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import { showToast } from '../../../utils/toast';

import axios from 'utils/api';

import PendingLists, { type IPendingListsProps } from './PendingLists';

const mockShowToast = showToast as jest.Mocked<typeof showToast>;

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  props: IPendingListsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IPendingListsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    userId: 'id1',
    pendingLists: [
      {
        id: 'id1',
        name: 'foo',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id2',
        owner_id: 'id2',
        refreshed: false,
      },
      {
        id: 'id2',
        name: 'foo',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id3',
        owner_id: 'id2',
        refreshed: false,
      },
    ],
    setPendingLists: jest.fn(),
    incompleteLists: [
      {
        id: 'id3',
        name: 'baz',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id14',
        owner_id: 'id1',
        refreshed: false,
      },
      {
        id: 'id4',
        name: 'foobar',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: false,
        users_list_id: 'id6',
        owner_id: 'id2',
        refreshed: false,
      },
    ],
    setIncompleteLists: jest.fn(),
    completedLists: [
      {
        id: 'id5',
        name: 'bar',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id7',
        owner_id: 'id1',
        refreshed: false,
      },
      {
        id: 'id6',
        name: 'bar',
        list_item_configuration_id: 'config-1',
        created_at: new Date('05/31/2020').toISOString(),
        completed: true,
        users_list_id: 'id9',
        owner_id: 'id2',
        refreshed: false,
      },
    ],
    setCompletedLists: jest.fn(),
    currentUserPermissions: {
      id1: 'write',
      id2: 'write',
      id3: 'write',
      id4: 'read',
      id5: 'read',
      id6: 'read',
    },
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <PendingLists {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('PendingLists', () => {
  it('accepts list', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { findAllByTestId, props, user } = setup();

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.info).toHaveBeenCalledWith('List successfully accepted.');
    expect(props.setIncompleteLists).toHaveBeenCalledWith([
      props.incompleteLists[0],
      props.incompleteLists[1],
      props.pendingLists[0],
    ]);
  });

  it('accepts multiple lists', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByText, findAllByRole, props, user } = setup();

    await user.click(await findByText('Select'));

    const checkboxes = await findAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(2));

    expect(mockShowToast.info).toHaveBeenCalledWith('Lists successfully accepted.');
    expect(props.setIncompleteLists).toHaveBeenCalledWith([
      props.incompleteLists[0],
      props.incompleteLists[1],
      props.pendingLists[0],
    ]);
    expect(props.setCompletedLists).toHaveBeenCalledWith([
      props.completedLists[0],
      props.completedLists[1],
      props.pendingLists[1],
    ]);
  });

  it('redirects on 401 from list accept', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows error on 403 from list accept', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
  });

  it('shows errors on 404 from list accept', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
  });

  it('shows errors when error not 401, 403, 404 from list accept', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('foo bar and foobar foobaz');
  });

  it('shows errors when request fails from list accept', async () => {
    axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows errors when known failure from list accept', async () => {
    axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findAllByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-accept'))[0]);
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('failed to send request');
  });

  it('does not reject list when confirm modal is cleared', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByTestId, queryByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(() => findByTestId('clear-reject'));

    await user.click(await findByTestId('clear-reject'));
    await waitFor(() => expect(queryByTestId('clear-reject')).toBeNull());

    expect(mockShowToast.info).not.toHaveBeenCalled();
    expect(mockShowToast.error).not.toHaveBeenCalled();
    expect(axios.patch).not.toHaveBeenCalled();
  });

  it('rejects list', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByTestId, queryByTestId, props, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(() => findByTestId('confirm-reject'));

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(queryByTestId('confirm-reject')).toBeNull());

    expect(mockShowToast.info).toHaveBeenCalledWith('List successfully rejected.');
    expect(axios.patch).toHaveBeenCalledTimes(1);
    expect(props.setPendingLists).toHaveBeenCalledWith([props.pendingLists[1]]);
  });

  it('rejects multiple lists', async () => {
    axios.patch = jest.fn().mockResolvedValue({});
    const { findAllByTestId, findByTestId, queryByTestId, findByText, findAllByRole, props, user } = setup();

    await user.click(await findByText('Select'));

    const checkboxes = await findAllByRole('checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-reject')).toBeVisible());

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(queryByTestId('confirm-reject')).toBeNull());

    expect(mockShowToast.info).toHaveBeenCalledWith('Lists successfully rejected.');
    expect(axios.patch).toHaveBeenCalledTimes(2);
    expect(props.setPendingLists).toHaveBeenCalledWith([]);
  });

  it('redirects to login when reject fails with 401', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-reject')).toBeVisible());

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('shows errors when reject fails with 403', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-reject')).toBeVisible());

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
  });

  it('shows errors when reject fails with 404', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-reject')).toBeVisible());

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
  });

  it('shows errors when reject fails with error other than 401, 403, 404', async () => {
    axios.patch = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-reject')).toBeVisible());

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('foo bar and foobar foobaz');
  });

  it('shows errors when reject fails to send request', async () => {
    axios.patch = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-reject')).toBeVisible());

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('shows errors when reject unknown error occurs', async () => {
    axios.patch = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findAllByTestId, findByTestId, user } = setup();

    await user.click((await findAllByTestId('pending-list-trash'))[0]);
    await waitFor(async () => expect(await findByTestId('confirm-reject')).toBeVisible());

    await user.click(await findByTestId('confirm-reject'));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));

    expect(mockShowToast.error).toHaveBeenCalledWith('failed to send request');
  });
});
