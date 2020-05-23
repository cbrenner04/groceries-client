import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Refresh, Trash } from '../../../../components/ActionButtons';

const CompletedListButtons = (props) => (
  <ButtonGroup className="float-right">
    <Refresh
      handleClick={() => props.onListRefresh(props.list)}
      disabled={props.userId !== props.list.owner_id}
      style={{ opacity: props.userId !== props.list.owner_id ? 0.3 : 1 }}
      data-test-id="complete-list-refresh"
    />
    <Trash
      handleClick={() => props.onListDeletion(props.list)}
      disabled={props.userId !== props.list.owner_id}
      style={{ opacity: props.userId !== props.list.owner_id ? 0.3 : 1 }}
      data-test-id="complete-list-trash"
    />
  </ButtonGroup>
);

CompletedListButtons.propTypes = {
  userId: PropTypes.number.isRequired,
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }).isRequired,
  onListRefresh: PropTypes.func.isRequired,
  onListDeletion: PropTypes.func.isRequired,
};

export default CompletedListButtons;
