import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { EmailField } from '../../../components/FormFields';
import UsersList from '../components/UsersList';
import RefusedUsersList from '../components/RefusedUsersList';
import axios from '../../../utils/api';

function ShareListForm(props) {
  const [invitableUsers, setInvitableUsers] = useState(props.invitableUsers);
  const [newEmail, setNewEmail] = useState('');
  const [pending, setPending] = useState(props.pending);
  const [accepted, setAccepted] = useState(props.accepted);
  const [refused, setRefused] = useState(props.refused);

  const failure = ({ response, request, message }) => {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        props.history.push('/users/sign_in');
      } else if (response.status === 403) {
        toast('You do not have permission to take that action', { type: 'error' });
        props.history.push('/lists');
      } else if (response.status === 404) {
        toast('User not found', { type: 'error' });
      } else {
        if (response.data.responseText) {
          toast(response.data.responseText, { type: 'error' });
        } else {
          const responseTextKeys = Object.keys(response.data);
          const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
          toast(responseErrors.join(' and '), { type: 'error' });
        }
      }
    } else if (request) {
      toast('Something went wrong', { type: 'error' });
    } else {
      toast(message, { type: 'error' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const {
        data: { user, users_list: usersList },
      } = await axios.post(`/auth/invitation`, {
        email: newEmail,
        list_id: props.listId,
      });
      const newPending = update(pending, {
        $push: [
          {
            user: {
              id: user.id,
              email: user.email,
            },
            users_list: {
              id: usersList.id,
              permissions: usersList.permissions,
            },
          },
        ],
      });
      setPending(newPending);
      setNewEmail('');
      toast(`"${props.name}" has been successfully shared with ${newEmail}.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleSelectUser = async (user) => {
    const usersList = {
      user_id: user.id,
      list_id: props.listId,
    };
    try {
      const { data } = await axios.post(`/lists/${props.listId}/users_lists`, { users_list: usersList });
      const newUsers = invitableUsers.filter((tmpUser) => tmpUser.id !== user.id);
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
      toast(`"${props.name}" has been successfully shared with ${user.email}.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const getUsers = (status) => {
    if (status === 'pending') {
      return [pending, setPending];
    } else {
      return [accepted, setAccepted];
    }
  };

  const togglePermission = async (id, currentPermission, status) => {
    const permissions = currentPermission === 'write' ? 'read' : 'write';
    try {
      await axios.patch(`/lists/${props.listId}/users_lists/${id}`, {
        users_list: {
          permissions,
        },
      });
      const [users, stateFunc] = getUsers(status);
      const updatedUsers = users.map((usersList) => {
        const newList = usersList;
        const tmpUsersList = newList.users_list;
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

  const refreshShare = async (id, userId) => {
    const { user } = refused.find(({ user }) => user.id === userId);
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
      const updatedRefused = refused.filter(({ user }) => user.id !== userId);
      setRefused(updatedRefused);
    } catch (error) {
      failure(error);
    }
  };

  const removeShare = async (id) => {
    try {
      await axios.delete(`/lists/${props.listId}/users_lists/${id}`);
      const {
        data: { accepted, invitable_users: invitableUsers, pending, refused },
      } = await axios.get(`/lists/${props.listId}/users_lists`);
      setAccepted(accepted);
      setInvitableUsers(invitableUsers);
      setPending(pending);
      setRefused(refused);
    } catch (error) {
      failure(error);
    }
  };

  return (
    <div>
      <Link to="/lists" className="float-right">
        Back to lists
      </Link>
      <h1>Share {props.name}</h1>
      <Form onSubmit={handleSubmit} className="pt-3 pb-3">
        <EmailField
          name="new-email"
          label="Enter an email to invite someone to share this list:"
          value={newEmail}
          handleChange={({ target: { value } }) => setNewEmail(value)}
        />
        <Button type="submit" variant="success" block>
          Share List
        </Button>
      </Form>
      {!!invitableUsers.length && <p className="text-lead">Or select someone you&apos;ve previously shared with:</p>}
      <ListGroup className="mb-5">
        {invitableUsers.map((user) => (
          <div data-test-id={`invite-user-${user.id}`} key={user.id}>
            <ListGroup.Item action key={user.id} className="btn btn-link" onClick={() => handleSelectUser(user)}>
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
}

ShareListForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  name: PropTypes.string.isRequired,
  invitableUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      email: PropTypes.string,
    }),
  ).isRequired,
  listId: PropTypes.string.isRequired,
  userIsOwner: PropTypes.bool.isRequired,
  pending: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        id: PropTypes.string,
        email: PropTypes.string,
      }),
      users_list: PropTypes.shape({
        id: PropTypes.string,
        permissions: PropTypes.string,
      }),
    }),
  ).isRequired,
  accepted: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        id: PropTypes.string,
        email: PropTypes.string,
      }),
      users_list: PropTypes.shape({
        id: PropTypes.string,
        permissions: PropTypes.string,
      }),
    }),
  ).isRequired,
  refused: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        id: PropTypes.string,
        email: PropTypes.string,
      }),
      users_list: PropTypes.shape({
        id: PropTypes.string,
        permissions: PropTypes.string,
      }),
    }),
  ).isRequired,
  userId: PropTypes.string.isRequired,
};

export default ShareListForm;
