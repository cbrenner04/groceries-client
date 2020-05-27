import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Refresh, Trash } from '../../../../components/ActionButtons';

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
      <Trash
        handleClick={() => props.onListDeletion(props.list)}
        disabled={!userIsOwner}
        style={{ opacity: userIsOwner ? 1 : 0.3 }}
        data-test-id="complete-list-trash"
      />
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
};

export default CompletedListButtons;
