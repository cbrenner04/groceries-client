import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import AcceptedLists from './AcceptedLists';
import TitlePopover from '../../../components/TitlePopover';

function CompleteLists(props) {
  const message = props.fullList ? (
    'Previously refreshed lists are marked with an asterisk (*).'
  ) : (
    <>
      These are the completed lists most recently created.&nbsp;
      <Link to="/completed_lists">See all completed lists here.</Link>&nbsp; Previously refreshed lists are marked with
      an asterisk (*).
    </>
  );
  return (
    <AcceptedLists
      title={<TitlePopover title="Completed" message={message} />}
      completed={true}
      fullList={props.fullList}
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
}

CompleteLists.propTypes = {
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
  ),
  setIncompleteLists: PropTypes.func,
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
  fullList: PropTypes.bool,
};

/* istanbul ignore next */
CompleteLists.defaultProps = {
  fullList: false,
  incompleteLists: [],
  setIncompleteLists: () => undefined,
};

export default CompleteLists;
