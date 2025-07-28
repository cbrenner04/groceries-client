import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import TitlePopover from 'components/TitlePopover';
import { usePolling } from 'hooks';
import type { IList, TUserPermissions } from 'typings';

import AcceptedLists from '../components/AcceptedLists';
import { fetchCompletedLists } from '../../list/utils';

interface ICompletedListContainer {
  userId: string;
  completedLists: IList[];
  currentUserPermissions: TUserPermissions;
}

const CompletedListsContainer: React.FC<ICompletedListContainer> = (props): React.JSX.Element => {
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);
  const navigate = useNavigate();

  usePolling(async () => {
    try {
      const lists = await fetchCompletedLists({ navigate });
      /* istanbul ignore else */
      if (lists) {
        const { completedLists: updatedCompletedLists, currentUserPermissions: updatedUserPerms } = lists;
        const isSameSet = (newSet: IList[] | TUserPermissions, oldSet: IList[] | TUserPermissions): boolean =>
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
    } catch (err: unknown) {
      const errorMessage = 'You may not be connected to the internet. Please check your connection.';
      toast(`${errorMessage} Data may be incomplete and user actions may not persist.`, {
        type: 'error',
        autoClose: 5000,
      });
    }
  }, 10000);

  return (
    <React.Fragment>
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
        setIncompleteLists={/* istanbul ignore next */ (): undefined => undefined}
        incompleteLists={[]}
      />
    </React.Fragment>
  );
};

export default CompletedListsContainer;
