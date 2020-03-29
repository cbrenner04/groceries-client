import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Complete, Edit, Share, Trash } from '../../../components/ActionButtons';

function IncompleteListButtons(props) {
  const userIsOwner = props.userId === props.list.owner_id;
  const userHasWritePermission = props.currentUserPermissions === 'write';
  return (
    <ButtonGroup className="float-right">
      <Complete
        handleClick={() => props.onListCompletion(props.list)}
        disabled={!userIsOwner}
        style={{ opacity: userIsOwner ? 1 : 0.3 }}
        data-test-id="incomplete-list-complete"
      />
      <Share
        to={`lists/${props.list.id}/users_lists`}
        disabled={!userHasWritePermission}
        style={{
          pointerEvents: userHasWritePermission ? 'auto' : 'none',
          opacity: userHasWritePermission ? 1 : 0.3,
        }}
        data-test-id="incomplete-list-share"
      />
      <Edit
        to={`/lists/${props.list.id}/edit`}
        disabled={!userIsOwner}
        style={{
          pointerEvents: userIsOwner ? 'auto' : 'none',
          opacity: userIsOwner ? 1 : 0.3,
        }}
        data-test-id="incomplete-list-edit"
      />
      <Trash
        handleClick={() => props.onListDeletion(props.list)}
        disabled={!userIsOwner}
        style={{ opacity: userIsOwner ? 1 : 0.3 }}
        data-test-id="incomplete-list-trash"
      />
    </ButtonGroup>
  );
}

IncompleteListButtons.propTypes = {
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }).isRequired,
  onListCompletion: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
  currentUserPermissions: PropTypes.string,
};

export default IncompleteListButtons;
