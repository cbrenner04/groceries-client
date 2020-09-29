import React, { useCallback, useState } from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { TouchBackend } from 'react-dnd-touch-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';

import ListForm from '../components/ListForm';
import axios from '../../../utils/api';
import { sortLists, failure } from '../utils';
import PendingLists from '../components/PendingLists';
import AcceptedLists from '../components/AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';
import { list } from '../../../types';
import { fetchLists } from '../utils';
import { usePolling } from '../../../hooks';

function ListsContainer(props) {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [incompleteLists, setIncompleteLists] = useState(props.incompleteLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [pending, setPending] = useState(false);

  usePolling(async () => {
    const {
      pendingLists: updatedPending,
      completedLists: updatedCompleted,
      incompleteLists: updatedIncomplete,
      currentUserPermissions: updatedCurrentUserPermissions,
    } = await fetchLists({ history: props.history });
    const isSameSet = (newSet, oldSet) => JSON.stringify(newSet) === JSON.stringify(oldSet);
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
      failure(error, props.history, setPending);
    }
  };

  const persistMoveList = useCallback(async () => {
    const allLists = pendingLists.concat(incompleteLists, completedLists).reverse();
    const newRanks = allLists.map(({ users_list_id }, index) => ({
      users_list_id,
      rank: index + 1,
    }));
    try {
      const {
        data: {
          pending_lists: updatedPendingLists,
          accepted_lists: { completed_lists: updatedCompletedLists, not_completed_lists: updatedIncompleteLists },
        },
      } = await axios.post(`/update_list_ranks`, { updated_list_ranks: { new_ranks: newRanks } });
      setPendingLists(sortLists(updatedPendingLists));
      setCompletedLists(sortLists(updatedCompletedLists));
      setIncompleteLists(sortLists(updatedIncompleteLists));
    } catch (error) {
      failure(error, props.history, setPending);
    }
  }, [completedLists, incompleteLists, pendingLists, props.history]);

  const moveIncompleteList = useCallback(
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
    [incompleteLists],
  );

  const moveCompleteList = useCallback(
    (dragIndex, hoverIndex) => {
      const dragList = completedLists[dragIndex];
      setCompletedLists(
        update(completedLists, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragList],
          ],
        }),
      );
    },
    [completedLists],
  );

  const touchDevice = () => navigator.maxTouchPoints || 'ontouchstart' in document.documentElement;

  return (
    <DndProvider backend={touchDevice() ? TouchBackend : HTML5Backend}>
      <h1>Lists</h1>
      <ListForm onFormSubmit={handleFormSubmit} pending={pending} />
      <hr className="mb-4" />
      {pendingLists.length > 0 && ( // cannot just check length as it will render 0
        <PendingLists
          history={props.history}
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
        history={props.history}
        userId={props.userId}
        incompleteLists={incompleteLists}
        setIncompleteLists={setIncompleteLists}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
        moveIncompleteList={moveIncompleteList}
        persistMoveList={persistMoveList}
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
        completed
        history={props.history}
        userId={props.userId}
        incompleteLists={incompleteLists}
        setIncompleteLists={setIncompleteLists}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
        moveCompleteList={moveCompleteList}
        persistMoveList={persistMoveList}
      />
    </DndProvider>
  );
}

ListsContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  pendingLists: PropTypes.arrayOf(list).isRequired,
  completedLists: PropTypes.arrayOf(list).isRequired,
  incompleteLists: PropTypes.arrayOf(list).isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default ListsContainer;
