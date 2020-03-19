import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import { Button, Form, ListGroup } from 'react-bootstrap';
import axios from 'axios';

import * as config from '../../config/default';
import Alert from '../../components/Alert';
import { EmailField } from '../../components/FormFields';
import PermissionButtons from './components/PermissionButtons';
import { newSetUserInfo } from '../../utils/auth';

function ShareListForm(props) {
  const [listId, setListId] = useState(0);
  const [invitableUsers, setInvitableUsers] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [errors, setErrors] = useState('');
  const [pending, setPending] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [refused, setRefused] = useState([]);
  const [userId, setUserId] = useState(0);
  const [userIsOwner, setUserIsOwner] = useState(false);
  const [name, setName] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (props.match) {
      axios.get(`${config.apiBase}/lists/${props.match.params.list_id}/users_lists`, {
        headers: JSON.parse(sessionStorage.getItem('user')),
      }).then(({ data, headers }) => {
        newSetUserInfo(headers);
        setName(data.list.name);
        setInvitableUsers(data.invitable_users);
        setListId(data.list.id);
        setUserIsOwner(data.user_is_owner);
        setPending(data.pending);
        setAccepted(data.accepted);
        setRefused(data.refused);
        setUserId(data.current_user_id);
        const userInAccepted = data.accepted.find(acceptedList => acceptedList.user.id === data.current_user_id);
        if (!(userInAccepted && userInAccepted.users_list.permissions === 'write')) {
          props.history.push('/lists');
        }
      }).catch(({ response, request, message }) => {
        if (response) {
          newSetUserInfo(response.headers);
          if (response.status === 401) {
            // TODO: how do we pass error messages along?
            props.history.push('/users/sign_in');
          } else if (response.status === 403) {
            // TODO: how do we pass error messages along
            props.history.push('/lists');
          } else {
            const responseTextKeys = Object.keys(response.data);
            const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
            setErrors(responseErrors.join(' and '));
          }
        } else if (request) {
          // TODO: what do here?
        } else {
          setErrors(message);
        }
      });
    }
  }, [props.history, props.match]);

  const handleAlertDismiss = () => {
    setSuccess('');
    setErrors('');
  };

  const failure = ({ response, request, message }) => {
    if (response) {
      newSetUserInfo(response.headers);
      if (response.status === 401) {
        // TODO: how do we pass error messages along?
        props.history.push('/users/sign_in');
      } else if (response.status === 403) {
        // TODO: how do we pass error messages along
        props.history.push('/lists');
      } else {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map(key => `${key} ${response.data[key]}`);
        setErrors(responseErrors.join(' and '));
      }
    } else if (request) {
      // TODO: what do here?
    } else {
      setErrors(message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleAlertDismiss();
    axios.post(`${config.apiBase}/auth/invitation`, {
      email: newEmail,
      list_id: listId,
    }, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ data: { user, users_list: usersList }, headers  }) => {
      newSetUserInfo(Headers);
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
      // TODO: these need to be sorted
      setPending(newPending);
      setNewEmail('');
      setSuccess(`"${name}" has been successfully shared with ${newEmail}.`);
    }).catch(failure);
  };

  const handleSelectUser = (user) => {
    handleAlertDismiss();
    const usersList = {
      user_id: user.id,
      list_id: listId,
    };
    axios.post(`${config.apiBase}/lists/${listId}/users_lists`, { users_list: usersList }, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ data, headers }) => {
      newSetUserInfo(headers);
      const newUsers = invitableUsers.filter(tmpUser => tmpUser.id !== user.id);
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
      setSuccess(`"${name}" has been successfully shared with ${user.email}.`);
      setInvitableUsers(newUsers);
      // TODO: these need to be sorted
      setPending(newPending);
    }).catch(failure);
  };

  const togglePermission = (id, currentPermission, status) => {
    const permissions = currentPermission === 'write' ? 'read' : 'write';
    axios.patch(`${config.apiBase}/lists/${listId}/users_lists/${id}`, `users_list%5Bpermissions%5D=${permissions}`, {
      headers: JSON.parse(sessionStorage.getItem('user')),
    }).then(({ headers }) => {
      newSetUserInfo(headers);
      const users = status === 'pending' ? pending : accepted;
      const updatedUsers = users.map((usersList) => {
        const newList = usersList;
        const tmpUsersList = newList.users_list;
        if (tmpUsersList.id === id) tmpUsersList.permissions = permissions;
        return newList;
      });
      const stateFunc = status === 'pending' ? setPending : setAccepted;
      stateFunc(updatedUsers);
    }).catch(failure);
  };

  return (
    <div>
      <h1>Share {name}</h1>
      <Link to="/lists" className="float-right">Back to lists</Link>
      <br />
      <Alert errors={errors} success={success} handleDismiss={handleAlertDismiss} />
      <Form onSubmit={handleSubmit}>
        <EmailField
          name="new-email"
          label="Enter an email to invite someone to share this list:"
          value={newEmail}
          handleChange={({ target: { value } }) => setNewEmail(value)}
        />
        <Button type="submit" variant="success" block>Share List</Button>
      </Form>
      <br />
      <p className="text-lead">Or select someone you&apos;ve previously shared with:</p>
      <ListGroup>
        {
          invitableUsers.map(user => (
            <div id={`invite-user-${user.id}`}>
              <ListGroup.Item
                action
                key={user.id}
                className="btn btn-link"
                onClick={() => handleSelectUser(user)}
              >
                {user.email}
              </ListGroup.Item>
            </div>
          ))
        }
      </ListGroup>
      <br />
      <h2>Already shared</h2>
      <p className="text-lead">Click to toggle permissions between read and write</p>
      <br />
      <PermissionButtons
        togglePermission={togglePermission}
        userIsOwner={userIsOwner}
        userId={userId}
        status="pending"
        users={pending}
      />
      <PermissionButtons
        togglePermission={togglePermission}
        userIsOwner={userIsOwner}
        userId={userId}
        status="accepted"
        users={accepted}
      />
      <h3>Refused</h3>
      <br />
      <ListGroup>
        {
          refused.map(({ user }) => (
            <div key={user.id} id={`refused-user-${user.id}`}>
              <ListGroup.Item>{user.email}</ListGroup.Item>
            </div>
          ))
        }
      </ListGroup>
    </div>
  );
}

ShareListForm.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      list_id: PropTypes.string,
    }).isRequired,
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
};

export default ShareListForm;
