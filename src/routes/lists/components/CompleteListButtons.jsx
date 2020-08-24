import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Refresh, Trash, Merge } from '../../../components/ActionButtons';

function CompletedListButtons(props) {
  const userIsOwner = props.userId === props.list.owner_id;

  return (
    <ButtonGroup className="float-right">
      <Refresh
        handleClick={() => props.onListRefresh(props.list)}
        disabled={!userIsOwner || props.pending}
        style={{
          pointerEvents: userIsOwner && !props.pending ? 'auto' : 'none',
          opacity: userIsOwner && !props.pending ? 1 : 0.3,
        }}
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

CompletedListButtons.propTypes = {
  userId: PropTypes.string.isRequired,
  list: PropTypes.shape({
    owner_id: PropTypes.string.isRequired,
  }).isRequired,
  onListRefresh: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      type: PropTypes.string,
      created_at: PropTypes.string,
      completed: PropTypes.bool,
      users_list_id: PropTypes.string,
      owner_id: PropTypes.string,
      refreshed: PropTypes.bool,
    }),
  ).isRequired,
  handleMerge: PropTypes.func.isRequired,
  pending: PropTypes.bool.isRequired,
};

export default CompletedListButtons;
