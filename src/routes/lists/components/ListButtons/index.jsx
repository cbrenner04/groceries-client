import React from 'react';
import PropTypes from 'prop-types';

import CompletedListButtons from './CompleteListButtons';
import IncompleteListButtons from './IncompleteListButtons';
import PendingListButtons from './PendingListButtons';

function ListButtons(props) {
  const acceptedListButtons = props.list.completed ? (
    <CompletedListButtons
      userId={props.userId}
      list={props.list}
      onListRefresh={props.onListRefresh}
      onListDeletion={props.onListDeletion}
    />
  ) : (
    <IncompleteListButtons
      userId={props.userId}
      list={props.list}
      onListCompletion={props.onListCompletion}
      onListDeletion={props.onListDeletion}
      currentUserPermissions={props.currentUserPermissions}
    />
  );

  return props.accepted ? (
    acceptedListButtons
  ) : (
    <PendingListButtons
      list={props.list}
      onListAcceptance={props.onListAcceptance}
      onListRejection={props.onListRejection}
    />
  );
}

ListButtons.propTypes = {
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    created_at: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
    refreshed: PropTypes.bool,
  }).isRequired,
  accepted: PropTypes.bool,
  onListDeletion: PropTypes.func,
  onListCompletion: PropTypes.func,
  onListRefresh: PropTypes.func,
  onListAcceptance: PropTypes.func,
  onListRejection: PropTypes.func,
  currentUserPermissions: PropTypes.string.isRequired,
};

ListButtons.defaultProps = {
  onListDeletion: () => undefined,
  onListCompletion: () => undefined,
  onListRefresh: () => undefined,
  accepted: false,
  onListAcceptance: () => undefined,
  onListRejection: () => undefined,
};

export default ListButtons;