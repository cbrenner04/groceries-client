import React, { useState } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';

import Alert from '../../../components/Alert';
import ListForm from '../components/ListForm';
import Lists from '../components/Lists';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';
import { sortLists } from '../utils';

function ListsContainer(props) {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [nonCompletedLists, setNonCompletedLists] = useState(props.nonCompletedLists);
  const [errors, setErrors] = useState('');
  const [success, setSuccess] = useState('');
  const [listToDelete, setListToDelete] = useState('');
  const [listToReject, setListToReject] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleAlertDismiss = () => {
    setErrors('');
    setSuccess('');
  };

  const failure = ({ request, response, message }) => {
    if (response) {
      if (response.status === 401) {
        // TODO: how do we pass error messages along?
        props.history.push('/users/sign_in');
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

  const handleFormSubmit = async list => {
    handleAlertDismiss();
    try {
      const { data } = await axios.post(`/lists`, { list });
      const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      setSuccess('List successfully added.');
    } catch (error) {
      failure(error);
    }
  };

  const handleDelete = list => {
    setListToDelete(list);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    handleAlertDismiss();
    const { id, completed } = listToDelete;
    try {
      await axios.delete(`/lists/${id}`);
      if (completed) {
        const updatedCompletedLists = completedLists.filter(ll => ll.id !== id);
        setCompletedLists(sortLists(updatedCompletedLists));
      } else {
        const updatedNonCompletedLists = nonCompletedLists.filter(ll => ll.id !== id);
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
      }
      setSuccess('List successfully deleted.');
    } catch (error) {
      failure(error);
    }
  };

  const handleCompletion = async list => {
    handleAlertDismiss();
    const theList = list;
    theList.completed = true;
    try {
      await axios.put(`/lists/${theList.id}`, { list: { completed: true } });
      const updatedNonCompletedLists = nonCompletedLists.filter(nonList => nonList.id !== theList.id);
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      const updatedCompletedLists = update(completedLists, { $push: [theList] });
      setCompletedLists(sortLists(updatedCompletedLists));
      setSuccess('List successfully completed.');
    } catch (error) {
      failure(error);
    }
  };

  const removeListFromUnaccepted = listId => {
    const updatedPendingLists = pendingLists.filter(list => list.id !== listId);
    setPendingLists(updatedPendingLists);
  };

  const acceptList = async list => {
    handleAlertDismiss();
    try {
      await axios.patch(`/lists/${list.id}/users_lists/${list.users_list_id}`, { users_list: { has_accepted: true } });
      const { completed } = list;
      if (completed) {
        const updatedCompletedLists = update(completedLists, { $push: [list] });
        setCompletedLists(sortLists(updatedCompletedLists));
      } else {
        const updatedNonCompletedLists = update(nonCompletedLists, { $push: [list] });
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
      }
      setSuccess('List successfully accepted.');
    } catch (error) {
      failure(error);
    }
  };

  const handleAccept = list => {
    removeListFromUnaccepted(list.id);
    acceptList(list);
  };

  const handleReject = list => {
    setListToReject(list);
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = async () => {
    setShowRejectConfirm(false);
    handleAlertDismiss();
    try {
      await axios.patch(`/lists/${listToReject.id}/users_lists/${listToReject.users_list_id}`, {
        users_list: { has_accepted: false },
      });
      removeListFromUnaccepted(listToReject.id);
      setSuccess('List successfully rejected.');
    } catch (error) {
      failure(error);
    }
  };

  const handleRefresh = async list => {
    handleAlertDismiss();
    const localList = list;
    localList.refreshed = true;
    try {
      const { data } = await axios.post(`/lists/${list.id}/refresh_list`, {});
      const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      setSuccess('List successfully refreshed.');
    } catch (error) {
      failure(error);
    }
  };

  return (
    <>
      <Alert errors={errors} success={success} handleDismiss={handleAlertDismiss} />
      <h1>Lists</h1>
      <ListForm onFormSubmit={handleFormSubmit} />
      <hr />
      <Lists
        userId={props.userId}
        onListDelete={handleDelete}
        onListCompletion={handleCompletion}
        pendingLists={pendingLists}
        completedLists={completedLists}
        nonCompletedLists={nonCompletedLists}
        onListRefresh={handleRefresh}
        onAccept={handleAccept}
        onReject={handleReject}
        currentUserPermissions={props.currentUserPermissions}
      />
      <ConfirmModal
        action="delete"
        body="Are you sure you want to delete this list?"
        show={showDeleteConfirm}
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => setShowDeleteConfirm(false)}
      />
      <ConfirmModal
        action="reject"
        body="Are you sure you want to reject this list?"
        show={showRejectConfirm}
        handleConfirm={() => handleRejectConfirm()}
        handleClear={() => setShowRejectConfirm(false)}
      />
    </>
  );
}

ListsContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }),
  userId: PropTypes.number,
  pendingLists: PropTypes.arrayOf(
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
  nonCompletedLists: PropTypes.arrayOf(
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
  currentUserPermissions: PropTypes.objectOf(PropTypes.string),
};

export default ListsContainer;
