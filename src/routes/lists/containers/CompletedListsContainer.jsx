import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import CompleteLists from '../components/CompleteLists';

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
      <CompleteLists
        history={props.history}
        userId={props.userId}
        completedLists={completedLists}
        setCompletedLists={setCompletedLists}
        currentUserPermissions={currentUserPermissions}
        setCurrentUserPermissions={setCurrentUserPermissions}
        fullList={true}
      />
    </>
  );
}

CompletedListsContainer.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.number.isRequired,
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
