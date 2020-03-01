import React from 'react';
import PropTypes from 'prop-types';

const PendingListButtons = props => (
  <div className="btn-group float-right" role="group">
    <button
      onClick={() => props.onListAcceptance(props.list)}
      className="btn btn-link p-0 mr-3"
      data-test-id="pending-list-accept"
    >
      <i className="fa fa-check-square-o fa-2x text-success" />
    </button>
    <button
      onClick={() => props.onListRejection(props.list)}
      className="btn btn-link p-0 mr-3"
      data-test-id="pending-list-trash"
    >
      <i className="fa fa-trash fa-2x text-danger" />
    </button>
  </div>
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
