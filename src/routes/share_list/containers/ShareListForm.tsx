import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import Input from 'components/ui/Input';
import { Button } from 'components/ui/Button';
import { IconButton } from 'components/ui/IconButton';
import { CheckIcon } from 'components/icons';
import axios from 'utils/api';
import { usePolling } from 'hooks';
import type { IListUser, IUsersList } from 'typings';

import UsersList from '../components/UsersList';
import RefusedUsersList from '../components/RefusedUsersList';
import { fetchData } from '../utils';

export interface IShareListFormProps {
  name: string;
  invitableUsers: IListUser[];
  listId: string;
  userIsOwner: boolean;
  pending: IUsersList[];
  accepted: IUsersList[];
  refused: IUsersList[];
  userId: string;
  onClose?: () => void;
}

const sectionLabel = 'tw:text-xs tw:uppercase tw:tracking-wide tw:text-[var(--color-text-secondary)] tw:mb-2';
const rowClass =
  'tw:flex tw:items-center tw:justify-between tw:gap-3 tw:py-2 tw:border-b tw:border-[var(--color-border)]';

const ShareListForm: React.FC<IShareListFormProps> = (props) => {
  const [invitableUsers, setInvitableUsers] = useState(props.invitableUsers);
  const [newEmail, setNewEmail] = useState('');
  const [pending, setPending] = useState(props.pending);
  const [accepted, setAccepted] = useState(props.accepted);
  const [refused, setRefused] = useState(props.refused);
  const navigate = useNavigate();

  usePolling(
    async () => {
      try {
        const list = await fetchData({ listId: props.listId, navigate: navigate });
        /* istanbul ignore else */
        if (list) {
          const isSameSet = (newSet: IListUser[] | IUsersList[], oldSet: IListUser[] | IUsersList[]): boolean =>
            JSON.stringify(newSet) === JSON.stringify(oldSet);
          /* istanbul ignore else */
          if (!isSameSet(list.invitableUsers, invitableUsers)) {
            setInvitableUsers(list.invitableUsers);
          }
          /* istanbul ignore else */
          if (!isSameSet(list.pending, pending)) {
            setPending(list.pending);
          }
          /* istanbul ignore else */
          if (!isSameSet(list.accepted, accepted)) {
            setAccepted(list.accepted);
          }
          /* istanbul ignore else */
          if (!isSameSet(list.refused, refused)) {
            setRefused(list.refused);
          }
        }
      } catch {
        const errorMessage = 'You may not be connected to the internet. Please check your connection.';
        showToast.error(`${errorMessage} Data may be incomplete and user actions may not persist.`);
      }
    },
    parseInt(import.meta.env.VITE_POLLING_INTERVAL ?? '5000', 10),
  );

  const failure = (err: unknown): void => {
    const error = err as AxiosError;
    if (error.response) {
      if (error.response.status === 401) {
        showToast.error('You must sign in');
        navigate('/users/sign_in');
      } else if (error.response.status === 403) {
        showToast.error('You do not have permission to take that action');
        navigate('/lists');
      } else if (error.response.status === 404) {
        showToast.error('User not found');
      } else {
        if ((error.response.data as Record<string, string>).responseText) {
          showToast.error((error.response.data as Record<string, string>).responseText);
        } else {
          const responseTextKeys = Object.keys(error.response.data as Record<string, string>);
          const responseErrors = responseTextKeys.map(
            (key) => `${key} ${(error.response?.data as Record<string, string>)[key]}`,
          );
          showToast.error(responseErrors.join(' and '));
        }
      }
    } else if (error.request) {
      showToast.error('Something went wrong');
    } else {
      showToast.error(error.message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    try {
      const { data } = await axios.post('/auth/invitation', {
        email: newEmail,
        list_id: props.listId,
      });
      const newPending = update(pending, { $push: [data] });
      setPending(newPending);
      setNewEmail('');
      showToast.info(`"${props.name}" has been successfully shared with ${newEmail}.`);
    } catch (error) {
      failure(error);
    }
  };

  const handleSelectUser = async (user: IListUser): Promise<void> => {
    try {
      const { data } = await axios.post(`/lists/${props.listId}/users_lists`, {
        users_list: { user_id: user.id, list_id: props.listId },
      });
      const newUsers = invitableUsers.filter((tmpUser: IListUser) => tmpUser.id !== user.id);
      setInvitableUsers(newUsers);
      const newPending = update(pending, {
        $push: [
          {
            user: { id: data.user_id, email: user.email },
            users_list: { id: data.id, permissions: data.permissions },
          },
        ],
      });

      setPending(newPending);
      showToast.info(`"${props.name}" has been successfully shared with ${user.email}.`);
    } catch (error) {
      failure(error);
    }
  };

  const togglePermission = async (id: string, currentPermission: string, status: string): Promise<void> => {
    const permissions = currentPermission === 'write' ? 'read' : 'write';
    try {
      await axios.patch(`/lists/${props.listId}/users_lists/${id}`, { users_list: { permissions } });
      const [users, stateFunc] = status === 'pending' ? [pending, setPending] : [accepted, setAccepted];
      const updatedUsers = users.map((usersList) => {
        const newList = usersList;
        const tmpUsersList = newList.users_list;
        /* istanbul ignore else */
        if (tmpUsersList.id === id) {
          tmpUsersList.permissions = permissions;
        }
        return newList;
      });
      stateFunc(updatedUsers);
    } catch (error) {
      failure(error);
    }
  };

  const refreshShare = async (id: string, userId: string): Promise<void> => {
    const usersList = refused.find((user) => user.user.id === userId);
    /* istanbul ignore else */
    if (usersList) {
      const { user } = usersList;
      try {
        const { data } = await axios.patch(`/lists/${props.listId}/users_lists/${id}`, {
          users_list: { has_accepted: null, permissions: 'write' },
        });
        const updatedPending = update(pending, { $push: [{ user, users_list: data }] });
        setPending(updatedPending);
        const updatedRefused = refused.filter((user) => user.user.id !== userId);
        setRefused(updatedRefused);
      } catch (error) {
        failure(error);
      }
    }
  };

  const removeShare = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/lists/${props.listId}/users_lists/${id}`);
      const { data } = await axios.get(`/lists/${props.listId}/users_lists`);
      setAccepted(data.accepted);
      setInvitableUsers(data.invitable_users);
      setPending(data.pending);
      setRefused(data.refused);
    } catch (error) {
      failure(error);
    }
  };

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      <form onSubmit={handleSubmit} className="tw:flex tw:flex-col tw:gap-2">
        <Input
          id="new-email"
          name="new-email"
          type="email"
          label="Enter an email to invite someone to share this list:"
          value={newEmail}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => setNewEmail(event.target.value)}
        />
        <div className="tw:flex tw:justify-end">
          <Button variant="primary" type="submit" disabled={!newEmail}>
            Share List
          </Button>
        </div>
      </form>

      {!!invitableUsers.length && (
        <section>
          <h3 className={sectionLabel}>Share with</h3>
          <ul className="tw:flex tw:flex-col">
            {invitableUsers.map((user) => (
              <li key={user.id} data-test-id={`invite-user-${user.id}`} className={rowClass}>
                <button
                  type="button"
                  className="tw:flex tw:items-center tw:gap-2 tw:flex-1 tw:text-left tw:cursor-pointer"
                  onClick={(): Promise<void> => handleSelectUser(user)}
                >
                  <span className="tw:text-sm tw:flex-1 tw:truncate">{user.email}</span>
                </button>
                <IconButton
                  icon={<CheckIcon size="sm" />}
                  variant="success"
                  size="sm"
                  label="Add user"
                  onClick={(): Promise<void> => handleSelectUser(user)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <UsersList
        togglePermission={togglePermission}
        removeShare={removeShare}
        userIsOwner={props.userIsOwner}
        userId={props.userId}
        status="pending"
        users={pending}
      />
      <UsersList
        togglePermission={togglePermission}
        removeShare={removeShare}
        userIsOwner={props.userIsOwner}
        userId={props.userId}
        status="accepted"
        users={accepted}
      />
      <RefusedUsersList
        refreshShare={refreshShare}
        userIsOwner={props.userIsOwner}
        userId={props.userId}
        users={refused}
      />
    </div>
  );
};

export default ShareListForm;
