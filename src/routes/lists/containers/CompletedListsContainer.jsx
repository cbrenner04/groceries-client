import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button } from 'react-bootstrap';

import List from '../components/List';
import ConfirmModal from '../../../components/ConfirmModal';
import axios from '../../../utils/api';
import Loading from '../../../components/Loading';

function CompletedListsContainer(props) {
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [listsToDelete, setListsToDelete] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [listsToRemove, setListsToRemove] = useState([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);
  const [pending, setPending] = useState(false);

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

  const resetMultiSelect = () => {
    setSelectedLists([]);
    setMultiSelect(false);
  };

  const pluralize = (listCount) => {
    return listCount > 1 ? 'Lists' : 'List';
  };

  const handleRefresh = async (list) => {
    setPending(true);
    const lists = selectedLists.length ? selectedLists : [list];
    const ownedLists = lists.map((l) => (l.user_id === l.owner_id ? l : undefined)).filter(Boolean);
    ownedLists.forEach((l) => {
      l.refreshed = true;
    });
    const refreshRequests = ownedLists.map((l) => axios.post(`/lists/${l.id}/refresh_list`, {}));
    try {
      await Promise.all(refreshRequests);
      setPending(false);
      resetMultiSelect();
      toast(`${pluralize(ownedLists.length)} successfully refreshed.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  const handleDelete = (list) => {
    const lists = selectedLists.length ? selectedLists : [list];
    const ownedLists = lists.map((l) => (l.user_id === l.owner_id ? l : undefined)).filter(Boolean);
    const sharedLists = lists.map((l) => (l.user_id !== l.owner_id ? l : undefined)).filter(Boolean);
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
      listsToDelete.forEach(({ id }) => {
        updatedCompletedLists = updatedCompletedLists.filter((ll) => ll.id !== id);
      });
      setCompletedLists(updatedCompletedLists);
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
      listsToRemove.forEach(({ completed, id }) => {
        updatedCompletedLists = updatedCompletedLists.filter((ll) => ll.id !== id);
      });
      setCompletedLists(updatedCompletedLists);
      resetMultiSelect();
      setListsToRemove([]);
      toast(`${pluralize(listsToRemove.length)} successfully removed.`, { type: 'info' });
    } catch (error) {
      failure(error);
    }
  };

  return (
    <>
      {pending && <Loading />}
      {!pending && (
        <>
          <h1>Completed Lists</h1>
          <div className="clearfix">
            <Link to="/lists" className="float-right">
              Back to lists
            </Link>
            <p className="float-left">Previously refreshed lists are marked with an asterisk (*).</p>
          </div>{' '}
          <div className="clearfix">
            <Button
              variant="link"
              className="mx-auto float-right"
              onClick={() => {
                if (multiSelect && selectedLists.length > 0) {
                  setSelectedLists([]);
                }
                setMultiSelect(!multiSelect);
              }}
            >
              {multiSelect ? 'Hide' : ''} Select
            </Button>
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
                multiSelect={multiSelect}
                selectedLists={selectedLists}
                setSelectedLists={setSelectedLists}
                accepted
              />
            ))}
          </ListGroup>
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
            action="remove"
            body={
              `Are you sure you want to remove the following lists? The list will continue to exist for the owner, ` +
              `you will just be removed from the list of users. ${listsToRemove.map((list) => list.name).join(', ')}`
            }
            show={showRemoveConfirm}
            handleConfirm={() => handleRemoveConfirm()}
            handleClear={() => setShowRemoveConfirm(false)}
          />
        </>
      )}
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
