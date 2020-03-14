import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';

function ConfirmModal(props) {
  return (
    <Modal show={props.show} onHide={props.handleClear}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm {props.action}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.handleClear}>Close</Button>
        <Button variant="primary" onClick={props.handleConfirm} data-test-id={`confirm-${props.action}`}>
          Yes, I&apos;m sure.
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  action: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  handleConfirm: PropTypes.func.isRequired,
  handleClear: PropTypes.func.isRequired,
};

export default ConfirmModal;
