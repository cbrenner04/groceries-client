import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import AcceptedLists from '../components/AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';
import { fetchCompletedLists } from '../utils';
import { usePolling } from '../../../hooks';
import { IList, TUserPermissions } from '../../../typings';

interface ICompletedListContainer {
  userId: string;
  completedLists: IList[];
  currentUserPermissions: TUserPermissions;
}

const CompletedListsContainer: React.FC<ICompletedListContainer> = (props) => {
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const navigate = useNavigate();

  usePolling(async () => {
    try {
      const lists = await fetchCompletedLists({ navigate });
      if (lists) {
        const { completedLists: updatedCompletedLists, currentUserPermissions: updatedUserPerms } = lists;
        const isSameSet = (newSet: IList[] | TUserPermissions, oldSet: IList[] | TUserPermissions) =>
          JSON.stringify(newSet) === JSON.stringify(oldSet);
        const completedSame = isSameSet(updatedCompletedLists, completedLists);
        const userPermsSame = isSameSet(updatedUserPerms, currentUserPermissions);
        if (!completedSame) {
          setCompletedLists(updatedCompletedLists);
        }
        if (!userPermsSame) {
          setCurrentUserPermissions(updatedUserPerms);
        }
      }
    } catch (err: any) {
      // `response` will not be undefined if the response from the server comes back
      // 401 is handled in `fetchLists`, 403 and 404 is not possible so this will most likely only be a 500
      // if we aren't getting a response back we can assume there are network issues
      const errorMessage = err.response
        ? 'Something went wrong.'
        : 'You may not be connected to the internet. Please check your connection.';
      toast(`${errorMessage} Data may be incomplete and user actions may not persist.`, {
        type: 'error',
        autoClose: 5000,
      });
    }
  }, 10000);

  return (
    <>
      <div className="clearfix mb-3">
        <Link to="/lists" className="float-end">
          Back to lists
        </Link>
      </div>
      <AcceptedLists
        title={
          <TitlePopover
            title="Completed Lists"
            message={'Previously refreshed lists are marked with an asterisk (*).'}
          />
        }
        completed={true}
        fullList={true}
        userId={props.userId}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
        setIncompleteLists={() => undefined}
        incompleteLists={[]}
      />
    </>
  );
};

export default CompletedListsContainer;
