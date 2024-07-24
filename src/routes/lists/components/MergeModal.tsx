import React, { ChangeEventHandler, MouseEventHandler } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { TextField } from '../../../components/FormFields';

interface IMergeModalProps {
  showModal: boolean;
  clearModal: () => void;
  listNames: string;
  mergeName: string;
  handleMergeConfirm: MouseEventHandler;
  handleMergeNameChange: ChangeEventHandler;
}

const MergeModal: React.FC<IMergeModalProps> = ({
  showModal,
  clearModal,
  listNames,
  mergeName,
  handleMergeConfirm,
  handleMergeNameChange,
}) => {
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
          className={mergeName ? 'merge-modal-confirm-enabled' : 'merge-modal-confirm-disabled'}
        >
          Merge lists
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MergeModal;
