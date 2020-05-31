import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import List from '../components/List';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';

function CompletedListsContainer(props) {
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [listToDelete, setListToDelete] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const failure = ({ response, request, message }) => {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        props.history.push('/users/sign_in');
      } else if ([403, 404].includes(response.status)) {
        toast('List not found', { type: 'error' });
      } else {
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
        toast(responseErrors.join(' and '), { type: 'error' });
      }
    } else if (request) {
      toast('Something went wrong', { type: 'error' });
    } else {
      toast(message, { type: 'error' });
    }
  };

  const handleRefresh = async (list) => {
    try {
      await axios.post(`/lists/${list.id}/refresh_list`, {});
      const refreshedList = completedLists.find((completedList) => completedList.id === list.id);
      refreshedList.refreshed = true;
      toast('Your list was successfully refreshed.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleDelete = (list) => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    try {
      await axios.delete(`/lists/${listToDelete.id}`);
      const lists = completedLists.filter((cl) => cl.id !== listToDelete.id);
      setCompletedLists(lists);
      toast('Your list was successfully deleted.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  return (
    <>
      <h1>Completed Lists</h1>
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
            currentUserPermissions={props.currentUserPermissions[list.id]}
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
    push: PropTypes.func.isRequired,
  }).isRequired,
  completedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number,
      user_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default CompletedListsContainer;
