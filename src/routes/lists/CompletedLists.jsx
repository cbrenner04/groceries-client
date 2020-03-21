import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';

import Alert from '../../components/Alert';
import List from './components/List';
import ConfirmModal from '../../components/ConfirmModal';
import { setUserInfo } from '../../utils/auth';
import axios from '../../utils/api';

function CompletedLists(props) {
  const [completedLists, setCompletedLists] = useState([]);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [listToDelete, setListToDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, headers } = await axios.get(`/completed_lists/`, {
          headers: JSON.parse(sessionStorage.getItem('user')),
        });
        setUserInfo(headers);
        setCompletedLists(data.completed_lists);
      } catch ({ response, request, message }) {
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
      }
    }

    fetchData();
  }, [props.history]);

  const dismissAlert = () => {
    setSuccess('');
    setErrors('');
  };

  const failure = ({ response, request, message }) => {
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

  const handleRefresh = async list => {
    try {
      const { headers } = await axios.post(
        `/lists/${list.id}/refresh_list`,
        {},
        {
          headers: JSON.parse(sessionStorage.getItem('user')),
        },
      );
      setUserInfo(headers);
      const refreshedList = completedLists.find(completedList => completedList.id === list.id);
      refreshedList.refreshed = true;
      setSuccess('Your list was successfully refreshed.');
    } catch (error) {
      failure(error);
    }
    dismissAlert();
  };

  const handleDelete = list => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    dismissAlert();
    setShowDeleteConfirm(false);
    try {
      const { headers } = await axios.delete(`/lists/${listToDelete.id}`, {
        headers: JSON.parse(sessionStorage.getItem('user')),
      });
      setUserInfo(headers);
      const lists = completedLists.filter(cl => cl.id !== listToDelete.id);
      setCompletedLists(lists);
      setSuccess('Your list was successfully deleted.');
    } catch (error) {
      failure(error);
    }
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
