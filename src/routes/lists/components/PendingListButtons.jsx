import React from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'react-bootstrap';

import { Complete, Trash } from '../../../components/ActionButtons';

const PendingListButtons = props => (
  <ButtonGroup className="float-right">
    <Complete handleClick={() => props.onListAcceptance(props.list)} data-test-id="pending-list-accept"/>
    <Trash handleClick={() => props.onListRejection(props.list)} data-test-id="pending-list-trash"/>
  </ButtonGroup>
);

PendingListButtons.propTypes = {
  list: PropTypes.shape({
    id: PropTypes.number.isRequired,
    users_list_id: PropTypes.number,
    owner_id: PropTypes.number,
  }).isRequired,
  onListAcceptance: PropTypes.func.isRequired,
  onListRejection: PropTypes.func.isRequired,
};

export default PendingListButtons;
