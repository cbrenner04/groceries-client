import React, { useState } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import ListForm from '../components/ListForm';
import Lists from '../components/Lists';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';
import { sortLists } from '../utils';

function ListsContainer(props) {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [nonCompletedLists, setNonCompletedLists] = useState(props.nonCompletedLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [listToDelete, setListToDelete] = useState('');
  const [listToReject, setListToReject] = useState('');
  const [listToRemove, setListToRemove] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const failure = ({ request, response, message }) => {
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

  const handleFormSubmit = async (list) => {
    try {
      const { data } = await axios.post(`/lists`, { list });
      // must update currentUserPermissions prior to nonCompletedLists
      const updatedCurrentUserPermissions = update(currentUserPermissions, { [data.id]: { $set: 'write' } });
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      toast('List successfully added.', { type: 'info' });
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
    const { id, completed } = listToDelete;
    try {
      await axios.delete(`/lists/${id}`);
      if (completed) {
        const updatedCompletedLists = completedLists.filter((ll) => ll.id !== id);
        setCompletedLists(sortLists(updatedCompletedLists));
      } else {
        const updatedNonCompletedLists = nonCompletedLists.filter((ll) => ll.id !== id);
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
      }
      toast('List successfully deleted.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleCompletion = async (list) => {
    const theList = list;
    theList.completed = true;
    try {
      await axios.put(`/lists/${theList.id}`, { list: { completed: true } });
      const updatedNonCompletedLists = nonCompletedLists.filter((nonList) => nonList.id !== theList.id);
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      const updatedCompletedLists = update(completedLists, { $push: [theList] });
      setCompletedLists(sortLists(updatedCompletedLists));
      toast('List successfully completed.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const removeListFromUnaccepted = (listId) => {
    const updatedPendingLists = pendingLists.filter((list) => list.id !== listId);
    setPendingLists(updatedPendingLists);
  };

  const acceptList = async (list) => {
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
      toast('List successfully accepted.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleAccept = (list) => {
    removeListFromUnaccepted(list.id);
    acceptList(list);
  };

  const handleReject = (list) => {
    setListToReject(list);
    setShowRejectConfirm(true);
  };

  const handleRejectConfirm = async () => {
    setShowRejectConfirm(false);
    try {
      await axios.patch(`/lists/${listToReject.id}/users_lists/${listToReject.users_list_id}`, {
        users_list: { has_accepted: false },
      });
      removeListFromUnaccepted(listToReject.id);
      toast('List successfully rejected.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleRemove = (list) => {
    setListToRemove(list);
    setShowRemoveConfirm(true);
  };

  const handleRemoveConfirm = async () => {
    setShowRemoveConfirm(false);
    const { id, completed } = listToRemove;
    try {
      await axios.patch(`/lists/${listToRemove.id}/users_lists/${listToRemove.users_list_id}`, {
        users_list: { has_accepted: false },
      });
      if (completed) {
        const updatedCompletedLists = completedLists.filter((ll) => ll.id !== id);
        setCompletedLists(sortLists(updatedCompletedLists));
      } else {
        const updatedNonCompletedLists = nonCompletedLists.filter((ll) => ll.id !== id);
        setNonCompletedLists(sortLists(updatedNonCompletedLists));
      }
      toast('List successfully removed.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleRefresh = async (list) => {
    const localList = list;
    localList.refreshed = true;
    try {
      const { data } = await axios.post(`/lists/${list.id}/refresh_list`, {});
      // must update currentUserPermissions prior to nonCompletedLists
      const updatedCurrentUserPermissions = update(currentUserPermissions, { [data.id]: { $set: 'write' } });
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      toast('List successfully refreshed.', { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  return (
    <>
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
        currentUserPermissions={currentUserPermissions}
        onRemove={handleRemove}
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
      <ConfirmModal
        action="remove"
        body={
          'Are you sure you want to remove this list? The list will continue to exist for the owner, you will ' +
          'just be removed from the list of users.'
        }
        show={showRemoveConfirm}
        handleConfirm={() => handleRemoveConfirm()}
        handleClear={() => setShowRemoveConfirm(false)}
      />
    </>
  );
}

ListsContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  userId: PropTypes.number.isRequired,
  pendingLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number.isRequired,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  completedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number.isRequired,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  nonCompletedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number.isRequired,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ListsContainer;
