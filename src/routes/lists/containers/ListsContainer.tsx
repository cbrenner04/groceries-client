import React, { useState } from 'react';
import update from 'immutability-helper';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router';

import axios from 'utils/api';
import TitlePopover from 'components/TitlePopover';
import { usePolling } from 'hooks';
import type { IList, TUserPermissions } from 'typings';

import ListForm from '../components/ListForm';
import { fetchLists, sortLists, failure } from '../utils';
import PendingLists from '../components/PendingLists';
import AcceptedLists from '../components/AcceptedLists';

const isSameSet = (newSet: TUserPermissions | IList[], oldSet: TUserPermissions | IList[]): boolean =>
  JSON.stringify(newSet) === JSON.stringify(oldSet);

export interface IListsContainerProps {
  userId: string;
  pendingLists: IList[];
  completedLists: IList[];
  incompleteLists: IList[];
  currentUserPermissions: TUserPermissions;
}

const ListsContainer: React.FC<IListsContainerProps> = (props): React.JSX.Element => {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [incompleteLists, setIncompleteLists] = useState(props.incompleteLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  usePolling(async () => {
    try {
      const lists = await fetchLists({ navigate });
      /* istanbul ignore else */
      if (lists) {
        const {
          pendingLists: updatedPending,
          completedLists: updatedCompleted,
          incompleteLists: updatedIncomplete,
          currentUserPermissions: updatedCurrentUserPermissions,
        } = lists;
        const pendingSame = isSameSet(updatedPending, pendingLists);
        const completedSame = isSameSet(updatedCompleted, completedLists);
        const incompleteSame = isSameSet(updatedIncomplete, incompleteLists);
        const userPermsSame = isSameSet(updatedCurrentUserPermissions, currentUserPermissions);
        /* istanbul ignore else */
        if (!pendingSame) {
          setPendingLists(updatedPending);
        }
        /* istanbul ignore else */
        if (!completedSame) {
          setCompletedLists(updatedCompleted);
        }
        /* istanbul ignore else */
        if (!incompleteSame) {
          setIncompleteLists(updatedIncomplete);
        }
        /* istanbul ignore else */
        if (!userPermsSame) {
          setCurrentUserPermissions(updatedCurrentUserPermissions);
        }
      }
    } catch (err: unknown) {
      const errorMessage = 'You may not be connected to the internet. Please check your connection.';
      toast(`${errorMessage} Data may be incomplete and user actions may not persist.`, {
        type: 'error',
        autoClose: 5000,
      });
    }
  }, 10000);

  const handleFormSubmit = async (list: IList): Promise<void> => {
    setPending(true);
    try {
      const { data } = await axios.post('/v2/lists', { list });
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

  return (
    <React.Fragment>
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
      />
      <AcceptedLists
        title={
          <TitlePopover
            title="Completed"
            message={
              <React.Fragment>
                These are the completed lists most recently created.&nbsp;
                <Link to="/completed_lists">See all completed lists here.</Link>&nbsp; Previously refreshed lists are
                marked with an asterisk (*).
              </React.Fragment>
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
      />
    </React.Fragment>
  );
};

export default ListsContainer;
