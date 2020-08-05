import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Refresh, Trash, Merge } from '../../../../components/ActionButtons';

function CompletedListButtons(props) {
  const userIsOwner = props.userId === props.list.owner_id;

  return (
    <ButtonGroup className="float-right">
      <Refresh
        handleClick={() => props.onListRefresh(props.list)}
        disabled={!userIsOwner}
        style={{ opacity: userIsOwner ? 1 : 0.3 }}
        data-test-id="complete-list-refresh"
      />
      {props.multiSelect && props.selectedLists.length > 1 && (
        <Merge handleClick={props.handleMerge} data-test-id="complete-list-merge" />
      )}
      <Trash handleClick={() => props.onListDeletion(props.list)} data-test-id="complete-list-trash" />
    </ButtonGroup>
  );
}

CompletedListButtons.propTypes = {
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    owner_id: PropTypes.number.isRequired,
  }).isRequired,
  onListRefresh: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
  multiSelect: PropTypes.bool.isRequired,
  selectedLists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      completed: PropTypes.bool.isRequired,
      users_list_id: PropTypes.number,
      owner_id: PropTypes.number.isRequired,
      refreshed: PropTypes.bool.isRequired,
    }).isRequired,
  ).isRequired,
  handleMerge: PropTypes.func.isRequired,
};

export default CompletedListButtons;
