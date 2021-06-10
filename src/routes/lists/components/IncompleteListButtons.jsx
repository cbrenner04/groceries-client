import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Complete, EditLink, Merge, Share, Trash } from '../../../components/ActionButtons';
import { list } from '../../../types';

function IncompleteListButtons(props) {
  const userIsOwner = props.userId === props.list.owner_id;
  const multipleListsSelected = props.multiSelect && props.selectedLists.length > 1;
  const userCanShare = props.currentUserPermissions === 'write';

  return (
    <ButtonGroup className="float-right">
      <Complete
        handleClick={() => props.onListCompletion(props.list)}
        disabled={!userIsOwner || props.pending}
        classes={userIsOwner && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
        testID="incomplete-list-complete"
      />
      {!multipleListsSelected && (
        <Share
          to={`lists/${props.list.id}/users_lists`}
          disabled={!userCanShare || props.pending}
          classes={userCanShare && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
          testID="incomplete-list-share"
        />
      )}
      {multipleListsSelected && (
        <Merge handleClick={props.handleMerge} testID="incomplete-list-merge" disabled={props.pending} />
      )}
      {!multipleListsSelected && (
        <EditLink
          to={`/lists/${props.list.id}/edit`}
          disabled={!userIsOwner || props.pending}
          classes={userIsOwner && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
          testID="incomplete-list-edit"
        />
      )}
      <Trash
        handleClick={() => props.onListDeletion(props.list)}
        testID="incomplete-list-trash"
        disabled={props.pending}
      />
    </ButtonGroup>
  );
}

IncompleteListButtons.propTypes = {
  userId: PropTypes.string.isRequired,
  list: list.isRequired,
  onListCompletion: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
  currentUserPermissions: PropTypes.string.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  handleMerge: PropTypes.func.isRequired,
  selectedLists: PropTypes.arrayOf(list).isRequired,
  pending: PropTypes.bool.isRequired,
};

export default IncompleteListButtons;
