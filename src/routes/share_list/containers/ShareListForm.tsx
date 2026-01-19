import React, { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import update from 'immutability-helper';
import { Form, ListGroup } from 'react-bootstrap';
import { showToast } from '../../../utils/toast';
import { type AxiosError } from 'axios';

import { EmailField } from 'components/FormFields';
import axios from 'utils/api';
import { usePolling } from 'hooks';
import FormSubmission from 'components/FormSubmission';
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
}

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
        const list = await fetchData({
          listId: props.listId,
          navigate: navigate,
        });
        /* istanbul ignore else */
        if (list) {
          const isSameSet = (newSet: IListUser[] | IUsersList[], oldSet: IListUser[] | IUsersList[]): boolean =>
            JSON.stringify(newSet) === JSON.stringify(oldSet);
          const invitableUsersSame = isSameSet(list.invitableUsers, invitableUsers);
          const pendingSame = isSameSet(list.pending, pending);
          const acceptedSame = isSameSet(list.accepted, accepted);
          const refusedSame = isSameSet(list.refused, refused);
          /* istanbul ignore else */
          if (!invitableUsersSame) {
            setInvitableUsers(list.invitableUsers);
          }
          /* istanbul ignore else */
          if (!pendingSame) {
            setPending(list.pending);
          }
          /* istanbul ignore else */
          if (!acceptedSame) {
            setAccepted(list.accepted);
          }
          /* istanbul ignore else */
          if (!refusedSame) {
            setRefused(list.refused);
          }
        }
      } catch (err: unknown) {
        const errorMessage = 'You may not be connected to the internet. Please check your connection.';
        showToast.error(`${errorMessage} Data may be incomplete and user actions may not persist.`);
      }
    },
    parseInt(process.env.REACT_APP_POLLING_INTERVAL ?? '5000', 10),
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
        users_list: {
          user_id: user.id,
          list_id: props.listId,
        },
      });
      const newUsers = invitableUsers.filter((tmpUser: IListUser) => tmpUser.id !== user.id);
      setInvitableUsers(newUsers);
      const newPending = update(pending, {
        $push: [
          {
            user: {
              id: data.user_id,
              email: user.email,
            },
            users_list: {
              id: data.id,
              permissions: data.permissions,
            },
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
      await axios.patch(`/lists/${props.listId}/users_lists/${id}`, {
        users_list: {
          permissions,
        },
      });
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
          users_list: {
            has_accepted: null,
            permissions: 'write',
          },
        });
        const updatedPending = update(pending, {
          $push: [
            {
              user,
              users_list: data,
            },
          ],
        });
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
    <div>
      <Link to="/lists" className="float-end">
        Back to lists
      </Link>
      <h1>Share {props.name}</h1>
      <Form onSubmit={handleSubmit} className="pt-3 pb-3">
        <EmailField
          name="new-email"
          label="Enter an email to invite someone to share this list:"
          value={newEmail}
          handleChange={(event: ChangeEvent<HTMLInputElement>): void => setNewEmail(event.target.value)}
        />
        <FormSubmission submitText="Share List" />
      </Form>
      {!!invitableUsers.length && <p className="text-lead">Or select someone you&apos;ve previously shared with:</p>}
      <ListGroup className="mb-5">
        {invitableUsers.map((user) => (
          <div data-test-id={`invite-user-${user.id}`} key={user.id}>
            <ListGroup.Item
              action
              key={user.id}
              className="btn btn-link"
              onClick={(): Promise<void> => handleSelectUser(user)}
            >
              {user.email}
            </ListGroup.Item>
          </div>
        ))}
      </ListGroup>
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
