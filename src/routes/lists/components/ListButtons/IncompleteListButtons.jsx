import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Complete, EditLink, Merge, Share, Trash } from '../../../../components/ActionButtons';

function IncompleteListButtons(props) {
  const userIsOwner = props.userId === props.list.owner_id;
  const userCanShare = !props.multiSelect && props.currentUserPermissions === 'write';

  return (
    <ButtonGroup className="float-right">
      <Complete
        handleClick={() => props.onListCompletion(props.list)}
        disabled={!userIsOwner}
        style={{
          pointerEvents: userIsOwner ? 'auto' : 'none',
          opacity: userIsOwner ? 1 : 0.3,
        }}
        testID="incomplete-list-complete"
      />
      <Share
        to={`lists/${props.list.id}/users_lists`}
        disabled={!userCanShare}
        style={{
          pointerEvents: userCanShare ? 'auto' : 'none',
          opacity: userCanShare ? 1 : 0.3,
        }}
        testID="incomplete-list-share"
      />
      {props.multiSelect && <Merge handleClick={props.handleMerge} testID="incomplete-list-merge" />}
      {!props.multiSelect && (
        <EditLink
          to={`/lists/${props.list.id}/edit`}
          disabled={!userIsOwner}
          style={{
            pointerEvents: userIsOwner ? 'auto' : 'none',
            opacity: userIsOwner ? 1 : 0.3,
          }}
          testID="incomplete-list-edit"
        />
      )}
      <Trash handleClick={() => props.onListDeletion(props.list)} testID="incomplete-list-trash" />
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
