import React from 'react';
import PropTypes from 'prop-types';

function ConfirmModal(props) {
  return (
    <div
      className="modal fade"
      id={props.name}
      tabIndex="-1"
      role="dialog"
      aria-labelledby={`${props.name}-label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${props.name}-label`}>Confirm {props.action}</h5>
            <button
              onClick={props.handleClear}
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {props.body}
          </div>
          <div className="modal-footer">
            <button
              onClick={props.handleClear}
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
            >
              Close
            </button>
            <button
              onClick={props.handleConfirm}
              type="button"
              className="btn btn-primary"
              data-test-id={`confirm-${props.action}`}
            >
              Yes, I&apos;m sure.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ConfirmModal.propTypes = {
  name: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  handleClear: PropTypes.func.isRequired,
};

export default ConfirmModal;
