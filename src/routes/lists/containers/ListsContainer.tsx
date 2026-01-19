import React, { useEffect, useState } from 'react';
import update from 'immutability-helper';
import { showToast } from '../../../utils/toast';
import { Link, useNavigate } from 'react-router';

import axios from 'utils/api';
import TitlePopover from 'components/TitlePopover';
import { usePolling } from 'hooks';
import type { IList, TUserPermissions } from 'typings';

import ListForm from '../components/ListForm';
import { fetchLists, sortLists, failure, type IFetchListsReturn } from '../utils';
import { listsDeduplicator } from 'utils/requestDeduplication';
import { listsCache } from 'utils/lightweightCache';
import { prefetchListsIdle } from 'utils/listPrefetch';
import PendingLists from '../components/PendingLists';
import AcceptedLists from '../components/AcceptedLists';

export interface IListsContainerProps {
  userId: string;
  pendingLists: IList[];
  completedLists: IList[];
  incompleteLists: IList[];
  currentUserPermissions: TUserPermissions;
}

const MAX_PREFETCH_LISTS = 5;

const ListsContainer: React.FC<IListsContainerProps> = (props): React.JSX.Element => {
  const [pendingLists, setPendingLists] = useState(props.pendingLists);
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [incompleteLists, setIncompleteLists] = useState(props.incompleteLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  usePolling(
    async () => {
      try {
        const lists = await listsDeduplicator.execute('lists', () => fetchLists({ navigate }));
        /* istanbul ignore else */
        if (lists) {
          const {
            pendingLists: updatedPending,
            completedLists: updatedCompleted,
            incompleteLists: updatedIncomplete,
            currentUserPermissions: updatedCurrentUserPermissions,
          } = lists as IFetchListsReturn;

          // Use lightweight cache to avoid re-render churn for identical data
          const pendingCacheKey = 'lists-pending';
          const completedCacheKey = 'lists-completed';
          const incompleteCacheKey = 'lists-incomplete';
          const permissionsCacheKey = 'lists-permissions';

          const pendingResult = listsCache.get(pendingCacheKey, updatedPending);
          const completedResult = listsCache.get(completedCacheKey, updatedCompleted);
          const incompleteResult = listsCache.get(incompleteCacheKey, updatedIncomplete);
          const permissionsResult = listsCache.get(permissionsCacheKey, updatedCurrentUserPermissions);

          // Only update state if data has actually changed
          if (pendingResult.hasChanged) {
            setPendingLists(updatedPending);
          }
          if (completedResult.hasChanged) {
            setCompletedLists(updatedCompleted);
          }
          if (incompleteResult.hasChanged) {
            setIncompleteLists(updatedIncomplete);
          }
          if (permissionsResult.hasChanged) {
            setCurrentUserPermissions(updatedCurrentUserPermissions);
          }
        }
      } catch (err: unknown) {
        const errorMessage = 'You may not be connected to the internet. Please check your connection.';
        showToast.error(`${errorMessage} Data may be incomplete and user actions may not persist.`);
      }
    },
    parseInt(process.env.REACT_APP_POLLING_INTERVAL ?? '10000', 10),
  );

  // Idle prefetch for visible lists to improve navigation performance
  useEffect(() => {
    // Allow tests to disable idle prefetch
    if (process.env.REACT_APP_PREFETCH_IDLE === 'false') {
      return;
    }

    // Get all visible list IDs for prefetching
    const allVisibleLists = [...pendingLists, ...incompleteLists];
    const listIds = allVisibleLists
      .slice(0, MAX_PREFETCH_LISTS) // Limit to first 5 lists to avoid overwhelming
      .filter((list): list is IList & { id: string } => typeof list.id === 'string' && list.id.length > 0)
      .map((list) => list.id);

    if (listIds.length > 0) {
      // Prefetch during idle time
      void prefetchListsIdle(listIds);
    }
  }, [pendingLists, incompleteLists]);

  const handleFormSubmit = async (list: IList): Promise<void> => {
    setPending(true);
    try {
      const { data } = await axios.post('/lists', { list });
      // must update currentUserPermissions prior to incompleteLists
      const updatedCurrentUserPermissions = update(currentUserPermissions, { [data.id]: { $set: 'write' } });
      setCurrentUserPermissions(updatedCurrentUserPermissions);
      const updatedIncompleteLists = update(incompleteLists, { $push: [data] });
      setIncompleteLists(sortLists(updatedIncompleteLists));
      setPending(false);
      showToast.info('List successfully added.');
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
