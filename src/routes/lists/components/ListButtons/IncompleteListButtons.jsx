import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Complete, Edit, Merge, Share, Trash } from '../../../../components/ActionButtons';

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
      {props.multiSelect && <Merge handleClick={props.handleMerge} data-test-id="incomplete-list-merge" />}
      {!props.multiSelect && (
        <Edit
          to={`/lists/${props.list.id}/edit`}
          disabled={!userIsOwner}
          style={{
            pointerEvents: userIsOwner ? 'auto' : 'none',
            opacity: userIsOwner ? 1 : 0.3,
          }}
          data-test-id="incomplete-list-edit"
        />
      )}
      <Trash handleClick={() => props.onListDeletion(props.list)} data-test-id="incomplete-list-trash" />
    </ButtonGroup>
  );
}

IncompleteListButtons.propTypes = {
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    owner_id: PropTypes.number.isRequired,
  }).isRequired,
  onListCompletion: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
  currentUserPermissions: PropTypes.string.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  handleMerge: PropTypes.func.isRequired,
};

export default IncompleteListButtons;
