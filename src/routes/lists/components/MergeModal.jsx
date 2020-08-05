import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal } from 'react-bootstrap';

import { TextField } from '../../../components/FormFields';

function MergeModal({ showModal, clearModal, listNames, mergeName, handleMergeConfirm, handleMergeNameChange }) {
  return (
    <Modal show={showModal} onHide={clearModal}>
      <Modal.Header closeButton>
        <Modal.Title>Merge {`"${listNames}"`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <TextField
            name="mergeName"
            label="Name for the merged list"
            value={mergeName}
            handleChange={handleMergeNameChange}
            placeholder="My super cool list"
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={clearModal} data-test-id={`clear-merge`}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleMergeConfirm}
          data-test-id={`confirm-merge`}
          disabled={!mergeName}
          style={{ pointerEvents: mergeName ? 'auto' : 'none' }}
        >
          Merge lists
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

MergeModal.propTypes = {
  showModal: PropTypes.bool.isRequired,
  clearModal: PropTypes.func.isRequired,
  listNames: PropTypes.string.isRequired,
  mergeName: PropTypes.string.isRequired,
  handleMergeConfirm: PropTypes.func.isRequired,
  handleMergeNameChange: PropTypes.func.isRequired,
};

export default MergeModal;
