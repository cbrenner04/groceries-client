import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import axios from 'axios';

import Alert from '../../components/Alert';
import List from './components/List';
import ConfirmModal from '../../components/ConfirmModal';
import { setUserInfo } from '../../utils/auth';

function CompletedLists(props) {
  const [completedLists, setCompletedLists] = useState([]);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [listToDelete, setListToDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/completed_lists/`, {
        headers: JSON.parse(sessionStorage.getItem('user')),
      })
      .then(({ data, headers }) => {
        setUserInfo(headers);
        setCompletedLists(data.completed_lists);
      })
      .catch(({ response, request, message }) => {
        if (response) {
          setUserInfo(response.headers);
          if (response.status === 401) {
            // TODO: how do we pass error messages along?
            props.history.push('/users/sign_in');
          } else {
            // TODO: how do we pass error messages along?
            props.history.push('/lists');
          }
        } else if (request) {
          // TODO: what do here?
        } else {
          setErrors(message);
        }
      });
  }, [props.history]);

  const dismissAlert = () => {
    setSuccess('');
    setErrors('');
  };

  const failure = (response, request, message) => {
    if (response) {
      setUserInfo(response.headers);
      if (response.status === 401) {
        // TODO: how do we pass error messages along?
        props.history.push('/users/sign_in');
      } else if (response.status === 403) {
        // TODO: how do we pass error messages along?
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

  const handleRefresh = list => {
    dismissAlert();
    axios
      .post(
        `${process.env.REACT_APP_API_BASE}/lists/${list.id}/refresh_list`,
        {},
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      )
      .then(({ headers }) => {
        setUserInfo(headers);
        const refreshedList = completedLists.find(completedList => completedList.id === list.id);
        refreshedList.refreshed = true;
        setSuccess('Your list was successfully refreshed.');
      })
      .catch(({ response, request, message }) => {
        failure(response, request, message);
      });
  };

  const handleDelete = list => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    dismissAlert();
    setShowDeleteConfirm(false);
    axios
      .delete(`${process.env.REACT_APP_API_BASE}/lists/${listToDelete.id}`, {
        headers: JSON.parse(sessionStorage.getItem('user')),
      })
      .then(({ headers }) => {
        setUserInfo(headers);
        const lists = completedLists.filter(cl => cl.id !== listToDelete.id);
        setCompletedLists(lists);
        setSuccess('Your list was successfully deleted.');
      })
      .catch(({ response, request, message }) => {
        failure(response, request, message);
      });
  };

  return (
    <>
      <h1>Completed Lists</h1>
      <Alert errors={errors} success={success} handleDismiss={dismissAlert} />
      <div className="clearfix">
        <Link to="/lists" className="float-right">
          Back to lists
        </Link>
        <p className="float-left">Previously refreshed lists are marked with an asterisk (*).</p>
      </div>
      <ListGroup>
        {completedLists.map(list => (
          <List
            userId={list.user_id}
            list={list}
            key={list.id}
            onListDeletion={handleDelete}
            completed={list.completed}
            onListRefresh={handleRefresh}
            accepted
          />
        ))}
      </ListGroup>
      <ConfirmModal
        action="delete"
        body="Are you sure you want to delete this list?"
        show={showDeleteConfirm}
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}

export default CompletedLists;
