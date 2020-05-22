import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { Button, Form, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

import { EmailField } from '../../../components/FormFields';
import PermissionButtons from '../components/PermissionButtons';
import axios from '../../../utils/api';

function ShareListForm(props) {
  const [invitableUsers, setInvitableUsers] = useState(props.invitableUsers);
  const [newEmail, setNewEmail] = useState('');
  const [pending, setPending] = useState(props.pending);
  const [accepted, setAccepted] = useState(props.accepted);

  const failure = ({ response, request, message }) => {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        props.history.push('/users/sign_in');
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
      // TODO: these need to be sorted?
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
      toast(`"${props.name}" has been successfully shared with ${user.email}.`, { type: 'info' });
      setInvitableUsers(newUsers);
      // TODO: these need to be sorted?
      setPending(newPending);
    } catch (error) {
      failure(error);
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
      const users = status === 'pending' ? pending : accepted;
      const updatedUsers = users.map((usersList) => {
        const newList = usersList;
        const tmpUsersList = newList.users_list;
        if (tmpUsersList.id === id) tmpUsersList.permissions = permissions;
        return newList;
      });
      const stateFunc = status === 'pending' ? setPending : setAccepted;
      stateFunc(updatedUsers);
    } catch (error) {
      failure(error);
    }
  };

  return (
    <div>
      <h1>Share {props.name}</h1>
      <Link to="/lists" className="float-right">
        Back to lists
      </Link>
      <br />
      <Form onSubmit={handleSubmit}>
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
      <br />
      <p className="text-lead">Or select someone you&apos;ve previously shared with:</p>
      <ListGroup>
        {invitableUsers.map((user) => (
          <div id={`invite-user-${user.id}`} key={user.id}>
            <ListGroup.Item action key={user.id} className="btn btn-link" onClick={() => handleSelectUser(user)}>
              {user.email}
            </ListGroup.Item>
          </div>
        ))}
      </ListGroup>
      <br />
      <h2>Already shared</h2>
      <p className="text-lead">Click to toggle permissions between read and write</p>
      <br />
      <PermissionButtons
        togglePermission={togglePermission}
        userIsOwner={props.userIsOwner}
        userId={props.userId}
        status="pending"
        users={pending}
      />
      <PermissionButtons
        togglePermission={togglePermission}
        userIsOwner={props.userIsOwner}
        userId={props.userId}
        status="accepted"
        users={accepted}
      />
      <h3>Refused</h3>
      <br />
      <ListGroup>
        {props.refused.map(({ user }) => (
          <div key={user.id} id={`refused-user-${user.id}`}>
            <ListGroup.Item>{user.email}</ListGroup.Item>
          </div>
        ))}
      </ListGroup>
    </div>
  );
}

ShareListForm.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  name: PropTypes.string,
  invitableUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      email: PropTypes.string,
    }),
  ),
  listId: PropTypes.number,
  userIsOwner: PropTypes.bool,
  pending: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      email: PropTypes.string,
    }),
  ),
  accepted: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      email: PropTypes.string,
    }),
  ),
  refused: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      email: PropTypes.string,
    }),
  ),
  userId: PropTypes.number,
};

export default ShareListForm;
