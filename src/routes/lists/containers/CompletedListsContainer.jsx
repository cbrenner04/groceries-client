import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Alert from '../../../components/Alert';
import List from '../components/List';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';

function CompletedListsContainer(props) {
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [listToDelete, setListToDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const dismissAlert = () => {
    setSuccess('');
    setErrors('');
  };

  const failure = ({ response, request, message }) => {
    if (response) {
      if (response.status === 401) {
        props.history.push({
          pathname: '/users/sign_in',
          state: { errors: 'You must sign in' },
        });
      } else if ([403, 404].includes(response.status)) {
        setErrors('List not found');
      } else {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
        setErrors(responseErrors.join(' and '));
      }
    } else if (request) {
      setErrors('Something went wrong');
    } else {
      setErrors(message);
    }
  };

  const handleRefresh = async (list) => {
    dismissAlert();
    try {
      await axios.post(`/lists/${list.id}/refresh_list`, {});
      const refreshedList = completedLists.find((completedList) => completedList.id === list.id);
      refreshedList.refreshed = true;
      setSuccess('Your list was successfully refreshed.');
    } catch (error) {
      failure(error);
    }
  };

  const handleDelete = (list) => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    dismissAlert();
    setShowDeleteConfirm(false);
    try {
      await axios.delete(`/lists/${listToDelete.id}`);
      const lists = completedLists.filter((cl) => cl.id !== listToDelete.id);
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
        {completedLists.map((list) => (
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

CompletedListsContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  completedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number,
    }),
  ),
};

export default CompletedListsContainer;
