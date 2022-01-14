import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Refresh, Trash, Merge } from '../../../components/ActionButtons';
import { list } from '../../../types';

function CompleteListButtons(props) {
  const userIsOwner = props.userId === props.list.owner_id;

  return (
    <ButtonGroup className="float-end">
      <Refresh
        handleClick={() => props.onListRefresh(props.list)}
        disabled={!userIsOwner || props.pending}
        classes={userIsOwner && !props.pending ? 'list-button-enabled' : 'list-button-disabled'}
        testID="complete-list-refresh"
      />
      {props.multiSelect && props.selectedLists.length > 1 && (
        <Merge handleClick={props.handleMerge} testID="complete-list-merge" disabled={props.pending} />
      )}
      <Trash
        handleClick={() => props.onListDeletion(props.list)}
        testID="complete-list-trash"
        disabled={props.pending}
      />
    </ButtonGroup>
  );
}

CompleteListButtons.propTypes = {
  userId: PropTypes.string.isRequired,
  list: list.isRequired,
  onListRefresh: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedLists: PropTypes.arrayOf(list).isRequired,
  handleMerge: PropTypes.func.isRequired,
  pending: PropTypes.bool.isRequired,
};

export default CompleteListButtons;
