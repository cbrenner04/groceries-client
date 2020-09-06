import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import AcceptedLists from '../components/AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';
import { list } from '../../../types';
import { fetchCompletedLists } from '../utils';
import { usePolling } from '../../../hooks';

function CompletedListsContainer(props) {
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);

  usePolling(async () => {
    const {
      completedLists: updatedCompletedLists,
      currentUserPermissions: updatedUserPerms,
    } = await fetchCompletedLists({ history: props.history });
    const isSameSet = (newSet, oldSet) => JSON.stringify(newSet) === JSON.stringify(oldSet);
    const completedSame = isSameSet(updatedCompletedLists, completedLists);
    const userPermsSame = isSameSet(updatedUserPerms, currentUserPermissions);
    if (!completedSame) {
      setCompletedLists(updatedCompletedLists);
    }
    if (!userPermsSame) {
      setCurrentUserPermissions(updatedUserPerms);
    }
  }, 10000);

  return (
    <>
      <div className="clearfix mb-3">
        <Link to="/lists" className="float-right">
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
        history={props.history}
        userId={props.userId}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
      />
    </>
  );
}

CompletedListsContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  completedLists: PropTypes.arrayOf(list).isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default CompletedListsContainer;
