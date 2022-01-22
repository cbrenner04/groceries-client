import React, { useCallback, useState } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';

import ListForm from '../components/ListForm';
import axios from '../../../utils/api';
import { sortLists, failure } from '../utils';
import PendingLists from '../components/PendingLists';
import AcceptedLists from '../components/AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';
import { list } from '../../../types';
import { fetchLists } from '../utils';
import { usePolling } from '../../../hooks';

// TODO: can we do better?
const isSameSet = (newSet, oldSet) => JSON.stringify(newSet) === JSON.stringify(oldSet);

function ListsContainer(props) {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [incompleteLists, setIncompleteLists] = useState(props.incompleteLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  usePolling(async () => {
    try {
      const {
        pendingLists: updatedPending,
        completedLists: updatedCompleted,
        incompleteLists: updatedIncomplete,
        currentUserPermissions: updatedCurrentUserPermissions,
      } = await fetchLists({ navigate });
      const pendingSame = isSameSet(updatedPending, pendingLists);
      const completedSame = isSameSet(updatedCompleted, completedLists);
      const incompleteSame = isSameSet(updatedIncomplete, incompleteLists);
      const userPermsSame = isSameSet(updatedCurrentUserPermissions, currentUserPermissions);
      if (!pendingSame) {
        setPendingLists(updatedPending);
      }
      if (!completedSame) {
        setCompletedLists(updatedCompleted);
      }
      if (!incompleteSame) {
        setIncompleteLists(updatedIncomplete);
      }
      if (!userPermsSame) {
        setCurrentUserPermissions(updatedCurrentUserPermissions);
      }
    } catch ({ response }) {
      // `response` will not be undefined if the response from the server comes back
      // 401 is handled in `fetchLists`, 403 and 404 is not possible so this will most likely only be a 500
      // if we aren't getting a response back we can assume there are network issues
      const errorMessage = response
        ? 'Something went wrong.'
        : 'You may not be connected to the internet. Please check your connection.';
      toast(`${errorMessage} Data may be incomplete and user actions may not persist.`, {
        type: 'error',
        autoClose: 5000,
      });
    }
  }, 10000);

  const handleFormSubmit = async (list) => {
    setPending(true);
    try {
      const { data } = await axios.post(`/lists`, { list });
      // must update currentUserPermissions prior to incompleteLists
      const updatedCurrentUserPermissions = update(currentUserPermissions, { [data.id]: { $set: 'write' } });
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      const updatedIncompleteLists = update(incompleteLists, { $push: [data] });
      setIncompleteLists(sortLists(updatedIncompleteLists));
      setPending(false);
      toast('List successfully added.', { type: 'info' });
    } catch (error) {
      failure(error, navigate, setPending);
    }
  };

  const moveList = useCallback(
    (dragIndex, hoverIndex) => {
      const dragList = incompleteLists[dragIndex];
      setIncompleteLists(
        update(incompleteLists, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragList],
          ],
        }),
      );
    },
    [incompleteLists, setIncompleteLists],
  );

  return (
    <>
      <h1>Lists</h1>
      <ListForm onFormSubmit={handleFormSubmit} pending={pending} />
      <hr className="mb-4" />
      {pendingLists.length > 0 && ( // cannot just check length as it will render 0
        <PendingLists
          userId={props.userId}
          currentUserPermissions={currentUserPermissions}
          pendingLists={pendingLists}
          setPendingLists={setPendingLists}
          completedLists={completedLists}
          setCompletedLists={setCompletedLists}
          incompleteLists={incompleteLists}
          setIncompleteLists={setIncompleteLists}
        />
      )}
      <AcceptedLists
        title={
          <TitlePopover
            title="Incomplete"
            message="These are lists you've created or you've accepted an invitation from someone else."
          />
        }
        completed={false}
        fullList={false}
        userId={props.userId}
        incompleteLists={incompleteLists}
        setIncompleteLists={setIncompleteLists}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
        moveList={moveList}
      />
      <AcceptedLists
        title={
          <TitlePopover
            title="Completed"
            message={
              <>
                These are the completed lists most recently created.&nbsp;
                <Link to="/completed_lists">See all completed lists here.</Link>&nbsp; Previously refreshed lists are
                marked with an asterisk (*).
              </>
            }
          />
        }
        completed={true}
        fullList={false}
        userId={props.userId}
        incompleteLists={incompleteLists}
        setIncompleteLists={setIncompleteLists}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
        moveList={moveList}
      />
    </>
  );
}

ListsContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  pendingLists: PropTypes.arrayOf(list).isRequired,
  completedLists: PropTypes.arrayOf(list).isRequired,
  incompleteLists: PropTypes.arrayOf(list).isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ListsContainer;
