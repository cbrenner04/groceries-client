import React, { useState } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

import ListForm from '../components/ListForm';
import Lists from '../components/Lists';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';
import { sortLists } from '../utils';
import Loading from '../../../components/Loading';
import MergeModal from '../components/MergeModal';

function ListsContainer(props) {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [nonCompletedLists, setNonCompletedLists] = useState(props.nonCompletedLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [listsToDelete, setListsToDelete] = useState([]);
  const [listToReject, setListToReject] = useState('');
  const [listsToRemove, setListsToRemove] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);
  const [pending, setPending] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeName, setMergeName] = useState('');
  const [listsToMerge, setListsToMerge] = useState([]);

  const failure = ({ request, response, message }) => {
    if (response) {
      if (response.status === 401) {
        toast('You must sign in', { type: 'error' });
        props.history.push('/users/sign_in');
      } else if ([403, 404].includes(response.status)) {
        toast('List not found', { type: 'error' });
      } else {
        setPending(false);
        const responseTextKeys = Object.keys(response.data);
        const responseErrors = responseTextKeys.map((key) => `${key} ${response.data[key]}`);
        toast(responseErrors.join(' and '), { type: 'error' });
      }
    } else if (request) {
      setPending(false);
      toast('Something went wrong', { type: 'error' });
    } else {
      setPending(false);
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

  const resetMultiSelect = () => {
    setSelectedLists([]);
    setMultiSelect(false);
  };

  const pluralize = (listCount) => {
    return listCount > 1 ? 'Lists' : 'List';
  };

  const handleDelete = (list) => {
    const lists = selectedLists.length ? selectedLists : [list];
    const ownedLists = lists.filter((l) => props.userId === l.owner_id);
    const sharedLists = lists.filter((l) => props.userId !== l.owner_id);
    if (ownedLists.length) {
      setListsToDelete(ownedLists);
      setShowDeleteConfirm(true);
    }
    if (sharedLists.length) {
      setListsToRemove(sharedLists);
      setShowRemoveConfirm(true);
    }
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    const deleteRequests = listsToDelete.map((list) => axios.delete(`lists/${list.id}`));
    try {
      await Promise.all(deleteRequests);
      let updatedCompletedLists = completedLists;
      let updatedNonCompletedLists = nonCompletedLists;
      listsToDelete.forEach(({ completed, id }) => {
        if (completed) {
          updatedCompletedLists = updatedCompletedLists.filter((ll) => ll.id !== id);
        } else {
          updatedNonCompletedLists = updatedNonCompletedLists.filter((ll) => ll.id !== id);
        }
      });
      setCompletedLists(sortLists(updatedCompletedLists));
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      resetMultiSelect();
      setListsToDelete([]);
      toast(`${pluralize(listsToDelete.length)} successfully deleted.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleRemoveConfirm = async () => {
    setShowRemoveConfirm(false);
    const removeRequests = listsToRemove.map((list) =>
      axios.patch(`/lists/${list.id}/users_lists/${list.users_list_id}`, {
        users_list: { has_accepted: false },
      }),
    );
    try {
      await Promise.all(removeRequests);
      let updatedCompletedLists = completedLists;
      let updatedNonCompletedLists = nonCompletedLists;
      listsToRemove.forEach(({ completed, id }) => {
        if (completed) {
          updatedCompletedLists = updatedCompletedLists.filter((ll) => ll.id !== id);
        } else {
          updatedNonCompletedLists = updatedNonCompletedLists.filter((ll) => ll.id !== id);
        }
      });
      setCompletedLists(sortLists(updatedCompletedLists));
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      resetMultiSelect();
      setListsToRemove([]);
      toast(`${pluralize(listsToRemove.length)} successfully removed.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleCompletion = async (list) => {
    const lists = selectedLists.length ? selectedLists : [list];
    // can only complete lists you own
    const ownedLists = lists.filter((l) => props.userId === l.owner_id);
    const filteredLists = ownedLists.filter((l) => !l.completed);
    const filteredListsIds = filteredLists.map((l) => l.id);
    const updateRequests = filteredLists.map((l) => axios.put(`lists/${l.id}`, { list: { completed: true } }));
    try {
      await Promise.all(updateRequests);
      const updatedNonCompletedLists = nonCompletedLists.filter((nonList) => !filteredListsIds.includes(nonList.id));
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      let updatedCompletedLists = completedLists;
      filteredLists.forEach((l) => {
        l.completed = true;
        updatedCompletedLists = update(updatedCompletedLists, { $push: [l] });
      });
      setCompletedLists(sortLists(updatedCompletedLists));
      resetMultiSelect();
      toast(`${pluralize(filteredLists.length)} successfully completed.`, { type: 'info' });
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

  const handleRefresh = async (list) => {
    setPending(true);
    const lists = selectedLists.length ? selectedLists : [list];
    const ownedLists = lists.map((l) => (props.userId === l.owner_id ? l : undefined)).filter(Boolean);
    const filteredLists = ownedLists.filter((l) => l.completed);
    filteredLists.forEach((l) => {
      l.refreshed = true;
    });
    const refreshRequests = filteredLists.map((l) => axios.post(`/lists/${l.id}/refresh_list`, {}));
    try {
      const responses = await Promise.all(refreshRequests);
      let updatedCurrentUserPermissions = currentUserPermissions;
      let updatedNonCompletedLists = nonCompletedLists;
      responses.forEach(({ data }) => {
        updatedCurrentUserPermissions = update(updatedCurrentUserPermissions, { [data.id]: { $set: 'write' } });
        updatedNonCompletedLists = update(updatedNonCompletedLists, { $push: [data] });
      });
      // must update currentUserPermissions prior to nonCompletedLists
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      setPending(false);
      resetMultiSelect();
      toast(`${pluralize(filteredLists.length)} successfully refreshed.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const mergeLists = () => {
    // just using the first list selected arbitrarily
    const listType = selectedLists[0].type;
    const filteredLists = selectedLists.filter((l) => l.type === listType);
    setListsToMerge(filteredLists);
    setShowMergeModal(true);
  };

  const handleMergeConfirm = async () => {
    setPending(true);
    const listIds = listsToMerge.map((l) => l.id).join(',');
    try {
      const { data } = await axios.post('/lists/merge_lists', {
        merge_lists: { list_ids: listIds, new_list_name: mergeName },
      });
      const updatedCurrentUserPermissions = update(currentUserPermissions, { [data.id]: { $set: 'write' } });
      const updatedNonCompletedLists = update(nonCompletedLists, { $push: [data] });
      // must update currentUserPermissions prior to nonCompletedLists
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      setNonCompletedLists(sortLists(updatedNonCompletedLists));
      setMergeName('');
      setPending(false);
      setShowMergeModal(false);
      resetMultiSelect();
      toast('Lists successfully merged.', { type: 'info' });
    } catch (err) {
      failure(err);
    }
  };

  return (
    <>
      {pending && <Loading />}
      {!pending && (
        <>
          <h1>Lists</h1>
          <ListForm onFormSubmit={handleFormSubmit} />
          <hr className="mb-4" />
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
            multiSelect={multiSelect}
            setMultiSelect={setMultiSelect}
            selectedLists={selectedLists}
            setSelectedLists={setSelectedLists}
            handleMerge={mergeLists}
          />
          <ConfirmModal
            action="delete"
            body={`Are you sure you want to delete the following lists? ${listsToDelete
              .map((list) => list.name)
              .join(', ')}`}
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
              `Are you sure you want to remove the following lists? The list will continue to exist for the owner, ` +
              `you will just be removed from the list of users. ${listsToRemove.map((list) => list.name).join(', ')}`
            }
            show={showRemoveConfirm}
            handleConfirm={() => handleRemoveConfirm()}
            handleClear={() => setShowRemoveConfirm(false)}
          />
          <MergeModal
            showModal={showMergeModal}
            clearModal={() => setShowMergeModal(false)}
            listNames={listsToMerge.map((l) => l.name).join('", "')}
            mergeName={mergeName}
            handleMergeNameChange={({ target: { value } }) => setMergeName(value)}
            handleMergeConfirm={handleMergeConfirm}
          />
        </>
      )}
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
