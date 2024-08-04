import React, { type ChangeEventHandler, type MouseEventHandler } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

import { TextField } from 'components/FormFields';

export interface IMergeModalProps {
  showModal: boolean;
  clearModal: () => void;
  listNames: string;
  mergeName: string;
  handleMergeConfirm: MouseEventHandler;
  handleMergeNameChange: ChangeEventHandler;
}

const MergeModal: React.FC<IMergeModalProps> = (props): React.JSX.Element => {
  return (
    <Modal show={props.showModal} onHide={props.clearModal}>
      <Modal.Header closeButton>
        <Modal.Title>Merge {`"${props.listNames}"`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <TextField
            name="mergeName"
            label="Name for the merged list"
            value={props.mergeName}
            handleChange={props.handleMergeNameChange}
            placeholder="My super cool list"
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.clearModal} data-test-id={'clear-merge'}>
          Close
        </Button>
        <Button
          variant="primary"
          onClick={props.handleMergeConfirm}
          data-test-id={'confirm-merge'}
          disabled={!props.mergeName}
          className={props.mergeName ? 'merge-modal-confirm-enabled' : 'merge-modal-confirm-disabled'}
        >
          Merge lists
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MergeModal;
