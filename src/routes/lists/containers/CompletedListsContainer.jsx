import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import AcceptedLists from '../components/AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';

function CompletedListsContainer(props) {
  const [completedLists, setCompletedLists] = useState(props.completedLists);
  const [currentUserPermissions, setCurrentUserPermissions] = useState(props.currentUserPermissions);

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
  completedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.string,
      owner_id: PropTypes.string,
      user_id: PropTypes.string.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default CompletedListsContainer;
