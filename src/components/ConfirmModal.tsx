import React, { type MouseEventHandler } from 'react';
import { Button, Modal } from 'react-bootstrap';

export interface IConfirmModalProps {
  action: string;
  body: string;
  show: boolean;
  handleConfirm: MouseEventHandler;
  handleClear: () => void;
}

const ConfirmModal: React.FC<IConfirmModalProps> = ({
  action,
  body,
  show,
  handleConfirm,
  handleClear,
}): React.JSX.Element => (
  <Modal show={show} onHide={handleClear}>
    <Modal.Header closeButton>
      <Modal.Title>Confirm {action}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{body}</Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={handleClear} data-test-id={`clear-${action}`}>
        Close
      </Button>
      <Button variant="primary" onClick={handleConfirm} data-test-id={`confirm-${action}`}>
        Yes, I&apos;m sure.
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
