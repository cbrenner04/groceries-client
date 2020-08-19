import React from 'react';
import PropTypes from 'prop-types';

import AcceptedLists from './AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';

const IncompleteLists = (props) => (
  <AcceptedLists
    title={
      <TitlePopover
        title="Incomplete"
        message="These are lists you've created or you've accepted an invitation from someone else."
      />
    }
    completed={false}
    fullList={false}
    history={props.history}
    userId={props.userId}
    incompleteLists={props.incompleteLists}
    setIncompleteLists={props.setIncompleteLists}
    completedLists={props.completedLists}
    setCompletedLists={props.setCompletedLists}
    currentUserPermissions={props.currentUserPermissions}
    setCurrentUserPermissions={props.setCurrentUserPermissions}
  />
);

IncompleteLists.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.number.isRequired,
  incompleteLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number.isRequired,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  setIncompleteLists: PropTypes.func.isRequired,
  completedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number.isRequired,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  setCompletedLists: PropTypes.func.isRequired,
  currentUserPermissions: PropTypes.objectOf(PropTypes.string).isRequired,
  setCurrentUserPermissions: PropTypes.func.isRequired,
};

export default IncompleteLists;
