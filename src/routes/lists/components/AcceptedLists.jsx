import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import update from 'immutability-helper';
import { useNavigate } from 'react-router-dom';

import axios from '../../../utils/api';
import { sortLists, failure, pluralize } from '../utils';
import ConfirmModal from '../../../components/ConfirmModal';
import MergeModal from './MergeModal';
import List from './List';
import CompleteListButtons from './CompleteListButtons';
import IncompleteListButtons from './IncompleteListButtons';
import Lists from './Lists';
import { list } from '../../../types';

function AcceptedLists(props) {
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);
  const [listsToDelete, setListsToDelete] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listsToMerge, setListsToMerge] = useState([]);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeName, setMergeName] = useState('');
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const resetMultiSelect = () => {
    setSelectedLists([]);
    setMultiSelect(false);
  };

  const handleDelete = (list) => {
    const lists = selectedLists.length ? selectedLists : [list];
    setListsToDelete(lists);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteConfirm(false);
    setPending(true);
    const ownedLists = listsToDelete.filter((l) => props.userId === l.owner_id);
    const sharedLists = listsToDelete.filter((l) => props.userId !== l.owner_id);
    const deleteRequests = ownedLists.map((list) => axios.delete(`lists/${list.id}`));
    const removeRequests = sharedLists.map((list) =>
      axios.patch(`/lists/${list.id}/users_lists/${list.users_list_id}`, {
        users_list: { has_accepted: false },
      }),
    );
    try {
      await Promise.all(deleteRequests.concat(removeRequests));
      let updatedLists = props.completed ? props.completedLists : props.incompleteLists;
      listsToDelete.forEach(({ id }) => {
        updatedLists = updatedLists.filter((ll) => ll.id !== id);
      });
      updatedLists = sortLists(updatedLists);
      props.completed ? props.setCompletedLists(updatedLists) : props.setIncompleteLists(updatedLists);
      resetMultiSelect();
      setListsToDelete([]);
      setPending(false);
      toast(`${pluralize(listsToDelete.length)} successfully deleted.`, { type: 'info' });
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const handleMerge = () => {
    // just using the first list selected arbitrarily
    const listType = selectedLists[0].type;
    const filteredLists = selectedLists.filter((l) => l.type === listType);
    setListsToMerge(filteredLists);
    setShowMergeModal(true);
  };

  // TODO: this does not get triggered if you hit enter when in modal
  const handleMergeConfirm = async () => {
    setShowMergeModal(false);
    setPending(true);
    const listIds = listsToMerge.map((l) => l.id).join(',');
    try {
      const { data } = await axios.post('/lists/merge_lists', {
        merge_lists: { list_ids: listIds, new_list_name: mergeName },
      });
      // it is unnecessary to update incompleteLists and currentUserPermissions when on completed list page
      if (!props.completed || !props.fullList) {
        const updatedCurrentUserPermissions = update(props.currentUserPermissions, { [data.id]: { $set: 'write' } });
        const updatedIncompleteLists = update(props.incompleteLists, { $push: [data] });
        // must update currentUserPermissions prior to incompleteLists
        props.setCurrentUserPermissions(updatedCurrentUserPermissions);
        props.setIncompleteLists(sortLists(updatedIncompleteLists));
      }
      resetMultiSelect();
      setListsToMerge([]);
      setPending(false);
      toast('Lists successfully merged.', { type: 'info' });
    } catch (err) {
      failure(err, navigate, setPending);
    }
  };

  const handleCompletion = async (list) => {
    setPending(true);
    const lists = selectedLists.length ? selectedLists : [list];
    // can only complete lists you own
    const ownedLists = lists.filter((l) => props.userId === l.owner_id);
    const filteredLists = ownedLists.filter((l) => !l.completed);
    const filteredListsIds = filteredLists.map((l) => l.id);
    const updateRequests = filteredLists.map((l) => axios.put(`lists/${l.id}`, { list: { completed: true } }));
    try {
      await Promise.all(updateRequests);
      const updatedIncompleteLists = props.incompleteLists.filter((nonList) => !filteredListsIds.includes(nonList.id));
      props.setIncompleteLists(sortLists(updatedIncompleteLists));
      let updatedCompletedLists = props.completedLists;
      filteredLists.forEach((l) => {
        l.completed = true;
        updatedCompletedLists = update(updatedCompletedLists, { $push: [l] });
      });
      props.setCompletedLists(sortLists(updatedCompletedLists));
      resetMultiSelect();
      setPending(false);
      toast(`${pluralize(filteredLists.length)} successfully completed.`, { type: 'info' });
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const handleRefresh = async (list) => {
    setPending(true);
    const lists = selectedLists.length ? selectedLists : [list];
    const ownedLists = lists.map((l) => (props.userId === l.owner_id ? l : undefined)).filter(Boolean);
    ownedLists.forEach((l) => {
      l.refreshed = true;
    });
    const refreshRequests = ownedLists.map((l) => axios.post(`/lists/${l.id}/refresh_list`, {}));
    try {
      const responses = await Promise.all(refreshRequests);
      // it is unnecessary to update incompleteLists and currentUserPermissions when on completed list page
      if (!props.completed || !props.fullList) {
        let updatedCurrentUserPermissions = props.currentUserPermissions;
        let updatedIncompleteLists = props.incompleteLists;
        responses.forEach(({ data }) => {
          updatedCurrentUserPermissions = update(updatedCurrentUserPermissions, { [data.id]: { $set: 'write' } });
          updatedIncompleteLists = update(updatedIncompleteLists, { $push: [data] });
        });
        // must update currentUserPermissions prior to incompleteLists
        props.setCurrentUserPermissions(updatedCurrentUserPermissions);
        props.setIncompleteLists(sortLists(updatedIncompleteLists));
      }
      resetMultiSelect();
      setPending(false);
      toast(`${pluralize(ownedLists.length)} successfully refreshed.`, { type: 'info' });
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const lists = props.completed
    ? props.completedLists.map((list) => (
        <List
          list={list}
          key={list.id}
          multiSelect={multiSelect}
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
          listClass="accepted-list"
          testClass="completed-list"
          includeLinkToList={true}
          listName={`${list.name}${list.refreshed ? '*' : ''}`}
          listButtons={
            <CompleteListButtons
              userId={props.userId}
              list={list}
              onListDeletion={handleDelete}
              onListRefresh={handleRefresh}
              multiSelect={multiSelect}
              selectedLists={selectedLists}
              handleMerge={handleMerge}
              pending={pending}
            />
          }
        />
      ))
    : props.incompleteLists.map((list) => (
        <List
          list={list}
          key={list.id}
          multiSelect={multiSelect}
          selectedLists={selectedLists}
          setSelectedLists={setSelectedLists}
          listClass="accepted-list"
          testClass="incomplete-list"
          includeLinkToList={true}
          listName={list.name}
          listButtons={
            <IncompleteListButtons
              userId={props.userId}
              list={list}
              onListDeletion={handleDelete}
              onListCompletion={handleCompletion}
              currentUserPermissions={props.currentUserPermissions[list.id]}
              multiSelect={multiSelect}
              selectedLists={selectedLists}
              handleMerge={handleMerge}
              pending={pending}
            />
          }
        />
      ));

  return (
    <Lists
      title={props.title}
      multiSelect={multiSelect}
      selectedLists={selectedLists}
      setSelectedLists={setSelectedLists}
      setMultiSelect={setMultiSelect}
    >
      <ListGroup>{lists}</ListGroup>
      <ConfirmModal
        action="delete"
        body={
          <>
            <p>
              Are you sure you want to delete the following lists? The lists you do not own will continue to exist for
              the owner, you will just be removed from the list of users.
            </p>
            <p>{listsToDelete.map((list) => list.name).join(', ')}</p>
          </>
        }
        show={showDeleteConfirm}
        handleConfirm={() => handleDeleteConfirm()}
        handleClear={() => setShowDeleteConfirm(false)}
      />
      <MergeModal
        showModal={showMergeModal}
        clearModal={() => setShowMergeModal(false)}
        listNames={listsToMerge.map((l) => l.name).join('", "')}
        mergeName={mergeName}
        handleMergeNameChange={({ target: { value } }) => setMergeName(value)}
        handleMergeConfirm={handleMergeConfirm}
      />
    </Lists>
  );
}

AcceptedLists.propTypes = {
  completed: PropTypes.bool.isRequired,
  title: PropTypes.element.isRequired,
  userId: PropTypes.string.isRequired,
  incompleteLists: PropTypes.arrayOf(list),
  setIncompleteLists: PropTypes.func,
  completedLists: PropTypes.arrayOf(list).isRequired,
  setCompletedLists: PropTypes.func.isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
  setCurrentUserPermissions: PropTypes.func.isRequired,
  fullList: PropTypes.bool.isRequired,
};

/* istanbul ignore next */
AcceptedLists.defaultProps = {
  incompleteLists: [],
  setIncompleteLists: () => undefined,
};

export default AcceptedLists;
